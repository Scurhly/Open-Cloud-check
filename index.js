import express from "express";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/create-product", async (req, res) => {
  const { amount } = req.body;

  if (!Number.isInteger(amount) || amount < 1 || amount > 20000) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const form = new FormData();
    form.append("name", `Donation ${amount} Robux`);
    form.append("description", `Dynamic donation product for ${amount} Robux`);
    form.append("price", amount.toString()); // ✅ must be string
    form.append("isForSale", "true");

    const response = await fetch(
      `https://apis.roblox.com/developer-products/v2/universes/${process.env.UNIVERSE_ID}/developer-products`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.ROBLOX_API_KEY,
          ...form.getHeaders(),
        },
        body: form,
      }
    );

    const data = await response.json();

    console.log("Roblox API response:", data); // ✅ check what you actually get

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    // Make sure data.id exists
    if (!data.id) {
      console.error("No product ID returned:", data);
      return res.status(500).json({ error: "No product ID returned" });
    }

    res.json({ productId: data.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
