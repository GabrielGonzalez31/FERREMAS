import { db } from "../database/conexion";
import { Request, Response } from "express";

// Obtener todos los pedidos
export const getPedidos = async (_req: Request, res: Response) => {
    const [rows]: any = await db.query("SELECT * FROM pedidos ORDER BY fecha DESC");
    res.json(rows);
};

// Actualizar estado de un pedido
export const updateEstadoPedido = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { estado } = req.body;
    await db.query("UPDATE pedidos SET estado=? WHERE id=?", [estado, id]);
    res.json({ message: "Estado actualizado" });
};