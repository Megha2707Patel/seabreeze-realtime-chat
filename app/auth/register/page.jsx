"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (error) return alert(error.message);
    alert("Registered! Now login.");
    window.location.href = "/auth/login";
  }

  return (
    <div className="auth">
      <h2>Create Account</h2>
      <form onSubmit={submit}>
        <input name="email" placeholder="Email" onChange={handle} required />
        <input name="password" type="password" placeholder="Password" onChange={handle} required />
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a href="/auth/login">Login</a></p>
    </div>
  );
}
