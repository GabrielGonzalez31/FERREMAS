import { Request, Response } from "express";
import { db } from "../database/conexion";

// Obtener todos los productos
export const getProductos = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM productos"); // <-- debe ser 'productos'
    res.json(rows);
  } catch (error) {
    console.error(error); // Para ver el error real en consola
    res.status(500).json({ error: "Error al obtener productos" });
  }
};



// Obtener un producto por ID
export const getProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await db.query("SELECT * FROM productos WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};

// Crear un producto
export const createProducto = async (req: Request, res: Response) => {
  try {
    const { Nombre, Descripcion, Precio, Imagen } = req.body;
    const [result]: any = await db.query(
      "INSERT INTO productos (Nombre, Descripcion, Precio, Imagen) VALUES (?, ?, ?, ?)",
      [Nombre, Descripcion, Precio, Imagen]
    );
    res.json({ id: result.insertId, Nombre, Descripcion, Precio, Imagen });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
};

// Actualizar un producto
export const updateProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { Nombre, Descripcion, Precio, Imagen } = req.body;
    await db.query(
      "UPDATE productos SET Nombre = ?, Descripcion = ?, Precio = ?, Imagen = ? WHERE id = ?",
      [Nombre, Descripcion, Precio, Imagen, id]
    );
    res.json({ id, Nombre, Descripcion, Precio, Imagen });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

// Eliminar un producto
export const deleteProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM productos WHERE id = ?", [id]);
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};