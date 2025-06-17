"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pending = exports.failure = exports.success = exports.createOrder = void 0;
const config_1 = require("../config");
const mercadopago_1 = require("mercadopago");
const client = new mercadopago_1.MercadoPagoConfig({
    accessToken: config_1.ACCESS_TOKEN,
    options: {
        timeout: 5000,
    },
});
const payment = new mercadopago_1.Payment(client);
//*Crear orden de pago
const createOrder = async (req, res) => {
    try {
        const itemsToPay = [
            {
                id: "001",
                title: "Martillo",
                description: "MARTILLO VERDE",
                picture_url: "https://www.mercadopago.com/org-img/MP3/home/logomp3.gif",
                category_id: "1",
                quantity: 2,
                unit_price: 1000,
            },
            {
                id: "002",
                title: "Destornillador",
                description: "Destornillador azul",
                picture_url: "https://www.mercadopago.com/org-img/MP3/home/logomp3.gif",
                category_id: "2",
                quantity: 2,
                unit_price: 2000,
            },
        ];
        let result;
        const preference = new mercadopago_1.Preference(client);
        await preference.create({
            body: {
                items: itemsToPay,
                back_urls: {
                    success: "http://localhost:3000/api/pago/success",
                    failure: "http://localhost:3000/api/pago/failure",
                    pending: "http://localhost:3000/api/pago/pending",
                },
            },
            requestOptions: {
                timeout: 5000,
            },
        }).then(x => {
            console.log(x);
            result = x;
        }).catch(err => {
            console.log(err);
        });
        console.log("Pago creado: ", result);
        res.status(200).json({ url: result?.sandbox_init_point });
    }
    catch (error) {
        console.log("Error al crear un pago: ", error);
        res.status(500).json({ message: "Error al crear el pago" });
    }
};
exports.createOrder = createOrder;
const success = async (req, res) => {
    try {
        const data = req.query;
        console.log("Data del pago recibido: ", data);
        //Procesar el estado del pago en la base de datos
        res.status(200).json({
            message: "Pago relizado de forma exitosa",
            data,
        });
    }
    catch (error) {
        console.log('Error en el pago: ', error);
    }
};
exports.success = success;
const failure = async (req, res) => {
    try {
        const data = req.query;
        console.log("Data del pago recibido: ", data);
    }
    catch (error) {
        console.log('Error en el pago: ', error);
    }
};
exports.failure = failure;
const pending = async (req, res) => {
    try {
        const data = req.query;
        console.log("Data del pago recibido: ", data);
    }
    catch (error) {
        console.log("Error en el pago: ", error);
    }
};
exports.pending = pending;
