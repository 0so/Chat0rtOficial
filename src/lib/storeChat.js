import { create } from 'zustand'
// import { doc, getDoc} from "firebase/firestore"
// import {db} from "./firebase"
// import { useStoreUsuario } from './storeUsuario'

export const useStoreChat = create((set) => ({
  idChat: null,
  usuario: null,
  cambiarChat: (idChat, usuario) => {
    // You can update the state here using `set`
    console.log("Nuevo idChat:", idChat);
    set({ idChat, usuario });
  }
}))
