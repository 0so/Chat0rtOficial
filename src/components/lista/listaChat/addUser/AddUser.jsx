import { collection, getDocs, doc, updateDoc, setDoc, arrayUnion, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useState, useEffect } from "react";
import { useStoreUsuario } from "../../../../lib/storeUsuario";
import './addUser.css';

export const AddUser = () => {
    const { usuarioActual } = useStoreUsuario();
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const obtenerUsuarios = async () => {
            try {
                const usuariosRef = collection(db, "usuarios");
                const usuariosSnapShot = await getDocs(usuariosRef);
                const usuariosData = usuariosSnapShot.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data()
                }));
                
                // Filtrar la lista de usuarios para excluir el usuario actual
                const usuariosFiltrados = usuariosData.filter(usuario => usuario.id !== usuarioActual.id);
                setUsuarios(usuariosFiltrados);
            } catch (error) {
                console.log(error);
            }
        };
        obtenerUsuarios();
    }, []);

    const anadirUser = async (usuario) => {
        try {
            const userDoc = doc(db, "usuarios", usuarioActual.id);
            const userSnapShot = await getDoc(userDoc);
            
            if (userSnapShot.exists()) {
                // Obtener los usuarios agregados del usuario actual
                const data = userSnapShot.data();
                const usuariosAgregados = data.usuariosAgregados || [];
                
                // Verificar si el usuario ya ha sido añadido
                if (usuariosAgregados.includes(usuario.id)) {
                    console.log("¡Este usuario ya ha sido añadido!");
                    return;
                }
                
                // Crear un nuevo chat
                const chatRef = collection(db, "chats");
                const newChatRef = doc(chatRef);
                
                await setDoc(newChatRef, {
                    creadoA: serverTimestamp(),
                    mensajes: []
                });
                
                // Actualizar los chats de los usuarios
                const userChatsRef = collection(db, "chatusuarios");
                await updateDoc(doc(userChatsRef, usuario.id), {
                    chats: arrayUnion({
                        idChat: newChatRef.id,
                        ultimoMensaje: "",
                        idReceptor: usuarioActual.id,
                        actualizadoA: Date.now()
                    })
                });
                
                await updateDoc(doc(userChatsRef, usuarioActual.id), {
                    chats: arrayUnion({
                        idChat: newChatRef.id,
                        ultimoMensaje: "",
                        idReceptor: usuario.id,
                        actualizadoA: Date.now()
                    })
                });
                
                // Actualizar la lista de usuarios agregados en el documento del usuario actual
                await updateDoc(userDoc, {
                    usuariosAgregados: arrayUnion(usuario.id)
                });
    
                // Actualizar la lista de usuarios agregados en el documento del usuario añadido
                const addedUserDoc = doc(db, "usuarios", usuario.id);
                await updateDoc(addedUserDoc, {
                    usuariosAgregados: arrayUnion(usuarioActual.id)
                });
    
                console.log("Usuario añadido:", usuario);
            } else {
                console.log("No se encontró el documento del usuario actual");
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="addUser">
            <h2>Lista de Usuarios</h2>
            <ul>
                {usuarios.map(usuario => (
                    <li key={usuario.id}>
                        <div className="user">
                            <div className="estado">
                                {/* <img src="./perfil.png" alt=""></img> */}
                                <span>{usuario.data.usuario}</span>
                            </div>
                            <button onClick={() => anadirUser(usuario)}>Añadir Usuario</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AddUser;

