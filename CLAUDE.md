# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PipelineHQ is an enterprise-style Project Intake & Governance Platform. This repository currently serves as a **Claude Code skills library** — a collection of installed skills from the `anthropics/claude-code` plugin ecosystem used to support development workflows.

## Repository Structure

There is no traditional build system, test runner, or linter — this is a documentation/skills repository, not a compiled application.

```
.agents/skills/          # Installed Claude Code skills (auto-discovered)
.claude/settings.local.json  # Claude Code permissions and settings
skills-lock.json         # Tracks installed skills (source, version hash)
```

## Skills System

Skills live in `.agents/skills/<skill-name>/` and follow this structure:

```
skill-name/
├── SKILL.md             # Required: frontmatter metadata + instructions (core, 1,500–2,000 words)
├── references/          # Detailed documentation loaded only when needed
├── examples/            # Working code examples
└── scripts/             # Executable utilities
```

Claude Code auto-discovers skills by scanning for `SKILL.md` files. Skill metadata (name + description) is always in context; the SKILL.md body loads only when the skill triggers; references load on demand.

### Installed Skills

| Skill | Purpose |
|---|---|
| Agent Development | Creating autonomous subagents with system prompts and triggers |
| Command Development | Building slash commands with YAML frontmatter |
| Hook Development | Event-driven automation (PreToolUse, PostToolUse, Stop, etc.) |
| MCP Integration | Integrating Model Context Protocol servers |
| Plugin Settings | Configuring plugin state via `.local.md` files |
| Plugin Structure | Scaffolding plugins with proper directory layout |
| Skill Development | Creating and improving skills |
| Writing Hookify Rules | Pattern-based automation rules |
| claude-opus-4-5-migration | Migration guide for model updates |
| frontend-design | Production-grade UI design principles |

## Plugin Architecture (for reference when building plugins)

Claude Code plugins follow this layout:

```
plugin-name/
├── .claude-plugin/plugin.json   # Required manifest (name field minimum)
├── commands/                    # Slash commands (.md files)
├── agents/                      # Subagent definitions (.md files)
├── skills/<skill-name>/SKILL.md # Auto-activating skills
├── hooks/hooks.json             # Event handler configuration
└── .mcp.json                    # MCP server definitions
```

- Use `${CLAUDE_PLUGIN_ROOT}` for all intra-plugin path references — never hardcode absolute paths
- Component directories must be at plugin root, not nested inside `.claude-plugin/`
- All directory and file names use kebab-case

## Skill Authoring Rules

**SKILL.md frontmatter description**: must use third-person with specific trigger phrases:
```yaml
description: This skill should be used when the user asks to "create X", "configure Y", or mentions Z.
```

**SKILL.md body**: write in imperative/infinitive form (verb-first), not second person:
- Correct: `To create a hook, define the event type.`
- Incorrect: `You should create a hook by defining the event type.`

**Progressive disclosure**: keep SKILL.md lean (1,500–2,000 words); move detailed patterns, API references, and advanced techniques to `references/` files.

## Managing Skills

Skills are tracked in `skills-lock.json` with their source path in `anthropics/claude-code` and a computed hash for integrity. To update or add skills, update this file and the corresponding content in `.agents/skills/`.
