# sentinel-slides CLI Reference

`sentinel-slides` is pre-installed on `PATH` (and at `/Users/like/Library/Application Support/sentinel-ai/skills/sentinel-slides/bin/sentinel-slides`). It provides both **DSL workflow commands** (`.pptd <-> .pptx`) and **Surgical in-place commands** (lossless `.pptx` XML text editing).

---

## Part 1: DSL Workflow Commands (`.pptd <-> .pptx`)

### 1. `convert` (`.pptx -> .pptd`)

```bash
sentinel-slides convert path/deck.pptx
sentinel-slides convert path/deck.pptx -o path/output/
```

`-o, --output`: specifies the output directory; optional. If omitted, a directory with the same name (without extension) is created next to the input:

```text
path/deck.pptx -> path/deck/
```

Output directory structure:

```text
deck/
  deck.pptd
  pages/
    page-1.page
  media/
    <hash>.png
```

> During conversion, images embedded in the PPTX are extracted into the `media/` directory, and image paths in the page files are rewritten to paths relative to the output directory (`src: ./media/<hash>.png`).

### 2. `check` (Validate & Auto-Repair `.pptd`)

```bash
sentinel-slides check path/deck
sentinel-slides check path/deck -p 1,3 -s all
sentinel-slides check path/deck -p 2-10 --level keep
sentinel-slides check path/deck --level auto
```

The input to `check` must be a directory containing a `.pptd` file. By default it checks the main `.pptd` file and all page files.

Parameters:
- `-p, --page <spec>`: specifies page numbers, 1-based; defaults to all pages. Supports `3`, `1,2`, `2-10`.
- `-s, --severity <spec>`: specifies which issues to output. Supports `all`, `error`, `warning`, and specific issue types (`MissingField,SrcNotFound`).
- `--level <level>`: handling level. `keep` only checks without modifying; `auto` attempts deterministic repairs.

Checked issues:
- `YamlParseError`: every checked file must parse correctly with a YAML parser.
- `FileReadError`: abnormal access to the input directory, `.pptd` file, page files, or resource paths.
- `MissingField`: required fields are missing (`.pptd.pages`, `.pptd.size`, or required element fields).
- `InvalidType`: field types do not match their definitions.
- `OutOfRange`: field values fall outside the acceptable range.
- `InvalidTheme`: a referenced theme token does not exist (e.g. `$primary` is not present in `theme.colors`).
- `PageNotFound`: a `.page` file referenced by `.pptd.pages` does not exist.
- `UnknownField`: a field not recognized by the current schema was found.
- `BoundsOutside`: an element's bounds exceed the page dimensions.
- `SrcNotFound`: a local resource referenced by `src` (image, image fill, custom font) does not exist.
- `TextOverflow`: text may overflow its text box.
- `TextUnderFill`: text may occupy less than 50% of the text box height.
- `TextOcclusion`: text may be occluded by elements drawn later.
- `TextDrift`: a text box may cross the boundary of an element below it.

### 3. `screenshot` (Render `.pptd` to PNG)

```bash
sentinel-slides screenshot path/deck -o path/screenshots/
sentinel-slides screenshot path/deck -p 1,3,5 -o path/screenshots/
sentinel-slides screenshot path/deck -p 2-6 -o path/screenshots/
```

Renders `.pptd` pages into high-resolution PNG images (`page-1.png`, `page-2.png`, ...) for visual inspection.

Parameters:
- `-p, --page <spec>`: specifies page numbers, 1-based; defaults to all pages. Supports `3`, `1,2`, `2-10`.
- `-o, --output <path>`: specifies the screenshot output directory.

### 4. `fold` / `export` (Compile `.pptd -> .pptx`)

```bash
sentinel-slides fold path/deck -o path/output.pptx
sentinel-slides export path/deck/deck.pptd -o path/output.pptx
```

Compiles a `.pptd` directory (or `.pptd` entry file) and all of its `pages/*.page` and `media/*` assets into a standard `.pptx` presentation locally.

Parameters:
- `input`: path to the `.pptd` file or the directory containing the `.pptd` file.
- `-o, --output <path>`: optional output `.pptx` path. Defaults to `<deck_dir>/<deck_name>.pptx`.

---

## Part 2: Surgical In-Place Commands (Lossless `.pptx` XML Editing)

Use these commands when modifying text/numbers in an existing `.pptx` file without changing layout, adding/removing slides, or losing embedded add-ins/fonts/masters.

### 1. `prep` (Inspect Slide Inventory & Paragraph Addresses)

```bash
sentinel-slides prep "/abs/path/report.pptx"
sentinel-slides prep "/abs/path/report.pptx" --slide 4
```

Outputs the slide count, protected OPC part inventory (add-ins, think-cell, embedded workbooks, fonts), and stable paragraph addresses (`s4#p0`, `s4#p1`, etc.) in presentation order.

### 2. `edit` (Apply Lossless Paragraph Operations)

```bash
cat > ".report.pptx.ops.json" <<'JSON'
[
  {"id": "s4#p0", "text": "Updated Slide Title"},
  {"slide": 4, "find": "old phrase", "replace": "new phrase"}
]
JSON
sentinel-slides edit "/abs/path/report.pptx" --ops ".report.pptx.ops.json" --dry-run
sentinel-slides edit "/abs/path/report.pptx" --ops ".report.pptx.ops.json"
```

- Automatically creates a backup `.<filename>.before.pptx` before writing in-place.
- Clones unmodified `ZipInfo` entries byte-for-byte.

### 3. `verify` (Verify OPC Package Integrity & Diff)

```bash
sentinel-slides verify --self "/abs/path/report.pptx"
sentinel-slides verify --before ".report.pptx.before.pptx" --after "/abs/path/report.pptx"
```

Verifies OPC content types, internal relationships, slide list consistency, and confirms that only targeted slide XML parts changed.
