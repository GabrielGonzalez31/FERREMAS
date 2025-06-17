import { Router } from "express";
import { getPedidos, updateEstadoPedido } from "../controller/pedido.controller";

const router = Router();

router.get("/", getPedidos);
router.put("/:id", updateEstadoPedido);

export default router;