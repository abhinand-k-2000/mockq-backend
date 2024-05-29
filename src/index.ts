import dotenv from "dotenv";
dotenv.config();
 
import { connectDB } from "./infrastructure/config/connectDB";
import createServer from "./infrastructure/config/app"



const startServer = async () => {
  try { 
    await connectDB(); 
    const app = createServer();
    const PORT = process.env.PORT || 3000;
    app?.listen(PORT, ()=> {
      console.log( `server listening to http://localhost:${PORT}`)
    })
    
  } catch (error) {
    console.log(error)
  }         
}
startServer();

