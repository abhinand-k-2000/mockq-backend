import { Server } from "socket.io";

console.log("sockeet server funcditon");

function socketServer(server: any) {
  const io = new Server(server, {
    cors: {
      origin: ["https://mockq.vercel.app"],
      methods: ['GET', 'POST']
    },
  });

  io.on("connection", (socket) => {
    console.log("socket connected: ", socket.id);

    socket.on("setup", (user) => {
      console.log("userroom: ", user);
      socket.join(user)
      socket.emit("connected"); 
    });


    socket.on('join chat', (room) => {
        socket.join(room);
        console.log("User joined room: ", room)
    })


    socket.on("new message", (newMessageRecieved) => {
        console.log("new message recieved: ", newMessageRecieved)
        const {chat} = newMessageRecieved;
        if(!chat.users){
            return console.log("users not found in the chat")
        }
        
        chat.users.forEach((user: any) => {
            if(user._id === newMessageRecieved.sender._id) return ;
            socket.in(user._id).emit("message received", newMessageRecieved)
            // socket.to(user._id).emit("message revcieved", newMessageRecieved)
        })
    }) 




    socket.on("disconnect", () => {
      console.log("socket.io disconnected");
    });
  });
}
    
export default socketServer;
 