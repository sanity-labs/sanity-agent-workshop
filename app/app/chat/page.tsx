import {ChatPanel} from '@/components/ChatPanel'
import {KNOWN_GUEST_IDS} from '@/lib/loyalty'

export default function ChatPage() {
  return (
    <>
      <h1>Ask the concierge</h1>
      <p className="lede">
        Allergen and dietary questions about the menu. Until you wire the agent route, every answer
        is the same: <em>not connected yet</em>.
      </p>
      <ChatPanel guestIds={KNOWN_GUEST_IDS} />
    </>
  )
}
