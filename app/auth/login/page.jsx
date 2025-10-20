"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) return alert(error.message);
    window.location.href = "/chat";
  }

  return (
    <div className="auth">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input name="email" placeholder="Email" onChange={handle} required />
        <input name="password" type="password" placeholder="Password" onChange={handle} required />
        <button type="submit">Login</button>
      </form>
      <p>No account? <a href="/auth/register">Register</a></p>
    </div>
  );
}
