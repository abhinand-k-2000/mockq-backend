"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
console.log("sockeet server funcditon");
function socketServer(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: ["http://localhost:5173"],
        },
    });
    io.on("connection", (socket) => {
        console.log("socket connected: ", socket.id);
        socket.on("setup", (user) => {
            console.log("userroom: ", user);
            socket.join(user);
            socket.emit("connected");
        });
        socket.on('join chat', (room) => {
            socket.join(room);
            console.log("User joined room: ", room);
        });
        socket.on("new message", (newMessageRecieved) => {
            console.log("new message recieved: ", newMessageRecieved);
            const { chat } = newMessageRecieved;
            if (!chat.users) {
                return console.log("users not found in the chat");
            }
            chat.users.forEach((user) => {
                if (user._id === newMessageRecieved.sender._id)
                    return;
                socket.in(user._id).emit("message received", newMessageRecieved);
                // socket.to(user._id).emit("message revcieved", newMessageRecieved)
            });
        });
        socket.on("disconnect", () => {
            console.log("socket.io disconnected");
        });
    });
}
exports.default = socketServer;
