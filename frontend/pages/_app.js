import '../styles.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';

function Header({ user, onLogout }){
  return (
    <div style={{background:'#111827',color:'white',padding:'12px 24px'}}>
      <div className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontWeight:700}}>Finance Tracker</div>
        <div>
          <Link href="/"><button style={{marginRight:8}}>Dashboard</button></Link>
          {user ? (
            <>
              <span style={{marginRight:8}}>Hi, {user.email}</span>
              <button onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login"><button style={{marginRight:8}}>Login</button></Link>
              <Link href="/signup"><button>Sign up</button></Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  useEffect(()=>{
    try{
      const token = localStorage.getItem('token');
      const userRaw = localStorage.getItem('user');
      if (token && userRaw) setUser(JSON.parse(userRaw));
    }catch(e){}
  },[]);

  function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <>
      <Header user={user} onLogout={logout} />
      <Component {...pageProps} setUser={setUser} user={user} />
    </>
  )
}
