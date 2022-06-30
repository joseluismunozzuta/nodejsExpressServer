const fs = require('fs');
const express = require('express');
const app = express();

const crearProducto = (title, price, thumbnail) => {
    const p = new Object();
    p.title = title;
    p.price = price;
    p.thumbnail = thumbnail;
    return p;
}

class Contenedor {
    constructor(filename) {
        this.filename = filename;
    }

    async leerArchivoJSON() {
        try {
            const contenido = await fs.promises.readFile(this.filename, 'utf-8');
            const vacio = [];
            if (contenido === "") {
                return vacio;
            } else {
                const obj = JSON.parse(contenido);
                return obj;
            }
        }
        catch (err) {
            console.log(err.message);
        }
    }

    checkIfFileExists() {
        fs.open('./productos.txt', 'r', 0o666, async (fileExists, file) => {
            if (file) {
                console.log("here");
                return;
            } else {
                try {
                    await fs.promises.writeFile(this.filename, "");
                    console.log("Se creo archivo productos.txt");
                    return;
                }
                catch (err) {
                    console.log("Hola")
                    console.log(err.message);
                }
            }
        })
    }

    async save(o) {

        //await fs.promises.writeFile(this.filename, "");
        const jsonObjects = [];
        let objetos = await this.getAll();
        let maxId = 0;
        for (let ob of objetos) {
            jsonObjects.push(ob);
            if (ob.id > maxId) {
                maxId = ob.id;
            }
        }
        if (maxId == 0) {
            o.id = 1;
            jsonObjects.push(o);
        } else {
            o.id = maxId + 1;
            jsonObjects.push(o);
        }

        let jsonString = JSON.stringify(jsonObjects);
        console.log(jsonString);

        try {
            await fs.promises.writeFile(this.filename, jsonString);
            console.log("Se guardo el producto con id: ");
            console.log(o.id);
            return o.id;
        }
        catch (err) {
            console.log(err.message);
        }
    }

    async getById(searchedId) {
        const obj = await this.leerArchivoJSON();
        for (let o of obj) {
            if (o.id == searchedId) {
                console.log("The product searched is:")
                console.log(o);
                return o;
            }
        }
        console.log("No existe el producto con el id buscado");
        return null;
    }

    async deleteById(searchedId) {
        const obj = await this.leerArchivoJSON();
        let index = 0;
        for (let o of obj) {
            if (o.id == searchedId) {
                obj.splice(index, 1);
                let jsonString = JSON.stringify(obj);
                try {
                    await fs.promises.writeFile(this.filename, jsonString);
                    console.log("The new list of products is");
                    console.log(obj);
                    return;
                }
                catch (err) {
                    console.log(err.message);
                }
            }
            index++;
        }
        console.log("No existe el producto con el id buscado");
    }

    async getAll() {
        try {
            const contenido = await fs.promises.readFile(this.filename, 'utf-8');
            const obj = await this.leerArchivoJSON();
            console.log("This trace is from function getAll");
            console.log(obj);
            return obj;
        }
        catch (err) {
            console.log("No hay archivo");
            console.log(err.message);
            return [];
        }
    }

    async countAllProds(){
        const objs = await this.getAll();
        let cant = 0;
        for(let o of objs){
            cant++;
        }
        return cant;
    }

    async deleteAll() {
        try {
            await fs.promises.writeFile(this.filename, '');
        }
        catch (err) {
            console.log(err.message);
        }
    }

}

const c = new Contenedor("./productos.txt");
//const prod = crearProducto("This is a product", 500, "This is the url");
//c.save(prod);

const PORT = 8080;

const server = app.listen(PORT, () => {
   console.log(`Servidor http escuchando en el puerto ${server.address().port}`)
})
server.on("error", error => console.log(`Error en servidor ${error}`));
app.get('/products', async (req, res) => {
    const prods = await c.getAll();
    const countProds = async () => {
        let i = 0;
        for(let o of prods){
            i++;
        }
        return i;
    }
    let cantProds = countProds();
    res.send(prods);
 })

 app.get('/productoRandom', async (req, res) => {
    let cantProds = await c.countAllProds();
    let random = Math.floor((Math.random() * cantProds) + 1);
    let randObj = await c.getById(random);
    res.send(randObj);
 })
 

