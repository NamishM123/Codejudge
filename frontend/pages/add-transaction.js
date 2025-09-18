import { useEffect, useState } from 'react';
import { get, post } from '../lib/api';
import { useRouter } from 'next/router';

export default function AddTransaction(){
  const [type,setType]=useState('expense');
  const [amount,setAmount]=useState('');
  const [category,setCategory]=useState('');
  const [note,setNote]=useState('');
  const [categories,setCategories]=useState([]);
  const router = useRouter();

  useEffect(()=>{
    get('/categories').then(setCategories);
  },[]);

  async function submit(e){
    e.preventDefault();
    const token = localStorage.getItem('token');
    const amt = parseFloat(amount);
    if (Number.isNaN(amt) || amt <= 0) return alert('Enter a valid amount');
    if (type === 'expense' && !category) return alert('Select a category for expenses');
    const res = await post('/transactions', { type, amount: amt, category_id: category || null, note }, token);
    if (res.id) router.push('/'); else alert(res.error || 'Failed');
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Add transaction</h2>
        <form onSubmit={submit}>
          <div className="form-row">
            <select value={type} onChange={e=>setType(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="form-row"><input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount"/></div>
          <div className="form-row">
            <select value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="">Select category</option>
              {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-row"><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note (optional)"/></div>
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  )
}
