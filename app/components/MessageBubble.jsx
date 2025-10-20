"use client";
export default function MessageBubble({ m, selfId }) {
  const mine = m.sender_id === selfId;
  return (
    <div className={`msg ${mine ? "mine" : ""}`}>
      <div className="bubble">
        <div className="content">{m.content}</div>
        <div className="time">{new Date(m.created_at).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</div>
      </div>
    </div>
  );
}
