import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

class productManager {
  //----------- Paths ----------------
  static #productsPath = path.join(
    dirname(fileURLToPath(import.meta.url)),
    "../products/products.json"
  );

  //--------------------- accede a losal listado completo de productos ---------------------
  static async getProducts() {
    try {
      const data = await fs.readFile(this.#productsPath, "utf8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Error al leer el archivo products.json:", err);
      return [];
    }
  }

  //--------------------- accede al producto por ID ------------------------
  static async getProductById(id) {
    const products = await this.getProducts();
    return products.find((product) => product.id == id);
  }

  //--------------------- crea un producto nuevo -----------------------
  static async addProduct(product) {
    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnail,
    } = product;

    const products = await this.getProducts();
    const newProduct = {
      id: products.length + 1,
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnail,
    };
    products.push(newProduct);
    await fs.writeFile(this.#productsPath, JSON.stringify(products, null, 2));
  }

  //--------------------- actualiza un producto -----------------------
  static async updateProduct(id, updatedProduct) {
    const {
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnail,
      } = updatedProduct;
    const products = await this.getProducts();
    const productIndex = products.findIndex((product) => product.id == id);
    if (productIndex !== -1) {
      products[productIndex] = { ...products[productIndex], ...updatedProduct };
      await fs.writeFile(this.#productsPath, JSON.stringify(products, null, 2));
    }
  }

  static async deleteProduct(id) {
    const products = await this.getProducts();
    const productIndex = products.findIndex((product) => product.id == id);
    if (productIndex !== -1) {
      products.splice(productIndex, 1);
      await fs.writeFile(this.#productsPath, JSON.stringify(products, null, 2));
    }
  }
}

export default productManager;
