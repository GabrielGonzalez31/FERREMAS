"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
class Server {
    constructor() {
        this.apiPaths = {
            pago: "/api/pago",
        };
        this.app = (0, express_1.default)();
        this.port = process.env.PORT ?? '3000';
        this.middlewares();
        this.routes();
    }
    routes() {
        this.app.use(this.apiPaths.pago, payment_routes_1.default);
    }
    middlewares() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.static(path_1.default.resolve("src/public")));
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log("Servidor corriendo en el puerto: ", this.port);
        });
    }
}
exports.Server = Server;
