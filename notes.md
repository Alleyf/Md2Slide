# Notes: Paper2Slide Optimization Findings

## Current Audit Findings

### Theme Marketplace
- `ThemePreviewImage` is just a div. Needs SVG generation.
- Installation/Application state is managed in `themeMarketplaceService` but UI state synchronization could be better.

### AI Assistant
- Current modal UI is bulky. Transitioning to a floating sidebar or integrated panel.
- Model capability detection needs implementation via service discovery or manifest.
- URL abstraction: Extract `/chat/completions` into a constant.

### Plugin Marketplace
- Most plugins are mock.
- `MathRenderer`, `CodeHighlighter`, `MediaEmbedder`, `ExportEnhancer` are essential and should be core features.
- `Collaboration` and `DiagramMaker` remain as plugins.

### PPT Export
- Basic text export only.
- Needs better layout, styling, and support for elements like tables and images.

## Claude Skills Research
- Need to search for skills related to "presentation", "markdown", "slides", "export".
