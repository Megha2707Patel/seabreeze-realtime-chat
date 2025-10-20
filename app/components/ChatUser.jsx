"use client";
export default function ChatUser({ chat, active, onClick, lastText }) {
  const code = chat.id.slice(-4).toUpperCase();
  return (
    <div className={`chat-user ${active ? "active": ""}`} onClick={() => onClick(chat)}>
      <div className="avatar">{code}</div>
      <div className="meta">
        <div className="name">Chat • {chat.id.slice(0,8)}</div>
        <div className="last">{lastText || "Say hi 👋"}</div>
      </div>
    </div>
  );
}
