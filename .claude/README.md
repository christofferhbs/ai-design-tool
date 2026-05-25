# Claude Design Prompt

This folder contains the Claude-facing design prompt and skill procedures
adapted from `Trystan-SA/claude-design-system-prompt`.

The workflow, output, and tool references are edited directly for this
repository's Vite/React child-project structure. Chapters 5-16 of the upstream
prompt remain the design-principle core.

Use `system-prompt.md` first. When chapter 20 matches a user request, invoke the
skill if supported or read the corresponding file in `skills/`.
