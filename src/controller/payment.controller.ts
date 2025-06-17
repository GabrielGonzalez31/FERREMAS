import { ACCESS_TOKEN } from "../config";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { Request, Response } from "express";
import { PayerRequest } from "mercadopago/dist/clients/payment/create/types";
import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { db } from "../database/conexion";
import fetch from "node-fetch"; 

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN,
  options: {
    timeout: 5000,
  },
});
const payment = new Payment(client);

//Crea orden de pago

export const createOrder = async (req: Request, res: Response) => {
  try {
    const itemsToPay = req.body.items.map((item: any) => ({
  id: item.id,
  title: item.nombre,
  description: item.nombre,
  quantity: 1,
  unit_price: item.precio,
}));
    // Validación de items
    let result: PreferenceResponse | undefined;
    const preference = new Preference(client);
    await preference.create({
      body: {
        items: itemsToPay,
        back_urls: {
          success: "http://localhost:3000/api/pago/success",
          failure: "http://localhost:3000/api/pago/failure",
          pending: "http://localhost:3000/api/pago/pending",
        },
        notification_url: "https://thoroughly-helping-cockatoo.ngrok-free.app/api/pago/webhook",
        metadata: {
            usuario_id: req.body.usuario_id,
            productos: req.body.items       
        }
    },
      requestOptions: {
        timeout: 5000,
      },
    }).then(x => {
        console.log(x)
        result = x;
    }).catch(err => {
        console.log(err);
    });
    console.log("Pago creado: ",result);
    res.status(200).json({url: result?.sandbox_init_point});
  } catch (error) {
    console.log("Error al crear un pago: ", error);
    res.status(500).json({ message: "Error al crear el pago" });
  }

};

// Procesa el pago exitoso
export const success = async(req: Request, res: Response) => {
    try {
        const data = req.query as unknown as PaymentResponse;
        console.log("Data del pago recibido: ", data);
        //Procesar el estado del pago en la base de datos
        res.status(200).json({
            message:"Pago relizado de forma exitosa",
            data,
        });
    } catch (error) {
        console.log('Error en el pago: ', error);
    }
}

// Procesa el pago fallido
export const failure = async(req: Request, res: Response) => {
    try {
        const data = req.query as unknown as PaymentResponse;
        console.log("Data del pago recibido: ", data);
    } catch (error) {
        console.log('Error en el pago: ', error);
    }
}

// Procesa el pago pendiente
export const pending = async(req: Request, res: Response) => {
    try {
        const data = req.query as unknown as PaymentResponse;
        console.log("Data del pago recibido: ", data);
    } catch (error) {
        console.log("Error en el pago: ", error);
    }
}

// Webhook para recibir notificaciones de Mercado Pago
/*export const webhook = async (req: Request, res: Response) => {
    try {
        console.log("WEBHOOK RECIBIDOOOOOO!!!!!:", JSON.stringify(req.body)); // <-- Agrega este log

        const body = req.body;

        // Verifica que el body tenga la estructura esperada
        if (body.type === "payment" || body.topic === "payment") {
            const paymentId = body.data?.id || body["data.id"];
            if (!paymentId) return res.status(400).send("No payment id");

            // Consulta el detalle del pago a la API de Mercado Pago
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    Authorization: `Bearer ${process.env.ACCESS_TOKEN || ACCESS_TOKEN}`,
                },
            });
            const paymentData = await response.json() as any;

            // Extrae los datos relevantes
            const estado = paymentData.status;
            const id_pago = paymentData.id;
            const usuario_id = paymentData.metadata?.usuario_id || null;
            const comprador_nombre = paymentData.payer?.first_name + " " + paymentData.payer?.last_name;
            const productos = paymentData.metadata?.productos || "[]";

            // Guarda el pedido solo si es aprobado
            console.log("ESTADO DEL PAGO!!!!:", estado);
            console.log("paymentData!!!:", paymentData);
            if (estado === "approved") {
                await db.query(
                    "INSERT INTO pedidos (id_pago, estado, productos, usuario_id, comprador_nombre) VALUES (?, ?, ?, ?, ?)",
                    [id_pago, "Pendiente", JSON.stringify(productos), usuario_id, comprador_nombre]
                );
            }
        }

        res.status(200).send("Webhook recibido correctamente");
    } catch (error) {
        console.log("Error en webhook de Mercado Pago:", error);
        res.status(500).send("Error");
    }
};*/

export const webhook = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const tipo = body.type || body.topic;
        const id = body.data?.id || body["data.id"];

        console.log("Tipo de notificación:", tipo);
        console.log("ID recibido:", id);

        if (tipo === "payment" && id) {
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
                headers: {
                    Authorization: `Bearer ${process.env.ACCESS_TOKEN || ACCESS_TOKEN}`,
                },
            });
            const paymentData = await response.json() as any;

            if (paymentData.status === 404 || paymentData.error === "not_found") {
                console.log("El pago aún no está disponible. Intenta más tarde.");
                return res.status(200).send("Payment not found yet");
            }

            // Solo registra si el pago está aprobado
            if (paymentData.status === "approved") {
                // Asegúrate de que metadata tenga productos y usuario_id
                const productos = paymentData.metadata?.productos || [];
                const usuario_id = paymentData.metadata?.usuario_id || null;
                const comprador_nombre = paymentData.payer?.first_name + " " + paymentData.payer?.last_name;

                await db.query(
                    "INSERT INTO pedidos (id_pago, estado, productos, usuario_id, comprador_nombre) VALUES (?, ?, ?, ?, ?)",
                    [paymentData.id, "Pendiente", JSON.stringify(productos), usuario_id, comprador_nombre]
                );
                console.log("Pedido registrado en la base de datos.");
            }
        }

        res.status(200).send("OK");
    } catch (error) {
        console.log("Error en webhook de Mercado Pago:", error);
        res.status(500).send("Error");
    }
};