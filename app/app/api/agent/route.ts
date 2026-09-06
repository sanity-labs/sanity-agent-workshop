import {createUIMessageStream, createUIMessageStreamResponse} from 'ai'

// This route is intentionally unwired. Mission 1-1 connects it.
//
// Right now it returns a fixed reply so `pnpm dev` succeeds and you can confirm
// the chat UI works end to end before you build anything. It streams that
// reply in the same UI-message format a real agent would, so the ChatPanel
// component does not change when you wire the agent — only this file does.
//
// To wire it (Mission 1-1):
//   1. In the Context app (Dashboard), create an MCP whose source is this
//      project + dataset. That is GROQ mode. Pick the name carefully: it is
//      part of the URL and cannot be changed afterwards.
//   2. Put its URL in app/.env.local as SANITY_CONTEXT_MCP_URL. Auth is your
//      ORGANIZATION token (SANITY_ORGANIZATION_TOKEN) — a project token is
//      refused with 403 contextGrantRequired.
//   3. Replace the body below with an MCP-backed model call. `@ai-sdk/mcp`,
//      `@ai-sdk/anthropic`, and `ai` are already installed in this workspace.
//
// The request body is `{messages: UIMessage[], guestId?: string}`. `guestId`
// is sent by the ChatPanel and is Mission 1-5's material; ignore it until then.

const STUB_REPLY =
  "I'm not connected yet — I have no way to read your content. " + 'Mission 1-1 gives me one.'

export async function POST() {
  const stream = createUIMessageStream({
    execute: ({writer}) => {
      const id = crypto.randomUUID()
      writer.write({type: 'text-start', id})
      writer.write({type: 'text-delta', id, delta: STUB_REPLY})
      writer.write({type: 'text-end', id})
    },
  })

  return createUIMessageStreamResponse({stream})
}
