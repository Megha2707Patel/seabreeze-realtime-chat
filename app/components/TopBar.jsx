"use client";
import { supabase } from "@/lib/supabaseClient";

export default function TopBar({ me, onNewChat }) {
  async function logout(){
    await supabase.auth.signOut();
    location.href = "/auth/login";
  }
  return (
    <div className="topbar">
      <div className="brand">
        <div className="logo" />
        <div>SeaBreeze Chat</div>
      </div>
      <div style={{display:"flex", gap:8}}>
        <button className="accent" onClick={onNewChat}>New Chat</button>
        <button className="ghost" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
