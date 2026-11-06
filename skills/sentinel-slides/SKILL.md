---
name: sentinel-slides
description: Create, edit, inspect, and compile presentations in PPTX and PPTD formats. Supports two unified modes: (1) Surgical In-Place Mode (`sentinel-slides prep/edit/verify`) for lossless byte-preserving text updates on existing `.pptx` files, and (2) DSL Mode (`.pptd` + `pages/*.page` + `sentinel-slides convert/check/screenshot/fold`) for creating new decks, redesigning layouts, inserting desktop GUI screenshots captured via `computer_use`, and compiling back to `.pptx`.
---

# sentinel-slides — Unified Presentation Creation & Editing Skill

`sentinel-slides` is Sentinel AI's unified presentation engineering skill. It combines **Surgical In-Place OOXML Editing** and **PPTD v2 YAML DSL Authoring & Compilation** under one workflow and one CLI (`sentinel-slides`).

---

## Step 0: Mode Routing (Choose the Right Track First)

Before touching any file, choose between **Mode A** and **Mode B** based on the user's request:

| Scenario | Mode to Use | Why |
|---|---|---|
| Editing **only text/numbers** on specific slides of an **existing `.pptx`** (and no aligned `.pptd` working directory is being edited) | **Mode A: Surgical In-Place Mode** (`sentinel-slides prep` → `edit` → `verify`) | Modifies only the targeted `<a:p>` XML paragraphs in-place; 100% preserves all other ZIP entries byte-for-byte (think-cell, add-ins, embedded Excel workbooks, custom fonts, animations, masters). **Never run `sentinel-slides convert` just to fix text in an existing `.pptx`.** |
| **Creating a new PPT** from scratch, outline, document, or template | **Mode B: DSL Mode** (`.pptd` + `pages/*.page` → `check` → `screenshot` → `fold`) | Full layout, theme, shape, table, chart, and image authoring via the `.pptd` YAML DSL. |
| **Adding/removing slides, redesigning layouts, or inserting screenshots** (e.g. DBeaver / Postman / browser screenshots via `computer_use`) into a deck | **Mode B: DSL Mode** | If starting from an existing `.pptx` without a `.pptd` directory, run `sentinel-slides convert` first, edit/add `.page` files and `media/` assets, validate with `check`/`screenshot`, and compile back with `sentinel-slides fold`. |
| Editing an existing **`.pptd` working directory** | **Mode B: DSL Mode** | Directly edit the `.pptd` and `pages/*.page` files, then run `sentinel-slides check` and `sentinel-slides fold`. |

---

## Mode A: Surgical In-Place Text Editing (`prep` → `edit` → `verify`)

Use Mode A when the user wants to update titles, copy, or numbers in an existing `.pptx` file without altering layouts or adding slides/images.

### 1. Three-Step Closed Loop

Always pass quotedPaths when calling `sentinel-slides`:

```bash
# ① Inspect slide inventory, protected parts, and stable paragraph IDs (sN#pM)
sentinel-slides prep "/abs/path/report.pptx"
sentinel-slides prep "/abs/path/report.pptx" --slide 4

# ② Write operations JSON and run --dry-run first, then apply in-place
cat > "/abs/path/.report.pptx.ops.json" <<'JSON'
[
  {"id": "s4#p0", "text": "Architecture Breakdown: Attention Residuals"},
  {"slide": 4, "find": "1M Context", "replace": "Long Context"}
]
JSON
sentinel-slides edit "/abs/path/report.pptx" --ops "/abs/path/.report.pptx.ops.json" --dry-run
sentinel-slides edit "/abs/path/report.pptx" --ops "/abs/path/.report.pptx.ops.json"

# ③ Verify OPC package integrity and confirm only targeted slides changed
sentinel-slides verify --self "/abs/path/report.pptx"
sentinel-slides verify --before "/abs/path/.report.pptx.before.pptx" --after "/abs/path/report.pptx"
```

### 2. Supported Operations & Rules
- `{"id": "s4#p0", "text": "New text"}`: Replaces the entire paragraph at `id` (from `sentinel-slides prep`).
- `{"slide": 4, "find": "old", "replace": "new"}`: Replaces matching substrings across all paragraphs on slide 4 (1-based presentation order). Fails loudly if zero paragraphs match.
- **Soft line breaks (`<a:br>`, shown as `{N 行}` / `⏎` in `prep`)**: Represent line breaks with `\n` in `"text"`, and keep the **exact same number of lines** as the original paragraph.
- Clean up the temporary `.ops.json` and `.before.pptx` backup files once `verify` succeeds.

---

## Mode B: PPTD v2 DSL Creation, Layout Editing & Desktop GUI Integration

The `.pptd` format is an AI-friendly YAML abstraction over OOXML where every page (`pages/*.page`) is self-contained.
Read `reference/pptd.md` for the full DSL specification and `reference/cli.md` for CLI details before authoring `.pptd` / `.page` files.

### Step 1. Read Context & Understand Requirements
1. Determine request type:
   - **Create a PPT**: from scratch, outline, document, or existing `.pptx` template.
   - **Edit / Expand a PPT**: add pages, adjust layouts, or insert real operational screenshots into a `.pptd` project.
   - **Replicate a PPT**: replicate visual slides from images/PDFs into `.pptd` -> `.pptx`.
2. Determine design method:
   - **Self-directed design**: read `reference/slides_categories.md` and the matching scenario guide in `reference/categories/`.
   - **Design system**: strictly follow the user's specified color palette, typography, and layout system.
   - **Template-based**: run `sentinel-slides convert` on the template `.pptx`, take `screenshot`s to analyze its visual structure, and author new pages matching its components.
   - **Style transfer**: extract color hierarchy, typography, and card/grid patterns from the reference material.

### Step 2. Author or Edit `.pptd` and `pages/*.page`

#### Operating Desktop GUI Apps (`computer_use`) & Capturing Screenshots into `media/`
When a presentation requires real hands-on demonstrations or screenshots of desktop GUI applications (such as DBeaver, Postman, browsers, terminals, or IDEs), use the built-in `computer_use` tool:
1. **Discover or launch the target application**:
   - `{"action": "list_apps", "running_only": true}` or `{"action": "launch_app", "app": "DBeaver"}`
2. **Observe app/window state (unoccluded single-window screenshot + AX tree in one call)**:
   - `{"action": "get_app_state", "app": "DBeaver", "mode": "ax_and_image"}`
3. **Interact with controls**:
   - Use semantic `ref` handles (`click`, `set_value`, `perform_secondary_action`, `type_text` with `clear: true` / `submit: true`) or logical screen coordinates.
4. **Capture lossless Retina window/region screenshots directly into `<deck_dir>/media/`**:
   - Use `get_window_state` (or `observe`) with `window_id`, optional `rect` (to crop a specific SQL result table or request pane), and `save_path`:
     ```json
     {
       "action": "get_window_state",
       "window_id": "12345",
       "rect": { "x": 200, "y": 120, "width": 800, "height": 450 },
       "save_path": "/abs/path/to/deck/media/dbeaver_query_result.png"
     }
     ```
   - Reference the saved screenshot inside `pages/*.page` using relative path `src: "media/dbeaver_query_result.png"` with `fit: {mode: contain}` or `fit: {mode: cover}`.

#### Content & Visual Guidelines
- Avoid hollow buzzwords, abstract slogans, or repetitive AI phrasing ("not X, but Y", "closed loop", "deconstruction").
- Write multiple `.page` files in parallel whenever possible to minimize round-trips.
- Only add `animations` or speaker `notes` when explicitly requested by the user.

### Step 3. Validate & Visually Inspect (`check` + `screenshot`)
1. Run `sentinel-slides check` across the `.pptd` directory:
   ```bash
   sentinel-slides check "/abs/path/to/deck_dir" --level auto
   sentinel-slides check "/abs/path/to/deck_dir"
   ```
   Fix any `YamlParseError`, `MissingField`, `InvalidType`, `BoundsOutside`, `SrcNotFound`, `TextOverflow`, or `TextOcclusion` issues.
2. Render screenshots of key or newly edited pages to visually verify layout and legibility:
   ```bash
   sentinel-slides screenshot "/abs/path/to/deck_dir" -p 1,2,3 -o "/abs/path/to/deck_dir/.screenshots"
   ```

### Step 4. Compile (`fold`) to `.pptx` & Deliver
1. Compile the validated `.pptd` directory into a standard `.pptx` file:
   ```bash
   sentinel-slides fold "/abs/path/to/deck_dir" -o "/abs/path/to/output.pptx"
   sentinel-slides verify --self "/abs/path/to/output.pptx"
   ```
2. Keep the `.pptd` working directory intact so follow-up multi-turn edits can directly modify `pages/*.page` and re-run `sentinel-slides fold`.
3. **Delivery Format**: At the end of your response, always output a clickable Markdown file link with the **absolute path** to the `.pptx` file:
   ```markdown
   [Presentation Title.pptx](/abs/path/to/output.pptx)
   ```
   Sentinel AI renders absolute-path `.pptx` Markdown links as interactive file preview cards that open directly in the built-in PPTX preview panel.
