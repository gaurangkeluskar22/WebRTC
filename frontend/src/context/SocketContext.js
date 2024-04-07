import { createContext, useMemo, useContext, useState } from "react";
import {io} from 'socket.io-client'


export const SocketContext = createContext(null)

export const useSocket = () => {
    const socket =  useContext(SocketContext)
    return socket
}

export const SocketContextProvider = ({children}) => {

    const socket = useMemo(()=> io('http://localhost:8000'),[])

    console.log("socket:",socket)

    return(
        <SocketContext.Provider value={{socket}}>{children}</SocketContext.Provider>
    )
}