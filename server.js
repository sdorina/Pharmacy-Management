import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let medicines = [
  { id: 1, name: "Paracetamol", price: 20, quantity: 50 },
  { id: 2, name: "Amoxicillin", price: 35, quantity: 20 },
  { id: 3, name: "Vitamin C", price: 15, quantity: 30 }
];

app.get("/api/medicines", (req, res) => {
  res.json(medicines);
});

app.post("/api/medicines", (req, res) => {
  const { name, price, quantity } = req.body;

  if (!name || price === "" || price == null || quantity === "" || quantity == null) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  const parsedPrice = Number(price);
  const parsedQuantity = Number(quantity);

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0 ||
      !Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
    return res.status(400).json({ message: "Enter a valid price and whole-number quantity." });
  }

  const newMedicine = {
    id: Date.now(),
    name: String(name).trim(),
    price: parsedPrice,
    quantity: parsedQuantity
  };

  if (!newMedicine.name) {
    return res.status(400).json({ message: "Medicine name is required." });
  }

  medicines.push(newMedicine);
  res.status(201).json(newMedicine);
});

app.delete("/api/medicines/:id", (req, res) => {
  const id = Number(req.params.id);
  const oldLength = medicines.length;
  medicines = medicines.filter(medicine => medicine.id !== id);

  if (medicines.length === oldLength) {
    return res.status(404).json({ message: "Medicine not found." });
  }

  res.json({ message: "Medicine deleted." });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Pharmacy server running at http://localhost:${PORT}`);
});