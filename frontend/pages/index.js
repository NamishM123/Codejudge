import { useEffect, useState } from 'react';
import { get } from '../lib/api';
import Link from 'next/link';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

export default function Dashboard(){
  const [summary,setSummary]=useState(null);
  const [txs,setTxs]=useState([]);

  useEffect(()=>{
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return;
  get('/transactions?summary=true', token).then(setSummary);
  get('/transactions', token).then(setTxs);
  },[]);

  if (!summary) return <div className="container"><div className="card">Loading...</div></div>

  const labels = summary.byCategory.map(c=>c.category);
  const data = summary.byCategory.map(c=>c.total);

  return (
    <div className="container">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>Dashboard</h1>
        <div>
          <Link href="/add-transaction"><button>Add</button></Link>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Total balance</h3>
          <div style={{fontSize:24,fontWeight:700}}>${summary.balance.toFixed(2)}</div>
          <div>Income: ${summary.income.toFixed(2)} | Expenses: ${summary.expenses.toFixed(2)}</div>
        </div>
        <div className="card">
          <h3>Expenses by category</h3>
          <Pie data={{ labels, datasets:[{ data, backgroundColor:['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#06b6d4','#9ca3af'] }]}} />
        </div>
      </div>

      <div style={{marginTop:12}} className="card">
        <h3>Recent transactions</h3>
        <table style={{width:'100%'}}>
          <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Note</th></tr></thead>
          <tbody>
            {txs.map(t=> (
              <tr key={t.id}><td>{new Date(t.occurred_at).toLocaleDateString()}</td><td>{t.type}</td><td>{t.category}</td><td>{t.amount}</td><td>{t.note}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
