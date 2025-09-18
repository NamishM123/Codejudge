import { useState } from 'react';
import { login as doLogin } from '../lib/clientAuth';
import { useRouter } from 'next/router';

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const router = useRouter();

  const [error,setError] = useState(null);
  async function submit(e){
    e.preventDefault();
    setError(null);
    const res = await doLogin(email, password);
    if (res.token) {
      if (props && props.setUser) props.setUser(res.user);
      router.push('/');
    } else setError(res.error || 'Login failed');
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={submit}>
          {error && <div style={{color:'red'}}>{error}</div>}
          <div className="form-row"><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/></div>
          <div className="form-row"><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"/></div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  )
}
