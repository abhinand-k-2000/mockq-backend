import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import adminRoute from "../routes/adminRoute";
import candidateRoute from "../routes/candidateRoute";
import interviewerRoute from "../routes/interviewerRoute";
import paymentRoute from "../routes/paymentRoute";
import http from "http";
import cookieParser from "cookie-parser";
import errorMiddleware from "../middlewares/errorMiddleware";

const createServer = () => {
  try {
    const app = express();

    app.use( (req: Request, res: Response, next: NextFunction) => {
      if(req.originalUrl === '/api/payment/webhook') {
        next()
      }else{ 
        express.json()(req, res, next)
      }
    })

      
      
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(
      cors({
        origin: "http://localhost:5173",
        credentials: true,
      })
    );

    app.use("/api/admin", adminRoute);
    app.use("/api/candidate", candidateRoute);
    app.use("/api/interviewer", interviewerRoute);
    app.use("/api/payment", paymentRoute);

    app.use(errorMiddleware);
    const server = http.createServer(app);
    return server;
  } catch (error) {
    console.log(error);
  }
};

export default createServer;
