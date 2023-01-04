import express from "express";
import ProductManagerExternal from "./ProductManager.js";

const app = express();
const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${server.address().port}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const ProductManager = new ProductManagerExternal("./productos.json");


app.get("/products", async (req, res) => {
    const { limit } = req.query;
    const productos = await ProductManager.getProducts();
    let limitedProducts;
    if (limit) {
        limitedProducts = productos.slice(0, limit);
        res.send(limitedProducts);
    } else {
        res.send(productos);
    }
});

app.get("/products/:pid?", (req, res) => {
    const { pid } = req.params;
    ProductManager.getProducts().then((data) => {
        let productSearched;
        if (pid) {
            productSearched = data.find(e => e.id == pid);
            if (productSearched) {
                res.send(productSearched);
            } else {
                res.sendStatus(404);
                return;
            }
        } else {
            res.send(data);
        }
    })
})