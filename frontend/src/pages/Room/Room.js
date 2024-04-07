import { useCallback, useEffect, useState } from "react"
import ReactPlayer from 'react-player'
import peer from '../../service/peer'
import { useSocket } from "../../context/SocketContext"


const Room = () => {
    const {socket} = useSocket()
    const [currentUserData, setCurrentUserData] = useState(null)
    const [remoteUserData, setRemoteUserData] = useState(null)
    const [myStream, setMyStream] = useState()
    const [remoteStream, setRemoteStream] = useState()

    console.log("r:",remoteUserData)

    const handleUserJoined = useCallback((data)=>{
        const {id} = data
        if(id === socket?.id){
            setCurrentUserData(data)
        }
        else{
            setRemoteUserData(data)
        }
    },[socket])

    const handleIncommingCall = useCallback(async(data)=>{
        const {from, offer} = data
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
        const ans = await peer.getAnswer(offer)
        setMyStream(stream)
        socket.emit("user:call:accepted",{to : from, ans})

    },[socket])

    const sendStream = useCallback(() => {
        // Check if myStream is defined before accessing its methods
        if (myStream) {
            for (const track of myStream.getTracks()) {
                peer.peer.addTrack(track, myStream)
            }
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(async(data)=>{
        const {from, ans} = data
        await peer.setLocalDescription(ans)
        sendStream()
    },[])

    useEffect(() => {
        const handleTrackEvent = (ev) => {
            const remoteStream = ev.streams;
            console.log("GOT TRACKS!!");
            setRemoteStream(remoteStream[0]);
        };
    
        // Add event listener when component mounts
        peer.peer.addEventListener("track", handleTrackEvent);
    
        // Remove event listener when component unmounts
        return () => {
            peer.peer.removeEventListener("track", handleTrackEvent);
        };
    }, [peer]);

    useEffect(()=>{
        peer.peer.addEventListener('negotiationneeded',handleCallUser)
        return()=>{
            peer.peer.removeEventListener('negotiationneeded',handleCallUser)
        }
    },[])

    useEffect(()=>{
        socket.on("user:room:joined",handleUserJoined)
        socket.on("user:incomming:call", handleIncommingCall)
        socket.on("user:call:accepted", handleCallAccepted)
        return()=>{
            socket.off("user:room:joined",handleUserJoined)   
            socket.off("user:incomming:call", handleIncommingCall) 
            socket.off("user:call:accepted", handleCallAccepted)
        }   
    },[socket, handleUserJoined, handleIncommingCall, handleCallAccepted])

    const handleCallUser = async () =>{
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
        const offer = await peer.getOffer()
        socket.emit("user:call", {to: remoteUserData?.id, offer})
        setMyStream(stream)
    }

    return(
        <div>
            <div>Room</div>
            <div>{currentUserData ? 'Connected' : "No one in Room"}</div>
            <div>{currentUserData && `Current User: ${currentUserData?.email}`}</div>
            <div>{remoteUserData && `User has Joined: ${remoteUserData?.email}`}</div>
            <div>{remoteUserData && <button onClick={handleCallUser}>Call</button>}</div>
            <div><button onClick={sendStream}>Send Stream</button></div>
            <div style={{display:'flex', flexDirection:'row'}}>
            {myStream && 
            <div>
                <p>My Stream</p>
                {
                    myStream && 
                    <ReactPlayer
                        controls
                        playing
                        url={myStream}
                        width="300px"
                        height="200px"
                    />
                }
            </div>
            }
            {
                remoteStream &&
                <div>
                    <p>{remoteUserData?.email}'s stream</p>
                    {
                        remoteStream && 
                        <ReactPlayer
                            controls
                            playing
                            url={remoteStream}
                            width="800px"
                            height="350px"
                        />
                    }
                </div>
            }
            </div>
        </div>
    )
}

export default Room