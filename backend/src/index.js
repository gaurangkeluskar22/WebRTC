const {Server} = require('socket.io')

const io = new Server(8000, {cors: true})

const emailToSocketMap = new Map()
const socketToEmailMap = new Map()
const roomToSocketIdMap = new Map()

io.on("connection", (socket)=>{
    console.log("User has been connected:", socket?.id)

    socket.on("user:join", (data)=>{
        const {email, room} = data
        emailToSocketMap.set(email, socket?.id)
        socketToEmailMap.set(socket?.id, email)
        console.log("e:", emailToSocketMap)

         // join the user inside the room 
         socket.join(room)
         // check if room is created or not, if not then create else append user inside the room
         const isRoom = roomToSocketIdMap.get(room)
         if(isRoom){
            const socketIds = roomToSocketIdMap.get(room)
            socketIds.push({email, id : socket?.id})
            roomToSocketIdMap.set(room, socketIds)
         }
         else{
            roomToSocketIdMap.set(room, [{email, id : socket?.id}])
         }
         // pushed the user inside the room
         io.to(socket?.id).emit("user:room:join", data)
        // inform the room that user has joined
        data = roomToSocketIdMap.get(room)
        data.map((data)=>{
            io.to(room).emit('user:room:joined', data)
        })
    });

    socket.on("user:call", (data)=>{
        const {to, offer} = data
        io.to(to).emit('user:incomming:call', {from : socket.id, offer})
    })

    socket.on("user:call:accepted", (data)=>{
        const {to, ans} = data
        io.to(to).emit('user:call:accepted', {from : socket.id, ans})
    })

    socket.on("disconnect",()=>{
        console.log("user disconnected", socket?.id)
        const email = socketToEmailMap.get(socket?.id)
        emailToSocketMap.delete(email)
        socketToEmailMap.delete(socket?.id)
        
    })
})