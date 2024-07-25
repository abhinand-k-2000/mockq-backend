"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware = (err, req, res, next) => {
    console.log("Inside middleware");
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.log(err);
    res.status(statusCode).json({ success: false, message });
};
exports.default = errorMiddleware;
