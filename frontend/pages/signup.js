import { useState } from 'react';
import { signup as doSignup } from '../lib/clientAuth';
import { useRouter } from 'next/router';

export default function Signup(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const router = useRouter();

  const [error,setError] = useState(null);
  async function submit(e){
    e.preventDefault();
    setError(null);
    const res = await doSignup(email, password);
    if (res.token) {
      if (props && props.setUser) props.setUser(res.user);
      router.push('/');
    } else setError(res.error || 'Signup failed');
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Sign up</h2>
        <form onSubmit={submit}>
          {error && <div style={{color:'red'}}>{error}</div>}
          <div className="form-row"><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/></div>
          <div className="form-row"><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"/></div>
          <button type="submit">Create account</button>
        </form>
      </div>
    </div>
  )
}
