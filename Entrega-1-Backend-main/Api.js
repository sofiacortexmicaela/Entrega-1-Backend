import express from "express";
import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import productManager from "./productManager/productManager.js";
import cartsManager from "./cartsManager/cartsManager.js";


const app = express();
const PORT = 8080 || process.env.PORT;

app.use(express.json());

//----------- Paths ----------------


const cartsPath = path.join(
  dirname(fileURLToPath(import.meta.url)),
  "./carts/carts.json"
);

const htmlPath = path.join(
  dirname(fileURLToPath(import.meta.url)),
  "./index.html"
);

const docsPath = path.join(
  dirname(fileURLToPath(import.meta.url)),
  "./docs/docs.html"
);

//----------- HOME -------------
app.get("/", (req, res) => {
  res.sendFile(htmlPath);
});

//--------------------- DOCUMENTACION ---------------------

app.get("/api/docs", (req, res) => {
  res.sendFile(docsPath);
})

//--------------------- PRODUCTOS ---------------------

//accede al listado completo de productos
app.get("/api/products", async (req, res) => {
  res.send(await productManager.getProducts());
});

//-------------------- accede al producto por ID ------------------------
app.get("/api/products/:pid", async (req, res) => {
  const pid = parseInt(req.params.pid);

  if (productManager.getProductById(pid)) {
    res.json(await productManager.getProductById(pid));
  } else {
    res.status(404).json({ error: "Producto no encontrado" });
  }
});

//--------------------------- agregar producto ----------------------
app.post("/api/products", async (req, res) => {
  await productManager.addProduct(req.body);
  res.status(201).json(await productManager.getProducts());
});

//---------------------- actualiza datos de un producto ------------------------
app.put("/api/products/:pid", async (req, res) => {
  const pid = parseInt(req.params.pid);

  if (productManager.getProductById(pid)) {
    await productManager.updateProduct(pid, req.body);
    res.json(await productManager.getProductById(pid));
  } else {
    res.status(404).json({ error: "Producto no encontrado" });
  }
});

//------------------ borrar un producto por ID ----------------------------
app.delete("/api/products/:pid", async (req, res) => {
  const pid = parseInt(req.params.pid);

  if (productManager.getProductById(pid)) {
    await productManager.deleteProduct(pid);
    res.status(200).json({ message: "Producto eliminado" });
  } else {
    res.status(404).json({ error: "Producto no encontrado" });
  }
});

//------------------- Carrito -------------------

//----------------------- acceder al carrito por ID ------------------------
app.get("/api/carts/:cid", async (req, res) => {
  const cid = parseInt(req.params.cid);

  if (cartsManager.getCartById(cid)) {
    res.json(await cartsManager.getCartById(cid));
  } else {
    res.status(404).json({ error: "Carrito no encontrado" });
  }
});

// ----------------- crea un crrito nuevo -----------------------

app.post("/api/carts", async (req, res) => {
  await cartsManager.addCart();
  res.status(201).json(await cartsManager.getCarts());
});

//------------------ agrega un producto al carrito --------------------
app.post("/api/carts/:cid/product/:pid", async (req, res) => {
  let objCart = [];
  objCart.push(await cartsManager.getCarts());
  let objProducts = [];
  objProducts.push(await productManager.getProducts());

  const cid = parseInt(req.params.cid);
  const pid = parseInt(req.params.pid);

  const newItem = {
    id: pid,
    quantity: 1,
  };

  const cart = objCart[0].find((cart) => cart.id === cid);

  if (!cart) {
    res.status(404).json({ error: "Carrito no encontrado" });
  } else {
    const product = objProducts[0].find((product) => product.id === pid);
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
    } else {
      const item = cart.products.find((item) => item.id === pid);
      if (item) {
        item.quantity++;
      } else {
        cart.products.push(newItem);
      }
      await fs.writeFile(cartsPath, JSON.stringify(objCart[0], null, 2));
      res.json(cart);
    }
  }
});

//-------------------- servidor ------------------------
app.listen(PORT, () => {
  console.log(`servidor escuchando en http://localhost:${PORT}`);
});
