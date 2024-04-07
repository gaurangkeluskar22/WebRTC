import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext"


const Lobby = () => {
    const [email, setEmail] = useState('')
    const [room, setRoom] = useState('')
    const {socket} = useSocket()
    const navigate = useNavigate()

    const handleEmailChange = (e) => {
        const value = e?.target?.value
        setEmail(value)
    }

    const handleRoomChange = (e) => {
        const value = e?.target?.value
        setRoom(value)
    }

    const handleSubmit =  (e)=> {
        e?.preventDefault()
        socket.emit("user:join",{email, room})
    }

    const handleRoomJoin = useCallback((data)=>{
        const {email, room} = data
        navigate(`/room/${room}`)
    },[])

    useEffect(()=>{
        socket.on("user:room:join", handleRoomJoin)
        return () => {
            socket.off("user:room:join", handleRoomJoin)
        }
    },[socket])

    return(
        <div>
            <h1>Lobby</h1>
            <div>
                <input type="text" value={email} placeholder="Enter Email" onChange={handleEmailChange}/><br></br>
                <input type="text" value={room} placeholder="Enter Room" onChange={handleRoomChange}/><br></br>
                <button onClick={handleSubmit}>Enter</button>
            </div>
        </div>
    )
}

export default Lobby