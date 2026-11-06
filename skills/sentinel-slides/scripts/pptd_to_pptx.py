#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "pyyaml>=6.0",
#     "python-pptx>=1.0.0",
#     "Pillow>=10.0.0",
#     "lxml>=5.0.0",
# ]
# ///
"""
Local PPTD v2 -> PPTX Compiler for Sentinel AI (`sentinel-slides` skill).

Compiles a `.pptd` project directory (or `.pptd` entry file) along with its
`pages/*.page` and `media/*` assets into a standard `.pptx` presentation.
"""

from __future__ import annotations

import argparse
import html.parser
import io
import math
import os
import re
import sys
import tempfile
from pathlib import Path
from typing import Any

# Automatically inject the skill's local `.venv` site-packages if available
_SKILL_ROOT = Path(__file__).resolve().parent.parent
for _site in (_SKILL_ROOT / ".venv" / "lib").glob("python*/site-packages"):
    if str(_site) not in sys.path:
        sys.path.insert(0, str(_site))

import yaml  # noqa: E402
from lxml import etree  # noqa: E402
from PIL import Image as PilImage  # noqa: E402
from pptx import Presentation  # noqa: E402
from pptx.dml.color import RGBColor  # noqa: E402
from pptx.enum.dml import MSO_LINE_DASH_STYLE  # noqa: E402
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE  # noqa: E402
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN  # noqa: E402
from pptx.oxml.ns import qn  # noqa: E402
from pptx.util import Emu, Pt  # noqa: E402

A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"

CHART_PALETTE = [
    "#1783FE",
    "#67B8A6",
    "#C9A869",
    "#8A84C7",
    "#8C98A8",
    "#5E9CF4",
    "#7AB5D7",
    "#B08A9C",
    "#333333",
    "#DCDCDC",
]


def pt_to_emu(px_or_pt: float | int) -> int:
    return int(round(float(px_or_pt) * 12700))


class ThemeResolver:
    def __init__(self, theme_dict: dict[str, Any] | None) -> None:
        theme_dict = theme_dict or {}
        self.colors: dict[str, str] = {}
        for k, v in (theme_dict.get("colors") or {}).items():
            self.colors[str(k)] = str(v)
        self.text_styles: dict[str, dict[str, Any]] = {}
        for k, v in (theme_dict.get("textStyles") or {}).items():
            if isinstance(v, dict):
                self.text_styles[str(k)] = v
        self.table_styles: dict[str, dict[str, Any]] = {}
        for k, v in (theme_dict.get("tableStyles") or {}).items():
            if isinstance(v, dict):
                self.table_styles[str(k)] = v

    def resolve_color_str(self, value: Any, default: str = "#000000") -> str:
        if not value or not isinstance(value, str):
            return default
        val = value.strip()
        visited = set()
        while val.startswith("$"):
            key = val[1:]
            if key in visited or key not in self.colors:
                break
            visited.add(key)
            val = self.colors[key].strip()
        if not val.startswith("#"):
            return default
        return val

    def parse_color(self, value: Any, default: str = "#000000") -> tuple[RGBColor, float]:
        """Returns (RGBColor, opacity_0_to_1)."""
        hex_str = self.resolve_color_str(value, default).lstrip("#")
        if len(hex_str) == 3:
            hex_str = "".join(c * 2 for c in hex_str)
        if len(hex_str) == 6:
            r = int(hex_str[0:2], 16)
            g = int(hex_str[2:4], 16)
            b = int(hex_str[4:6], 16)
            return RGBColor(r, g, b), 1.0
        if len(hex_str) == 8:
            r = int(hex_str[0:2], 16)
            g = int(hex_str[2:4], 16)
            b = int(hex_str[4:6], 16)
            a = int(hex_str[6:8], 16) / 255.0
            return RGBColor(r, g, b), a
        return RGBColor(0, 0, 0), 1.0

    def get_text_style(self, ref: Any) -> dict[str, Any]:
        if isinstance(ref, str) and ref.startswith("$"):
            return dict(self.text_styles.get(ref[1:], {}))
        if isinstance(ref, str):
            return dict(self.text_styles.get(ref, {}))
        return {}

    def get_table_style(self, ref: Any) -> dict[str, Any]:
        if isinstance(ref, dict):
            return ref
        if isinstance(ref, str):
            key = ref[1:] if ref.startswith("$") else ref
            return dict(self.table_styles.get(key, {}))
        return {}


def parse_font_family(font_spec: Any, default_font: str = "MiSans") -> tuple[str, str]:
    """Returns (latin_font, ea_font)."""
    if isinstance(font_spec, dict):
        latin = str(font_spec.get("latin") or font_spec.get("ea") or default_font)
        ea = str(font_spec.get("ea") or font_spec.get("latin") or default_font)
        return latin, ea
    if isinstance(font_spec, str) and font_spec.strip():
        parts = [p.strip().strip("'\"") for p in font_spec.split(",") if p.strip()]
        primary = parts[0] if parts else default_font
        return primary, primary
    return default_font, default_font


def apply_srgb_alpha(color_format: Any, rgb: RGBColor, alpha: float) -> None:
    color_format.rgb = rgb
    if alpha < 0.999:
        val = max(0, min(100000, int(round(alpha * 100000))))
        x_clr = getattr(getattr(color_format, "_color", None), "_xClr", None)
        if x_clr is not None:
            for existing in x_clr.findall(qn("a:alpha")):
                x_clr.remove(existing)
            alpha_el = etree.SubElement(x_clr, qn("a:alpha"))
            alpha_el.set("val", str(val))


def apply_fill_to_shape(
    shape: Any,
    fill_spec: dict[str, Any] | None,
    theme: ThemeResolver,
    element_opacity: float = 1.0,
) -> None:
    if not fill_spec or not isinstance(fill_spec, dict):
        shape.fill.background()
        return
    fill_type = fill_spec.get("type", "solid")
    if fill_type == "solid":
        rgb, alpha = theme.parse_color(fill_spec.get("color"), "#FFFFFF")
        shape.fill.solid()
        apply_srgb_alpha(shape.fill.fore_color, rgb, alpha * element_opacity)
    elif fill_type == "gradient":
        stops = fill_spec.get("stops") or []
        if stops:
            first_color = stops[0].get("color", "#FFFFFF")
            rgb, alpha = theme.parse_color(first_color, "#FFFFFF")
            shape.fill.solid()
            apply_srgb_alpha(shape.fill.fore_color, rgb, alpha * element_opacity)
            # Upgrade spPr solidFill to gradFill in XML if >= 2 stops
            if len(stops) >= 2:
                sp_pr = shape._element.find(qn("p:spPr"))
                if sp_pr is not None:
                    for old in list(sp_pr):
                        if old.tag.endswith(("noFill", "solidFill", "gradFill", "blipFill")):
                            sp_pr.remove(old)
                    grad_fill = etree.Element(qn("a:gradFill"))
                    gs_lst = etree.SubElement(grad_fill, qn("a:gsLst"))
                    for stop in stops:
                        pos = float(stop.get("position", 0.0))
                        pos_val = max(0, min(100000, int(round(pos * 100000))))
                        s_rgb, s_alpha = theme.parse_color(stop.get("color"), "#FFFFFF")
                        gs = etree.SubElement(gs_lst, qn("a:gs"))
                        gs.set("pos", str(pos_val))
                        srgb_el = etree.SubElement(gs, qn("a:srgbClr"))
                        srgb_el.set("val", f"{s_rgb[0]:02X}{s_rgb[1]:02X}{s_rgb[2]:02X}")
                        comb_alpha = s_alpha * element_opacity
                        if comb_alpha < 0.999:
                            a_el = etree.SubElement(srgb_el, qn("a:alpha"))
                            a_el.set("val", str(max(0, min(100000, int(round(comb_alpha * 100000))))))
                    lin = etree.SubElement(grad_fill, qn("a:lin"))
                    angle = float(fill_spec.get("angle", 0.0)) % 360.0
                    lin.set("ang", str(int(round(angle * 60000))))
                    lin.set("scaled", "1")
                    # Insert gradFill right after prstGeom/custGeom/xfrm
                    insert_idx = 0
                    for idx, child in enumerate(sp_pr):
                        if child.tag.endswith(("xfrm", "prstGeom", "custGeom")):
                            insert_idx = idx + 1
                    sp_pr.insert(insert_idx, grad_fill)
        else:
            shape.fill.background()
    else:
        shape.fill.background()


def apply_border_to_shape(
    shape: Any,
    border_spec: dict[str, Any] | None,
    theme: ThemeResolver,
    element_opacity: float = 1.0,
) -> None:
    if not border_spec or not isinstance(border_spec, dict):
        shape.line.fill.background()
        return
    width = float(border_spec.get("width", 1.0))
    if width <= 0:
        shape.line.fill.background()
        return
    rgb, alpha = theme.parse_color(border_spec.get("color"), "#000000")
    shape.line.width = Pt(width)
    apply_srgb_alpha(shape.line.color, rgb, alpha * element_opacity)
    style = str(border_spec.get("style", "solid")).lower()
    if style == "dash":
        shape.line.dash_style = MSO_LINE_DASH_STYLE.DASH
    elif style == "dot":
        shape.line.dash_style = MSO_LINE_DASH_STYLE.ROUND_DOT
    else:
        shape.line.dash_style = MSO_LINE_DASH_STYLE.SOLID


def set_shape_geometry(shape: Any, shape_name: str, adjustments: list[Any] | None) -> None:
    sp_pr = shape._element.find(qn("p:spPr"))
    if sp_pr is None:
        return
    prst_geom = sp_pr.find(qn("a:prstGeom"))
    if prst_geom is None:
        return
    # Map PPTD shapeName directly to OOXML preset geometry name
    ooxml_name = shape_name if shape_name and shape_name != "custom" else "rect"
    prst_geom.set("prst", ooxml_name)
    av_lst = prst_geom.find(qn("a:avLst"))
    if av_lst is None:
        av_lst = etree.SubElement(prst_geom, qn("a:avLst"))
    else:
        for child in list(av_lst):
            av_lst.remove(child)
    if adjustments and isinstance(adjustments, list):
        if len(adjustments) == 1:
            gd = etree.SubElement(av_lst, qn("a:gd"))
            gd.set("name", "adj")
            gd.set("fmla", f"val {int(round(float(adjustments[0])))}")
        else:
            for idx, val in enumerate(adjustments, start=1):
                gd = etree.SubElement(av_lst, qn("a:gd"))
                gd.set("name", f"adj{idx}")
                gd.set("fmla", f"val {int(round(float(val)))}")


def parse_inline_css(style_str: str) -> dict[str, str]:
    result: dict[str, str] = {}
    if not style_str:
        return result
    for part in style_str.split(";"):
        if ":" not in part:
            continue
        k, v = part.split(":", 1)
        result[k.strip().lower()] = v.strip()
    return result


class RichTextRun:
    def __init__(self, text: str, props: dict[str, Any]) -> None:
        self.text = text
        self.props = dict(props)


class RichTextParagraph:
    def __init__(self, props: dict[str, Any], is_list_item: bool = False, list_ordered: bool = False, list_index: int = 1) -> None:
        self.props = dict(props)
        self.runs: list[RichTextRun] = []
        self.is_list_item = is_list_item
        self.list_ordered = list_ordered
        self.list_index = list_index


class RichTextHTMLParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.paragraphs: list[RichTextParagraph] = []
        self._current_para: RichTextParagraph | None = None
        self._style_stack: list[dict[str, Any]] = [{}]
        self._list_stack: list[tuple[bool, int]] = []  # (is_ordered, counter)

    def _ensure_para(self) -> RichTextParagraph:
        if self._current_para is None:
            self._current_para = RichTextParagraph({})
            self.paragraphs.append(self._current_para)
        return self._current_para

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        attr_map = {k.lower(): (v or "") for k, v in attrs}
        css = parse_inline_css(attr_map.get("style", ""))

        if tag == "ul":
            self._list_stack.append((False, 0))
            return
        if tag == "ol":
            self._list_stack.append((True, 0))
            return

        if tag in ("p", "li"):
            p_props: dict[str, Any] = {}
            if "text-align" in css:
                p_props["text_align"] = css["text-align"]
            if "line-height" in css:
                lh = css["line-height"]
                if lh.endswith("px"):
                    try:
                        p_props["line_height_px"] = float(lh[:-2].strip())
                    except ValueError:
                        pass
                else:
                    try:
                        p_props["line_height"] = float(lh)
                    except ValueError:
                        pass
            if "margin-top" in css:
                mt = css["margin-top"].removesuffix("px").strip()
                try:
                    p_props["margin_top"] = float(mt)
                except ValueError:
                    pass
            is_li = tag == "li"
            ordered = False
            idx = 1
            if is_li and self._list_stack:
                ordered, count = self._list_stack[-1]
                idx = count + 1
                self._list_stack[-1] = (ordered, idx)
            self._current_para = RichTextParagraph(p_props, is_list_item=is_li, list_ordered=ordered, list_index=idx)
            self.paragraphs.append(self._current_para)
            # Also push any inline styles placed directly on <p> or <li>
            new_inline = dict(self._style_stack[-1])
            self._apply_css_to_inline(css, new_inline)
            self._style_stack.append(new_inline)
            return

        if tag == "br":
            para = self._ensure_para()
            para.runs.append(RichTextRun("\n", self._style_stack[-1]))
            return

        new_style = dict(self._style_stack[-1])
        if tag in ("strong", "b"):
            new_style["bold"] = True
        elif tag in ("em", "i"):
            new_style["italic"] = True
        elif tag == "u":
            new_style["underline"] = True
        elif tag in ("s", "strike", "del"):
            new_style["strike"] = True
        elif tag == "sup":
            new_style["superscript"] = True
        elif tag == "sub":
            new_style["subscript"] = True
        elif tag == "a":
            new_style["href"] = attr_map.get("href", "")
            new_style["underline"] = True
            if "color" not in new_style:
                new_style["color"] = "#2563EB"
        self._apply_css_to_inline(css, new_style)
        self._style_stack.append(new_style)

    def _apply_css_to_inline(self, css: dict[str, str], target: dict[str, Any]) -> None:
        if "color" in css:
            target["color"] = css["color"]
        if "font-size" in css:
            fs = css["font-size"].removesuffix("px").removesuffix("pt").strip()
            try:
                target["fontSize"] = float(fs)
            except ValueError:
                pass
        if "font-family" in css:
            target["fontFamily"] = css["font-family"]
        if "background-color" in css:
            target["backgroundColor"] = css["background-color"]
        if "font-weight" in css:
            fw = css["font-weight"].lower()
            if fw in ("bold", "600", "700", "800", "900"):
                target["bold"] = True
            elif fw in ("normal", "400", "300"):
                target["bold"] = False
        if "font-style" in css:
            if css["font-style"].lower() == "italic":
                target["italic"] = True

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in ("ul", "ol"):
            if self._list_stack:
                self._list_stack.pop()
            return
        if tag in ("p", "li"):
            if len(self._style_stack) > 1:
                self._style_stack.pop()
            self._current_para = None
            return
        if tag == "br":
            return
        if len(self._style_stack) > 1:
            self._style_stack.pop()

    def handle_data(self, data: str) -> None:
        if not data:
            return
        if self._current_para is None and not data.strip():
            return
        para = self._ensure_para()
        para.runs.append(RichTextRun(data, self._style_stack[-1]))


def parse_rich_text(raw_text: Any) -> list[RichTextParagraph]:
    if raw_text is None:
        return []
    text = str(raw_text)
    if not text.strip():
        return []
    stripped = text.strip()
    has_block_tags = bool(re.search(r"<\s*(p|ul|ol|li)\b", stripped, re.IGNORECASE))
    if not has_block_tags:
        # Wrap plain lines or inline-only HTML in <p> blocks
        lines = stripped.splitlines()
        wrapped = "".join(f"<p>{line}</p>" for line in lines) if lines else f"<p>{stripped}</p>"
    else:
        wrapped = stripped
    parser = RichTextHTMLParser()
    parser.feed(wrapped)
    return parser.paragraphs


def map_h_align(align_str: str | None) -> PP_ALIGN:
    val = (align_str or "left").lower()
    if val == "center":
        return PP_ALIGN.CENTER
    if val == "right":
        return PP_ALIGN.RIGHT
    if val == "justify":
        return PP_ALIGN.JUSTIFY
    if val == "distributed":
        return PP_ALIGN.DISTRIBUTE
    return PP_ALIGN.LEFT


def map_v_align(align_str: str | None) -> MSO_ANCHOR:
    val = (align_str or "top").lower()
    if val == "middle":
        return MSO_ANCHOR.MIDDLE
    if val == "bottom":
        return MSO_ANCHOR.BOTTOM
    return MSO_ANCHOR.TOP


def set_run_ea_and_styles(
    run: Any,
    latin_font: str,
    ea_font: str,
    rgb: RGBColor,
    alpha: float,
    strike: bool = False,
    superscript: bool = False,
    subscript: bool = False,
    letter_spacing: float | None = None,
    bg_color: tuple[RGBColor, float] | None = None,
) -> None:
    run.font.name = latin_font
    r_pr = run._r.get_or_add_rPr()
    if letter_spacing is not None and letter_spacing != 0:
        r_pr.set("spc", str(int(round(float(letter_spacing) * 100))))
    if strike:
        r_pr.set("strike", "sngStrike")
    if superscript:
        r_pr.set("baseline", "30000")
    elif subscript:
        r_pr.set("baseline", "-25000")

    apply_srgb_alpha(run.font.color, rgb, alpha)

    # Ensure East Asian font is explicitly set so CJK text uses the exact font
    for existing_ea in r_pr.findall(qn("a:ea")):
        r_pr.remove(existing_ea)
    ea_el = etree.SubElement(r_pr, qn("a:ea"))
    ea_el.set("typeface", ea_font)

    if bg_color is not None:
        bg_rgb, bg_alpha = bg_color
        for existing_hl in r_pr.findall(qn("a:highlight")):
            r_pr.remove(existing_hl)
        hl = etree.SubElement(r_pr, qn("a:highlight"))
        srgb = etree.SubElement(hl, qn("a:srgbClr"))
        srgb.set("val", f"{bg_rgb[0]:02X}{bg_rgb[1]:02X}{bg_rgb[2]:02X}")
        if bg_alpha < 0.999:
            a_el = etree.SubElement(srgb, qn("a:alpha"))
            a_el.set("val", str(max(0, min(100000, int(round(bg_alpha * 100000))))))


def populate_text_frame(
    tf: Any,
    raw_text: Any,
    base_style: dict[str, Any],
    theme: ThemeResolver,
    element_opacity: float = 1.0,
) -> None:
    tf.word_wrap = bool(base_style.get("wrap", True))
    tf.margin_left = Pt(0)
    tf.margin_right = Pt(0)
    tf.margin_top = Pt(0)
    tf.margin_bottom = Pt(0)

    align = base_style.get("align")
    default_h_align = "left"
    default_v_align = "top"
    if isinstance(align, (list, tuple)) and len(align) >= 2:
        default_h_align = str(align[0])
        default_v_align = str(align[1])
    tf.vertical_anchor = map_v_align(default_v_align)

    paragraphs = parse_rich_text(raw_text)
    if not paragraphs:
        return

    for p_idx, p_data in enumerate(paragraphs):
        p = tf.paragraphs[0] if p_idx == 0 else tf.add_paragraph()
        h_align_str = p_data.props.get("text_align") or default_h_align
        p.alignment = map_h_align(h_align_str)

        line_height_px = p_data.props.get("line_height_px") or base_style.get("lineHeightPx")
        line_height = p_data.props.get("line_height") or base_style.get("lineHeight")
        if line_height_px is not None:
            p.line_spacing = Pt(float(line_height_px))
        elif line_height is not None:
            p.line_spacing = float(line_height)

        margin_top = p_data.props.get("margin_top")
        if margin_top is None:
            margin_top = base_style.get("marginTop")
        if margin_top is not None and float(margin_top) > 0:
            p.space_before = Pt(float(margin_top))

        runs = list(p_data.runs)
        if p_data.is_list_item:
            prefix = f"{p_data.list_index}. " if p_data.list_ordered else "• "
            first_props = runs[0].props if runs else {}
            runs.insert(0, RichTextRun(prefix, first_props))

        for r_data in runs:
            if not r_data.text:
                continue
            run = p.add_run()
            # Replace Formula delimiters \( ... \) with clean text
            clean_text = re.sub(r"\\\((.*?)\\\)", r"\1", r_data.text)
            run.text = clean_text

            merged = dict(base_style)
            merged.update(r_data.props)

            font_size = float(merged.get("fontSize", 18.0))
            run.font.size = Pt(font_size)
            run.font.bold = bool(merged.get("bold", False))
            run.font.italic = bool(merged.get("italic", False))
            if merged.get("underline"):
                run.font.underline = True
            if merged.get("href"):
                try:
                    run.hyperlink.address = str(merged["href"])
                except Exception:
                    pass

            color_val = merged.get("color", "#000000")
            rgb, alpha = theme.parse_color(color_val, "#000000")
            latin_font, ea_font = parse_font_family(merged.get("fontFamily"), "MiSans")
            bg_spec = merged.get("backgroundColor")
            bg_parsed = theme.parse_color(bg_spec) if bg_spec else None

            set_run_ea_and_styles(
                run,
                latin_font=latin_font,
                ea_font=ea_font,
                rgb=rgb,
                alpha=alpha * element_opacity,
                strike=bool(merged.get("strike", False)),
                superscript=bool(merged.get("superscript", False)),
                subscript=bool(merged.get("subscript", False)),
                letter_spacing=merged.get("letterSpacing"),
                bg_color=bg_parsed,
            )


def prepare_image_bytes_and_box(
    img_path: Path,
    bounds: list[float],
    fit_spec: dict[str, Any] | None,
    crop_spec: dict[str, Any] | None,
) -> tuple[bytes, float, float, float, float]:
    bx, by, bw, bh = [float(v) for v in bounds]
    with PilImage.open(img_path) as im:
        im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
        iw, ih = im.size

        if crop_spec and isinstance(crop_spec, dict):
            left_r = float(crop_spec.get("left", 0.0))
            top_r = float(crop_spec.get("top", 0.0))
            right_r = float(crop_spec.get("right", 0.0))
            bottom_r = float(crop_spec.get("bottom", 0.0))
            if left_r + right_r < 0.98 and top_r + bottom_r < 0.98:
                c_left = max(0, int(round(iw * left_r)))
                c_top = max(0, int(round(ih * top_r)))
                c_right = min(iw, int(round(iw * (1.0 - right_r))))
                c_bottom = min(ih, int(round(ih * (1.0 - bottom_r))))
                if c_right > c_left and c_bottom > c_top:
                    im = im.crop((c_left, c_top, c_right, c_bottom))
                    iw, ih = im.size

        mode = "cover"
        if isinstance(fit_spec, dict) and fit_spec.get("mode"):
            mode = str(fit_spec["mode"]).lower()

        if mode == "contain" and iw > 0 and ih > 0 and bw > 0 and bh > 0:
            scale = min(bw / iw, bh / ih)
            new_w = iw * scale
            new_h = ih * scale
            bx = bx + (bw - new_w) / 2.0
            by = by + (bh - new_h) / 2.0
            bw, bh = new_w, new_h
        elif mode == "cover" and iw > 0 and ih > 0 and bw > 0 and bh > 0:
            target_ratio = bw / bh
            src_ratio = iw / ih
            if abs(src_ratio - target_ratio) > 0.01:
                if src_ratio > target_ratio:
                    new_iw = max(1, int(round(ih * target_ratio)))
                    x_off = (iw - new_iw) // 2
                    im = im.crop((x_off, 0, x_off + new_iw, ih))
                else:
                    new_ih = max(1, int(round(iw / target_ratio)))
                    y_off = (ih - new_ih) // 2
                    im = im.crop((0, y_off, iw, y_off + new_ih))

        buf = io.BytesIO()
        im.save(buf, format="PNG")
        return buf.getvalue(), bx, by, bw, bh


def render_line_element(slide: Any, elem: dict[str, Any], theme: ThemeResolver) -> None:
    bounds = elem.get("bounds") or [0, 0, 100, 0]
    bx, by, bw, bh = [float(v) for v in bounds]
    view_box = elem.get("viewBox") or [max(bw, 1.0), max(bh, 1.0)]
    vw = max(float(view_box[0]), 1e-6)
    vh = max(float(view_box[1]), 1e-6)
    pts_raw = str(elem.get("points") or "0,0 1,1").strip().split()
    coords: list[tuple[float, float]] = []
    for token in pts_raw:
        if "," in token:
            px_s, py_s = token.split(",", 1)
            try:
                px = bx + (float(px_s) / vw) * bw
                py = by + (float(py_s) / vh) * bh
                coords.append((px, py))
            except ValueError:
                pass
    if len(coords) < 2:
        coords = [(bx, by), (bx + bw, by + bh)]

    x1, y1 = coords[0]
    x2, y2 = coords[-1]
    connector = slide.shapes.add_connector(
        MSO_CONNECTOR.STRAIGHT,
        Pt(x1),
        Pt(y1),
        Pt(x2),
        Pt(y2),
    )
    opacity = float(elem.get("opacity", 1.0))
    border = elem.get("border") or {"style": "solid", "width": 1.5, "color": "#000000"}
    apply_border_to_shape(connector, border, theme, opacity)

    arrow = elem.get("arrow")
    if isinstance(arrow, (list, tuple)) and len(arrow) >= 2:
        ln = connector._element.find(f".//{{{A_NS}}}ln")
        if ln is not None:
            arrow_map = {
                "arrow": "triangle",
                "stealth": "stealth",
                "diamond": "diamond",
                "oval": "oval",
            }
            if arrow[0] and str(arrow[0]) in arrow_map:
                he = etree.SubElement(ln, qn("a:headEnd"))
                he.set("type", arrow_map[str(arrow[0])])
            if arrow[1] and str(arrow[1]) in arrow_map:
                te = etree.SubElement(ln, qn("a:tailEnd"))
                te.set("type", arrow_map[str(arrow[1])])


def resolve_table_cell_style(
    r_idx: int,
    c_idx: int,
    num_rows: int,
    num_cols: int,
    table_style: dict[str, Any],
    cell_data: dict[str, Any],
    theme: ThemeResolver,
) -> dict[str, Any]:
    style: dict[str, Any] = {
        "color": "#000000",
        "fontSize": 13,
        "fontFamily": "MiSans",
        "bold": False,
        "italic": False,
        "lineHeight": 1.15,
        "align": ["center", "middle"],
        "border": {"style": "solid", "width": 1, "color": "#E2E8F0"},
    }
    if isinstance(table_style.get("cellStyle"), dict):
        style.update(table_style["cellStyle"])

    is_first_row = r_idx == 0 and isinstance(table_style.get("firstRowStyle"), dict)
    is_last_row = (
        r_idx == num_rows - 1
        and num_rows > 1
        and isinstance(table_style.get("lastRowStyle"), dict)
    )
    if not is_first_row and not is_last_row:
        body_styles = table_style.get("bodyStyles")
        if isinstance(body_styles, list) and body_styles:
            data_idx = r_idx - (1 if isinstance(table_style.get("firstRowStyle"), dict) else 0)
            chosen = body_styles[data_idx % len(body_styles)]
            if isinstance(chosen, dict):
                style.update(chosen)

    row_over_col = bool(table_style.get("rowOverColumn", True))
    row_cat: dict[str, Any] = {}
    if is_first_row:
        row_cat = table_style["firstRowStyle"]
    elif is_last_row:
        row_cat = table_style["lastRowStyle"]

    col_cat: dict[str, Any] = {}
    if c_idx == 0 and isinstance(table_style.get("firstColumnStyle"), dict):
        col_cat = table_style["firstColumnStyle"]
    elif (
        c_idx == num_cols - 1
        and num_cols > 1
        and isinstance(table_style.get("lastColumnStyle"), dict)
    ):
        col_cat = table_style["lastColumnStyle"]

    if row_over_col:
        style.update(col_cat)
        style.update(row_cat)
    else:
        style.update(row_cat)
        style.update(col_cat)

    if cell_data.get("textStyle"):
        style.update(theme.get_text_style(cell_data["textStyle"]))

    for k in (
        "color",
        "fontSize",
        "fontFamily",
        "bold",
        "italic",
        "backgroundColor",
        "lineHeight",
        "lineHeightPx",
        "letterSpacing",
        "marginTop",
        "fill",
        "border",
        "align",
    ):
        if k in cell_data:
            style[k] = cell_data[k]
    return style


def apply_cell_borders(tc_pr: Any, border_spec: Any, theme: ThemeResolver) -> None:
    sides = ["lnT", "lnR", "lnB", "lnL"]
    for s in sides:
        for old in tc_pr.findall(qn(f"a:{s}")):
            tc_pr.remove(old)

    if border_spec is None:
        for s in sides:
            ln = etree.SubElement(tc_pr, qn(f"a:{s}"))
            etree.SubElement(ln, qn("a:noFill"))
        return

    specs: list[dict[str, Any] | None]
    if isinstance(border_spec, dict):
        specs = [border_spec, border_spec, border_spec, border_spec]
    elif isinstance(border_spec, list):
        if len(border_spec) == 2:
            specs = [border_spec[0], border_spec[1], border_spec[0], border_spec[1]]
        elif len(border_spec) >= 4:
            specs = [border_spec[0], border_spec[1], border_spec[2], border_spec[3]]
        else:
            specs = [None, None, None, None]
    else:
        return

    for side_tag, spec in zip(sides, specs):
        ln = etree.SubElement(tc_pr, qn(f"a:{side_tag}"))
        if not spec or not isinstance(spec, dict) or float(spec.get("width", 1.0)) <= 0:
            etree.SubElement(ln, qn("a:noFill"))
            continue
        w_emu = pt_to_emu(float(spec.get("width", 1.0)))
        ln.set("w", str(w_emu))
        rgb, alpha = theme.parse_color(spec.get("color"), "#CBD5E1")
        sf = etree.SubElement(ln, qn("a:solidFill"))
        srgb = etree.SubElement(sf, qn("a:srgbClr"))
        srgb.set("val", f"{rgb[0]:02X}{rgb[1]:02X}{rgb[2]:02X}")
        if alpha < 0.999:
            a_el = etree.SubElement(srgb, qn("a:alpha"))
            a_el.set("val", str(max(0, min(100000, int(round(alpha * 100000))))))


def render_table_element(slide: Any, elem: dict[str, Any], theme: ThemeResolver) -> None:
    bounds = elem.get("bounds") or [0, 0, 600, 300]
    bx, by, bw, bh = [float(v) for v in bounds]
    col_ratios = elem.get("columnWidths") or [1.0]
    row_ratios = elem.get("rowHeights") or [1.0]
    raw_rows = elem.get("rows") or []
    num_cols = max(1, len(col_ratios))
    num_rows = max(1, len(raw_rows) if raw_rows else len(row_ratios))

    table_shape = slide.shapes.add_table(
        num_rows, num_cols, Pt(bx), Pt(by), Pt(bw), Pt(bh)
    )
    table = table_shape.table

    for c_idx in range(num_cols):
        ratio = float(col_ratios[c_idx]) if c_idx < len(col_ratios) else (1.0 / num_cols)
        table.columns[c_idx].width = Pt(bw * ratio)
    for r_idx in range(num_rows):
        ratio = float(row_ratios[r_idx]) if r_idx < len(row_ratios) else (1.0 / num_rows)
        table.rows[r_idx].height = Pt(bh * ratio)

    table_style = theme.get_table_style(elem.get("style"))
    occupied = [[False] * num_cols for _ in range(num_rows)]

    for r_idx, row_items in enumerate(raw_rows):
        if r_idx >= num_rows or not isinstance(row_items, list):
            continue
        c_cursor = 0
        for cell_item in row_items:
            while c_cursor < num_cols and occupied[r_idx][c_cursor]:
                c_cursor += 1
            if c_cursor >= num_cols:
                break
            cell_dict = cell_item if isinstance(cell_item, dict) else {"text": str(cell_item)}
            r_span = max(1, int(cell_dict.get("rowSpan", 1)))
            c_span = max(1, int(cell_dict.get("colSpan", 1)))
            for rr in range(r_idx, min(num_rows, r_idx + r_span)):
                for cc in range(c_cursor, min(num_cols, c_cursor + c_span)):
                    occupied[rr][cc] = True
            if r_span > 1 or c_span > 1:
                end_r = min(num_rows - 1, r_idx + r_span - 1)
                end_c = min(num_cols - 1, c_cursor + c_span - 1)
                try:
                    table.cell(r_idx, c_cursor).merge(table.cell(end_r, end_c))
                except Exception:
                    pass

            ppt_cell = table.cell(r_idx, c_cursor)
            resolved = resolve_table_cell_style(
                r_idx, c_cursor, num_rows, num_cols, table_style, cell_dict, theme
            )
            fill_spec = resolved.get("fill") or elem.get("fill")
            if isinstance(fill_spec, dict) and fill_spec.get("type") == "solid":
                rgb, alpha = theme.parse_color(fill_spec.get("color"), "#FFFFFF")
                ppt_cell.fill.solid()
                apply_srgb_alpha(ppt_cell.fill.fore_color, rgb, alpha)
            else:
                ppt_cell.fill.background()

            tc_pr = ppt_cell._tc.get_or_add_tcPr()
            apply_cell_borders(tc_pr, resolved.get("border"), theme)

            populate_text_frame(
                ppt_cell.text_frame,
                cell_dict.get("text", ""),
                resolved,
                theme,
                1.0,
            )
            ppt_cell.margin_left = Pt(6)
            ppt_cell.margin_right = Pt(6)
            ppt_cell.margin_top = Pt(4)
            ppt_cell.margin_bottom = Pt(4)
            c_cursor += c_span


def apply_slide_background(
    slide: Any,
    bg_spec: dict[str, Any] | None,
    slide_w: float,
    slide_h: float,
    deck_dir: Path,
    theme: ThemeResolver,
) -> None:
    if not bg_spec or not isinstance(bg_spec, dict):
        return
    bg_type = bg_spec.get("type", "solid")
    if bg_type == "solid":
        rgb, alpha = theme.parse_color(bg_spec.get("color"), "#FFFFFF")
        background = slide.background
        fill = background.fill
        fill.solid()
        apply_srgb_alpha(fill.fore_color, rgb, alpha)
    elif bg_type == "gradient":
        bg_shape = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Pt(0), Pt(0), Pt(slide_w), Pt(slide_h)
        )
        bg_shape.line.fill.background()
        apply_fill_to_shape(bg_shape, bg_spec, theme, 1.0)
    elif bg_type == "image":
        src = str(bg_spec.get("src", "")).strip()
        if src:
            img_path = (deck_dir / src).resolve()
            if img_path.is_file():
                img_bytes, bx, by, bw, bh = prepare_image_bytes_and_box(
                    img_path,
                    [0, 0, slide_w, slide_h],
                    bg_spec.get("fit"),
                    bg_spec.get("crop"),
                )
                slide.shapes.add_picture(
                    io.BytesIO(img_bytes), Pt(bx), Pt(by), Pt(bw), Pt(bh)
                )


def compile_pptd_to_pptx(input_path: Path, output_path: Path | None = None) -> Path:
    input_path = input_path.resolve()
    if input_path.is_dir():
        pptd_files = sorted(input_path.glob("*.pptd"))
        if not pptd_files:
            raise FileNotFoundError(f"No .pptd file found in directory: {input_path}")
        pptd_file = pptd_files[0]
        deck_dir = input_path
    elif input_path.is_file() and input_path.suffix.lower() == ".pptd":
        pptd_file = input_path
        deck_dir = input_path.parent
    else:
        raise ValueError(f"Input must be a .pptd file or directory containing one: {input_path}")

    with open(pptd_file, "r", encoding="utf-8") as f:
        manifest = yaml.safe_load(f) or {}

    size = manifest.get("size") or [960, 540]
    slide_w = float(size[0])
    slide_h = float(size[1])
    theme = ThemeResolver(manifest.get("theme"))
    page_rel_paths = manifest.get("pages") or []

    prs = Presentation()
    prs.slide_width = Pt(slide_w)
    prs.slide_height = Pt(slide_h)
    blank_layout = prs.slide_layouts[6]

    cli_candidates = [
        _SKILL_ROOT / "bin" / "slides-engine",
        _SKILL_ROOT / "bin" / "sentinel-slides",
    ]
    cli_bin = next((c for c in cli_candidates if c.is_file()), None)

    with tempfile.TemporaryDirectory(prefix="pptd_render_") as tmp_shot_dir:
        rendered_pages: dict[int, Path] = {}

        def get_rendered_page(page_num: int) -> Path | None:
            if page_num in rendered_pages:
                return rendered_pages[page_num]
            if cli_bin is None:
                return None
            import subprocess

            subprocess.run(
                [
                    str(cli_bin),
                    "screenshot",
                    str(deck_dir),
                    "-p",
                    str(page_num),
                    "-o",
                    tmp_shot_dir,
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
            shot_file = Path(tmp_shot_dir) / f"page-{page_num}.png"
            if not shot_file.is_file():
                shot_file = Path(tmp_shot_dir) / "pages" / f"page-{page_num}.png"
            if shot_file.is_file():
                rendered_pages[page_num] = shot_file
                return shot_file
            return None

        def crop_from_page_render(
            page_num: int, bx: float, by: float, bw: float, bh: float
        ) -> bytes | None:
            shot = get_rendered_page(page_num)
            if shot is None:
                return None
            with PilImage.open(shot) as im:
                iw, ih = im.size
                sx = iw / max(slide_w, 1.0)
                sy = ih / max(slide_h, 1.0)
                c_left = max(0, int(round(bx * sx)))
                c_top = max(0, int(round(by * sy)))
                c_right = min(iw, int(round((bx + bw) * sx)))
                c_bottom = min(ih, int(round((by + bh) * sy)))
                if c_right <= c_left or c_bottom <= c_top:
                    return None
                sub = im.crop((c_left, c_top, c_right, c_bottom))
                buf = io.BytesIO()
                sub.save(buf, format="PNG")
                return buf.getvalue()

        for page_idx, page_rel in enumerate(page_rel_paths, start=1):
            page_path = (deck_dir / str(page_rel)).resolve()
            if not page_path.is_file():
                raise FileNotFoundError(f"Referenced page file not found: {page_path}")
            with open(page_path, "r", encoding="utf-8") as pf:
                page_data = yaml.safe_load(pf) or {}

            slide = prs.slides.add_slide(blank_layout)
            apply_slide_background(
                slide, page_data.get("background"), slide_w, slide_h, deck_dir, theme
            )

            notes = page_data.get("notes")
            if notes and str(notes).strip():
                try:
                    slide.notes_slide.notes_text_frame.text = str(notes).strip()
                except Exception:
                    pass

            elements = page_data.get("elements") or []
            for elem in elements:
                if not isinstance(elem, dict):
                    continue
                el_type = str(elem.get("elementType", "")).strip()
                bounds = elem.get("bounds") or [0, 0, 100, 50]
                bx, by, bw, bh = [float(v) for v in bounds]
                opacity = float(elem.get("opacity", 1.0))
                rotation = float(elem.get("rotation", 0.0))

                if el_type == "shape":
                    shape_name = str(elem.get("shapeName", "rect")).strip()
                    if shape_name == "custom":
                        cropped = crop_from_page_render(page_idx, bx, by, bw, bh)
                        if cropped is not None:
                            slide.shapes.add_picture(
                                io.BytesIO(cropped),
                                Pt(bx),
                                Pt(by),
                                Pt(max(bw, 1.0)),
                                Pt(max(bh, 1.0)),
                            )
                            continue
                    shape = slide.shapes.add_shape(
                        MSO_SHAPE.RECTANGLE,
                        Pt(bx),
                        Pt(by),
                        Pt(max(bw, 0.5)),
                        Pt(max(bh, 0.5)),
                    )
                    set_shape_geometry(shape, shape_name, elem.get("adjustments"))
                    apply_fill_to_shape(shape, elem.get("fill"), theme, opacity)
                    apply_border_to_shape(shape, elem.get("border"), theme, opacity)
                    if rotation:
                        shape.rotation = rotation

                elif el_type == "text":
                    content = elem.get("content") or {}
                    base_style = theme.get_text_style(content.get("style"))
                    for k in (
                        "color",
                        "fontSize",
                        "fontFamily",
                        "bold",
                        "italic",
                        "backgroundColor",
                        "lineHeight",
                        "lineHeightPx",
                        "letterSpacing",
                        "marginTop",
                        "wrap",
                        "align",
                    ):
                        if k in content:
                            base_style[k] = content[k]
                    tb = slide.shapes.add_textbox(
                        Pt(bx), Pt(by), Pt(max(bw, 1.0)), Pt(max(bh, 1.0))
                    )
                    tb.fill.background()
                    tb.line.fill.background()
                    if rotation:
                        tb.rotation = rotation
                    populate_text_frame(
                        tb.text_frame, content.get("text", ""), base_style, theme, opacity
                    )

                elif el_type == "image":
                    src = str(elem.get("src", "")).strip()
                    if not src:
                        continue
                    img_path = (deck_dir / src).resolve()
                    if not img_path.is_file():
                        continue
                    img_bytes, ix, iy, iw, ih = prepare_image_bytes_and_box(
                        img_path,
                        [bx, by, bw, bh],
                        elem.get("fit"),
                        elem.get("crop"),
                    )
                    pic = slide.shapes.add_picture(
                        io.BytesIO(img_bytes),
                        Pt(ix),
                        Pt(iy),
                        Pt(max(iw, 1.0)),
                        Pt(max(ih, 1.0)),
                    )
                    crop_shape = elem.get("cropShape")
                    if isinstance(crop_shape, dict) and crop_shape.get("shapeName"):
                        set_shape_geometry(
                            pic,
                            str(crop_shape["shapeName"]),
                            crop_shape.get("adjustments"),
                        )
                    if elem.get("border"):
                        apply_border_to_shape(pic, elem.get("border"), theme, opacity)
                    if rotation:
                        pic.rotation = rotation

                elif el_type == "line":
                    render_line_element(slide, elem, theme)

                elif el_type == "table":
                    render_table_element(slide, elem, theme)

                elif el_type in ("icon", "chart"):
                    cropped = crop_from_page_render(page_idx, bx, by, bw, bh)
                    if cropped is not None:
                        slide.shapes.add_picture(
                            io.BytesIO(cropped),
                            Pt(bx),
                            Pt(by),
                            Pt(max(bw, 1.0)),
                            Pt(max(bh, 1.0)),
                        )
                    elif el_type == "icon":
                        shape = slide.shapes.add_shape(
                            MSO_SHAPE.OVAL,
                            Pt(bx),
                            Pt(by),
                            Pt(max(bw, 4.0)),
                            Pt(max(bh, 4.0)),
                        )
                        fill_spec = elem.get("fill") or {"type": "solid", "color": "#000000"}
                        apply_fill_to_shape(shape, fill_spec, theme, opacity)
                        apply_border_to_shape(shape, elem.get("border"), theme, opacity)

    if output_path is None:
        output_path = deck_dir / f"{pptd_file.stem}.pptx"
    else:
        output_path = output_path.resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)

    prs.save(str(output_path))
    return output_path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Compile a .pptd presentation into a standard .pptx file."
    )
    parser.add_argument(
        "input",
        help="Path to the .pptd file or the directory containing the .pptd file",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Output .pptx file path (defaults to <deck_dir>/<deck_name>.pptx)",
    )
    args = parser.parse_args()
    out = compile_pptd_to_pptx(
        Path(args.input),
        Path(args.output) if args.output else None,
    )
    print(f"Successfully compiled PPTD -> PPTX: {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
