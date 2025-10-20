"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TopBar from "@/app/components/TopBar";
import ChatUser from "@/app/components/ChatUser";
import MessageBubble from "@/app/components/MessageBubble";

export default function ChatPage() {
  const [me, setMe] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return location.replace("/auth/login");
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setMe(prof || { id: user.id, username: user.email?.split("@")[0] || "you" });
    })();
  }, []);

  useEffect(() => {
    if (!me?.id) return;
    const channel = supabase.channel("online-users", { config: { presence: { key: me.id } } });
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const users = Object.keys(state).map(id => ({ id }));
      setOnlineUsers(users);
    });
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") { await channel.track({ online_at: new Date().toISOString(), username: me.username }); }
    });
    return () => { supabase.removeChannel(channel); };
  }, [me]);

  async function loadChats() {
    const { data: cps, error } = await supabase.from("chat_participants").select("chat_id").eq("user_id", me.id);
    if (error) return alert(error.message);
    const ids = (cps || []).map(c => c.chat_id);
    if (!ids.length) return setChats([]);
    const { data: cs } = await supabase.from("chats").select("*").in("id", ids).order("created_at", { ascending: false });
    setChats(cs || []);
  }
  useEffect(() => { if (me?.id) loadChats(); }, [me?.id]);

  useEffect(() => {
    if (!activeChat?.id) return;
    (async () => {
      const { data } = await supabase.from("messages").select("*").eq("chat_id", activeChat.id).order("created_at", { ascending: true });
      setMessages(data || []);
    })();
    const channel = supabase
      .channel(`chat-${activeChat.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${activeChat.id}` },
        (payload) => setMessages(m => [...m, payload.new]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeChat]);

  async function startNewChat() {
    const email = prompt("Enter the other user's email (demo: username is part before @):");
    if (!email) return;
    const username = email.split("@")[0];
    const { data: other } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
    if (!other?.id) return alert("User not found. Make sure the other user registered.");
    const { data: chatId, error } = await supabase.rpc("create_or_get_chat", { other_user: other.id });
    if (error) return alert(error.message);
    await loadChats();
    setActiveChat({ id: chatId });
  }

  async function send() {
    const text = inputRef.current.value.trim();
    if (!text || !activeChat) return;
    const { error } = await supabase.from("messages").insert({ chat_id: activeChat.id, sender_id: me.id, content: text });
    if (error) return alert(error.message);
    inputRef.current.value = "";
  }

  const filtered = filter ? chats.filter(c => c.id.toLowerCase().includes(filter.toLowerCase())) : chats;

  return (
    <div className="layout">
      <aside className="aside">
        <TopBar me={me} onNewChat={startNewChat} />
        <div className="searchbar">
          <input placeholder="Search chats…" value={filter} onChange={(e)=>setFilter(e.target.value)} />
          <span className="badge">Online {onlineUsers.length}</span>
        </div>
        <div className="chats">
          {filtered.map(c => (
            <ChatUser
              key={c.id}
              chat={c}
              active={activeChat?.id === c.id}
              onClick={setActiveChat}
              lastText={activeChat?.id===c.id && messages.length ? messages.at(-1)?.content : ""}
            />
          ))}
          {filtered.length === 0 && <div className="empty" style={{marginTop:20}}>No chats yet. Start one!</div>}
        </div>
      </aside>

      <main className="main">
        {activeChat ? (
          <>
            <div className="header">
              <div className="title">
                <div className="avatar">{activeChat.id.slice(-4).toUpperCase()}</div>
                <div>
                  <div style={{fontWeight:700}}>Chat • {activeChat.id.slice(0,8)}</div>
                  <div className="chip">secure, realtime</div>
                </div>
              </div>
              <div/>
            </div>
            <div className="messages">
              {messages.map(m => (<MessageBubble key={m.id} m={m} selfId={me?.id} />))}
            </div>
            <div className="composer">
              <input ref={inputRef} placeholder="Type a message…" onKeyDown={(e)=> e.key==="Enter" && send()} />
              <button onClick={send}>Send</button>
            </div>
          </>
        ) : (
          <div className="empty"><h3>Welcome to SeaBreeze Chat 🌊</h3><p>Pick a conversation or start a new one.</p></div>
        )}
      </main>
    </div>
  );
}
