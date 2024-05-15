import { create } from 'zustand'
import { doc, getDoc,collection,getDocs} from "firebase/firestore"
import {db} from "./firebase"

export const useStoreUsuario = create((set) => ({
  usuarioActual: null,
  estaCargando: true,
  buscarInfoUser: async (uid) => {
    if(!uid) return set({usuarioActual:null, estaCargando: false})

    try{
        // obtener data
        const docRef = doc(db, "usuarios", uid)
        const docSnap =await getDoc(docRef);

        if(docSnap.exists){
           set({usuarioActual:docSnap.data(), estaCargando: false})
        } else{
            set({usuarioActual:null, estaCargando: false})
        }
        
    }catch(err){
        console.log(err)
        return set({usuarioActual:null, estaCargando: false})
    }
  },
 
  obtenerUsuarios: async () => {
    try {
      const usersCollection = collection(db, 'usuarios');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ usuarios: usersList, estaCargando: false });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      set({ estaCargando: false });
    }
  }
}))