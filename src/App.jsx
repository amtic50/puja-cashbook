import React, { useEffect, useState } from 'react'

const API_GET = '/.netlify/functions/getEntries'
const API_ADD = '/.netlify/functions/addEntry'

export default function App(){
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), type: 'Donation', mode: 'Cash', particulars:'', amount:'', txn:'' , collectedBy: '' })
  const [filterDate, setFilterDate] = useState('')

  useEffect(()=>{ fetchEntries() }, [])

  async function fetchEntries(){
    setLoading(true)
    try{
      const res = await fetch(API_GET)
      const data = await res.json()
      setEntries(data.rows || [])
    }catch(err){
      console.error(err)
      alert('Failed to fetch entries. Check functions and env variables.')
    }finally{ setLoading(false) }
  }

  async function handleAdd(e){
    e.preventDefault()
    if(!form.amount || Number(form.amount) <= 0) return alert('Enter valid amount')
    const payload = { ...form }
    setLoading(true)
    try{
      const res = await fetch(API_ADD, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      const r = await res.json()
      if(r.success){
        setForm({ date: new Date().toISOString().slice(0,10), type: 'Donation', mode: 'Cash', particulars:'', amount:'', txn:'', collectedBy: '' })
        fetchEntries()
      } else alert('Failed to add: ' + (r.error||'unknown'))
    }catch(err){ console.error(err); alert('Failed to add entry') }
    finally{ setLoading(false) }
  }

  function runningBalance(list){
    let bal = 0
    return list.map((row)=>{
      const amt = Number(row.Amount || 0)
      if(row.Type === 'Donation') bal += amt
      else bal -= amt
      return { ...row, balance: bal }
    })
  }

  const displayed = filterDate ? entries.filter(r=>r.Date === filterDate) : entries
  const withBal = runningBalance(displayed)

  const totals = displayed.reduce((acc,row)=>{
    const amt = Number(row.Amount||0)
    if(row.Type === 'Donation') { if(row.Mode==='Cash') acc.cashIn += amt; else acc.onlineIn += amt }
    else { if(row.Mode==='Cash') acc.cashOut += amt; else acc.onlineOut += amt }
    return acc
  }, { cashIn:0, onlineIn:0, cashOut:0, onlineOut:0 })

  function exportCSV(){
    const cols = ['Date','Type','Mode','Particulars','Amount','Receipt/Txn ID','Collected By','Verified By']
    const rows = entries.map(r => cols.map(c=> (r[c]||'') ) )
    const csv = [cols.join(','), ...rows.map(r=> r.map(cell=> '"'+String(cell).replace(/"/g,'""')+'"').join(','))].join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'cashbook_entries.csv'; a.click();
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h2>APDCL Vishwakarma Puja Cashbook — 2025</h2>
          <small>Netlify + Google Sheets backend</small>
        </div>
        <div className="controls">
          <button className="ghost" onClick={fetchEntries} disabled={loading}>Refresh</button>
          <button className="ghost" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>
      {/* Form and Table omitted for brevity (same as provided earlier) */}
    </div>
  )
}
