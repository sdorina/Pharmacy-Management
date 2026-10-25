import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [medicines, setMedicines] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadMedicines() {
    try {
      const response = await fetch("/api/medicines");
      if (!response.ok) throw new Error("Could not load medicines.");
      setMedicines(await response.json());
    } catch {
      setMessage("Could not connect to the server. Please make sure the app is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedicines();
  }, []);

  async function addMedicine(event) {
    event.preventDefault();
    setMessage("");

    if (!name.trim() || price === "" || quantity === "") {
      setMessage("Please fill in all three fields.");
      return;
    }
    if (Number(price) < 0 || Number(quantity) < 0 || !Number.isInteger(Number(quantity))) {
      setMessage("Price must be positive and quantity must be a whole number.");
      return;
    }

    try {
      const response = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), price: Number(price), quantity: Number(quantity) })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not add medicine.");

      setMedicines(current => [...current, result]);
      setName("");
      setPrice("");
      setQuantity("");
      setMessage("Medicine added successfully!");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    }
  }

  async function deleteMedicine(id) {
    setMessage("");
    try {
      const response = await fetch(`/api/medicines/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete medicine.");
      setMedicines(current => current.filter(medicine => medicine.id !== id));
      setMessage("Medicine deleted.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(search.toLowerCase())
  );
  const lowStockCount = medicines.filter(medicine => medicine.quantity <= 10).length;
  const totalUnits = medicines.reduce((sum, medicine) => sum + medicine.quantity, 0);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">✚</div>
          <div>
            <h1>PharmaCare</h1>
            <p>Pharmacy management made simple</p>
          </div>
        </div>
        <span className="staff-badge"><span className="online-dot"></span> Staff dashboard</span>
      </header>

      <main className="main-content">
        <section className="welcome-panel">
          <div>
            <span className="eyebrow">YOUR PHARMACY, AT A GLANCE</span>
            <h2>Good day! Let's care for your stock. 💚</h2>
            <p>Keep your medicine inventory organized, up to date, and easy to manage.</p>
          </div>
          <div className="welcome-art" aria-hidden="true">＋</div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon mint">💊</div>
            <div><p>Medicine types</p><strong>{medicines.length}</strong></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon blue">📦</div>
            <div><p>Total units in stock</p><strong>{totalUnits}</strong></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon amber">⚠️</div>
            <div><p>Low-stock items</p><strong>{lowStockCount}</strong></div>
          </article>
        </section>

        <section className="content-grid">
          <section className="panel add-panel">
            <div className="panel-heading">
              <div className="heading-icon">＋</div>
              <div><h3>Add new medicine</h3><p>Enter the medicine details below.</p></div>
            </div>
            <form onSubmit={addMedicine}>
              <label htmlFor="medicine-name">Medicine name</label>
              <input id="medicine-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Paracetamol" />

              <div className="form-row">
                <div>
                  <label htmlFor="medicine-price">Price (Birr)</label>
                  <input id="medicine-price" type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 20" />
                </div>
                <div>
                  <label htmlFor="medicine-quantity">Quantity</label>
                  <input id="medicine-quantity" type="number" min="0" step="1" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 50" />
                </div>
              </div>
              <button className="primary-button" type="submit">＋ Add medicine</button>
              {message && <p className="message" role="status">{message}</p>}
            </form>
          </section>

          <section className="panel inventory-panel">
            <div className="inventory-heading">
              <div><h3>Medicine inventory</h3><p>All medicines currently listed</p></div>
              <span className="count-pill">{medicines.length} items</span>
            </div>

            <div className="search-wrap">
              <span>⌕</span>
              <input aria-label="Search medicines" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicine..." />
            </div>

            {loading ? <div className="empty-state">Loading your inventory…</div> :
              filteredMedicines.length === 0 ? (
                <div className="empty-state">
                  <div>🔎</div>
                  <strong>No medicines found</strong>
                  <p>Try another search or add a new medicine.</p>
                </div>
              ) : (
                <div className="medicine-list">
                  {filteredMedicines.map(medicine => (
                    <article className="medicine-row" key={medicine.id}>
                      <div className="medicine-symbol">💊</div>
                      <div className="medicine-details">
                        <h4>{medicine.name}</h4>
                        <p>{Number(medicine.price).toLocaleString()} Birr <span>·</span> {medicine.quantity} units</p>
                      </div>
                      <span className={`stock-pill ${medicine.quantity <= 10 ? "low" : "available"}`}>
                        {medicine.quantity <= 10 ? "Low stock" : "In stock"}
                      </span>
                      <button className="delete-button" onClick={() => deleteMedicine(medicine.id)} aria-label={`Delete ${medicine.name}`} title="Delete medicine">🗑</button>
                    </article>
                  ))}
                </div>
              )}
          </section>
        </section>

        <footer>Made with care <span>♥</span> · PharmaCare Pharmacy Management System</footer>
      </main>
    </div>
  );
}

export default App;