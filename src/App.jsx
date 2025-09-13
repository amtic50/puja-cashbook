import React, { useState, useEffect } from "react";

function App() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    date: "",
    type: "Donation",
    mode: "Cash",
    amount: "",
    remarks: ""
  });
  const [error, setError] = useState(null); // Added for UI feedback

  // Fetch entries from Google Sheets
  const fetchEntries = async () => {
    try {
      const res = await fetch("/.netlify/functions/getEntries");
      if (!res.ok) throw new Error("Failed to fetch entries");
      const data = await res.json();
      setEntries(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching entries:", err);
      setError("Could not load entries. Please try again.");
    }
  };

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit new entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.date || parseFloat(form.amount) <= 0) {
      alert("Please enter a valid date and positive amount");
      return;
    }
    try {
      const res = await fetch("/.netlify/functions/addEntry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add entry");
      setForm({
        date: "",
        type: "Donation",
        mode: "Cash",
        amount: "",
        remarks: ""
      });
      fetchEntries(); // refresh
      setError(null);
    } catch (err) {
      console.error("Error adding entry:", err);
      setError("Could not add entry. Please check your connection.");
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Calculate totals
  const totalDonations = entries
    .filter((e) => e.type === "Donation")
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const totalExpenses = entries
    .filter((e) => e.type === "Expense")
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const closingBalance = totalDonations - totalExpenses;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        APDCL Vishwakarma Puja Cashbook — 2025
      </h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 p-4 rounded-xl shadow"
      >
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option>Donation</option>
          <option>Expense</option>
        </select>
        <select
          name="mode"
          value={form.mode}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option>Cash</option>
          <option>Online</option>
        </select>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Amount"
          className="p-2 border rounded"
          min="1" // Added for positive amounts
          required
        />
        <input
          type="text"
          name="remarks"
          value={form.remarks}
          onChange={handleChange}
          placeholder="Remarks"
          className="p-2 border rounded col-span-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded col-span-2"
        >
          Add Entry
        </button>
      </form>

      {/* Summary */}
      <div className="mt-6 p-4 bg-white rounded-xl shadow">
        <p><b>Total Donations:</b> ₹{totalDonations.toFixed(2)}</p>
        <p><b>Total Expenses:</b> ₹{totalExpenses.toFixed(2)}</p>
        <p><b>Closing Balance:</b> ₹{closingBalance.toFixed(2)}</p>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Mode</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i} className="text-center">
                <td className="border p-1">{e.date}</td>
                <td className="border p-1">{e.type}</td>
                <td className="border p-1">{e.mode}</td>
                <td className="border p-1">₹{e.amount}</td>
                <td className="border p-1">{e.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
