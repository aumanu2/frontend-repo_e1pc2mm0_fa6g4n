import { useEffect, useState } from 'react'

function App() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', quantity: 1 })
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${baseUrl}/events`)
      if (!res.ok) throw new Error('Failed to load events')
      const data = await res.json()
      if (data.length === 0) {
        // Seed sample events if empty
        const seed = await fetch(`${baseUrl}/events/seed`, { method: 'POST' })
        const seeded = await seed.json()
        setEvents(seeded)
      } else {
        setEvents(data)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const book = async (e) => {
    e.preventDefault()
    if (!selected) return
    try {
      const res = await fetch(`${baseUrl}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity), event_id: selected.id })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Booking failed')
      }
      const data = await res.json()
      alert(`Booking confirmed! Ref: ${data.id}`)
      setSelected(null)
      setForm({ name: '', email: '', quantity: 1 })
      fetchEvents()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="sticky top-0 backdrop-blur bg-white/70 border-b border-white/40 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight text-indigo-700">Concert Tickets</div>
          <a href="/test" className="text-sm text-indigo-600 hover:text-indigo-800">System check</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Book your next concert</h1>
        {loading && (
          <div className="text-gray-600">Loading events...</div>
        )}
        {error && (
          <div className="text-red-600">{error}</div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              {ev.image && (
                <img src={ev.image} alt={ev.title} className="h-40 w-full object-cover" />
              )}
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-xs uppercase tracking-wide text-gray-500">{new Date(ev.date).toLocaleString()}</div>
                <h3 className="text-lg font-semibold text-gray-900 mt-1">{ev.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{ev.venue}, {ev.city}</p>
                <div className="mt-auto">
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-indigo-700 font-bold">${ev.price.toFixed(2)}</span>
                    <span className={`text-sm ${ev.tickets_available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {ev.tickets_available} left
                    </span>
                  </div>
                  <button
                    disabled={ev.tickets_available === 0}
                    onClick={() => setSelected(ev)}
                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-2 rounded-lg transition"
                  >
                    {ev.tickets_available === 0 ? 'Sold Out' : 'Book Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Book tickets for {selected.title}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={book} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input type="number" min="1" max={selected.tickets_available} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg">Confirm Booking</button>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/40 bg-white/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-600">© {new Date().getFullYear()} Concert Tickets. All rights reserved.</div>
      </footer>
    </div>
  )
}

export default App
