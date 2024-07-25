"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const adminRoute_1 = __importDefault(require("../routes/adminRoute"));
const candidateRoute_1 = __importDefault(require("../routes/candidateRoute"));
const interviewerRoute_1 = __importDefault(require("../routes/interviewerRoute"));
const paymentRoute_1 = __importDefault(require("../routes/paymentRoute"));
const chatRoute_1 = __importDefault(require("../routes/chatRoute"));
const http_1 = __importDefault(require("http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorMiddleware_1 = __importDefault(require("../middlewares/errorMiddleware"));
const socketServer_1 = __importDefault(require("./socketServer"));
const createServer = () => {
    try {
        const app = (0, express_1.default)();
        app.use((req, res, next) => {
            if (req.originalUrl === '/api/payment/webhook') {
                next();
            }
            else {
                express_1.default.json()(req, res, next);
            }
        });
        app.use(express_1.default.urlencoded({ extended: true }));
        app.use((0, cookie_parser_1.default)());
        app.use((0, cors_1.default)({
            origin: "http://localhost:5173",
            credentials: true,
        }));
        app.use("/api/admin", adminRoute_1.default);
        app.use("/api/candidate", candidateRoute_1.default);
        app.use("/api/interviewer", interviewerRoute_1.default);
        app.use("/api/payment", paymentRoute_1.default);
        app.use('/api/chat', chatRoute_1.default);
        app.use(errorMiddleware_1.default);
        const server = http_1.default.createServer(app);
        (0, socketServer_1.default)(server);
        return server;
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = createServer;
