---
name: website-swarm
description: Orchestrates a small swarm of Grok Build agents to fix or extend a multi-screen app in parallel, one agent per screen. Use when the user asks for parallel agents or a swarm.
when-to-use: fix app, sweep, swarm, multi-agent, one agent per screen
---

# Website Swarm Skill

## When to use
Work that splits by screen, so agents can do it at the same time.

## Steps
1. Plan. Read ISSUES.md and AGENTS.md. List each screen in `client/src/views/` with one owner
   and the exact files it may edit: its view file, plus any component that only that screen uses.
   Shared files (`App.vue`, components several screens use, `composables/`, `locales/`, `api.js`)
   stay with you, the parent. No two agents share a file.
2. Spawn one `frontend` subagent per screen, in parallel. Give each one its file list, the
   ISSUES.md items for its screen, and the accessibility bar from ISSUES.md.
3. When all of them finish, make any shared-file changes they asked for.
4. Spawn `reviewer` with the plan text, ISSUES.md, and the list of changed files.
5. Fix what the reviewer finds, then finish the turn. The Stop hook runs `npm run verify`;
   fix anything it reports.
6. Summarize: what was fixed, which agent owned which files, and the verify result.

## Constraints
- Changes stay in `client/src`. Subagents never edit shared files, `server/`, `tests/`,
  config or package files.
