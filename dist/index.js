"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB_1 = require("./infrastructure/config/connectDB");
const app_1 = __importDefault(require("./infrastructure/config/app"));
const startServer = async () => {
    try {
        await (0, connectDB_1.connectDB)();
        const app = (0, app_1.default)();
        const PORT = process.env.PORT || 3000;
        app?.listen(PORT, () => {
            console.log(`server listening to http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
};
startServer();
