import express from "express";
import cors from "cors"
import adminRoute from "../routes/adminRoute"
import candidateRoute from "../routes/candidateRoute"
import interviewerRoute from "../routes/interviewerRoute"
import http from "http"
import cookieParser from "cookie-parser"



const createServer = () => {
    try {
       const app = express();
       app.use(express.json())  
       app.use(express.urlencoded({extended: true}))
       app.use(cookieParser())  
    app.use(
        cors({
          origin: 'http://localhost:5173',
          credentials: true 
        })
      );

      
    app.use('/api/admin', adminRoute)
    app.use('/api/candidate', candidateRoute)
    app.use('/api/interviewer', interviewerRoute)



    const server = http.createServer(app)
    return server
    } catch (error) {
        console.log(error)
    }
}

export default createServer