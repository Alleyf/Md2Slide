# Task Plan: Paper2Slide Feature Optimization and Bug Fixes

## Goal
Comprehensive optimization of the Paper2Slide platform, including marketplace fixes, AI assistant overhaul, plugin implementation, skill integration, and export enhancement.

## Phases
- [x] Phase 1: Research and Audit
    - [x] Audit Theme Marketplace for SVG and installation issues.
    - [x] Research AI model capability detection methods.
    - [x] Audit Plugin Marketplace for missing/essential features.
    - [x] Research Claude skills via `skill-lookup`.
    - [x] Audit current PPT export functionality.
- [ ] Phase 2: Theme Marketplace Fixes
    - [ ] Implement SVG preview generation logic in `ThemePreviewImage`.
    - [ ] Fix theme installation persistence and application feedback.
- [ ] Phase 3: AI Assistant Overhaul
    - [ ] Redesign AI Assistant UI (Floating Sidebar/Elegant).
    - [ ] Implement model capability auto-detection in `aiService`.
    - [ ] Abstract endpoint URL (extract `/chat/completions`).
- [ ] Phase 4: Plugin Marketplace & Essential Features
    - [ ] Implement `DiagramMakerPlugin` and `CollaborationPlugin`.
    - [ ] Move `MathRenderer`, `CodeHighlighter`, `MediaEmbedder`, `ExportEnhancer` to core features.
- [ ] Phase 5: Claude Skills Integration
    - [ ] Search for suitable skills and install them.
- [ ] Phase 6: PPT Export Optimization
    - [ ] Enhance PPTX layout, styling, and media support.
- [ ] Phase 7: Final Review and Testing

## Status
**Currently in Phase 1** - Auditing the current state of the codebase.
