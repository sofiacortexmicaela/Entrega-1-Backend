import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

class cartsManager {
  //----------- Paths ----------------
  static #cartsPath = path.join(
    dirname(fileURLToPath(import.meta.url)),
    "../carts/carts.json"
  );

  // --------------------- accede a losal listado completo de carritos ---------------------
  static async getCarts() {
    try {
      const data = await fs.readFile(this.#cartsPath, "utf8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Error al leer el archivo carts.json:", err);
      return [];
    }
  }

  // --------------------- acceder al carrito por ID ------------------------
  static async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find((cart) => cart.id == id);
  }

  // --------------------- crea un crrito nuevo -----------------------

  static async addCart() {
    const carts = await this.getCarts();
    const newCart = {
      id: carts.length + 1,
      products: [],
    };
    carts.push(newCart);
    await fs.writeFile(this.#cartsPath, JSON.stringify(carts, null, 2));
  }

  // --------------------- agrega un producto a un carrito -----------------------
  static async addProductToCart(cid, pid) {
    const carts = await this.getCarts();
    const cartIndex = carts.findIndex((cart) => cart.id == cid);
    if (cartIndex !== -1) {
      const productIndex = carts[cartIndex].products.findIndex(
        (product) => product.id == pid
      );
      if (productIndex !== -1) {
        carts[cartIndex].products[productIndex].quantity++;
      } else {
        carts[cartIndex].products.push({ id: pid, quantity: 1 });
      }
      await fs.writeFile(this.#cartsPath, JSON.stringify(carts, null, 2));
    }
  }
}

export default cartsManager;
