import { post } from './api';

export async function signup(email, password){
  if (!email || !password) return { error: 'Email and password required' };
  if (!email.includes('@')) return { error: 'Invalid email' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters' };
  const res = await post('/auth?action=signup', { email, password });
  if (res.token) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }
  return res;
}

export async function login(email, password){
  if (!email || !password) return { error: 'Email and password required' };
  const res = await post('/auth?action=login', { email, password });
  if (res.token) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }
  return res;
}
