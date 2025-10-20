export default function Home() {
  return (
    <div className="container" style={{marginTop:40}}>
      <h1>SeaBreeze Chat 🌊</h1>
      <p>Next.js + Supabase (Auth, Realtime, Presence)</p>
      <p>
        <a href="/auth/register">Register</a> &nbsp;|&nbsp;
        <a href="/auth/login">Login</a>
      </p>
    </div>
  );
}
