import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStoreUsuario } from "../../../lib/storeUsuario";
import { db } from "../../../lib/firebase";
import { doc, onSnapshot, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useStoreChat } from "../../../lib/storeChat";
import AddUser from "./addUser/AddUser";
import "./listaChat.css";

const ListaChat = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [chats, setChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [addModo, setModoAdd] = useState(false);
    const { usuarioActual } = useStoreUsuario();
    const { cambiarChat } = useStoreChat();

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "chatusuarios", usuarioActual.id), async (res) => {
            const items = res.data().chats;
            const promises = items.map(async (item) => {
                const usuarioDocRef = doc(db, "usuarios", item.idReceptor);
                const usuarioDocSnap = await getDoc(usuarioDocRef);
                const usuario = usuarioDocSnap.data();
                return {
                    ...item,
                    usuario
                };
            });
            const dataChat = await Promise.all(promises);
            setChats(dataChat.sort((a, b) => b.actualizadoA - a.actualizadoA));
            // Si el chat seleccionado ha sido eliminado, actualizar el estado global
        if (!dataChat.find(chat => chat.idChat === idChat)) {
            cambiarChat(null, null);
        }
        });

        return () => {
            unsub();
        };
    }, [usuarioActual.id]);

    useEffect(() => {
        const filtered = chats.filter(chat =>
            chat.usuario.usuario.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredChats(filtered);
    }, [chats, searchTerm]);

    const handleSelect = async (chat) => {
        const usuarioChats = chats.map(item => {
            const { usuario, ...rest } = item;
            return rest;
        });

        const chatIndex = usuarioChats.findIndex(item => item.idChat === chat.idChat);
        usuarioChats[chatIndex].esEnviado = true;

        const usuarioChatsRef = doc(db, "chatusuarios", usuarioActual.id);

        try {
            await updateDoc(usuarioChatsRef, {
                chats: usuarioChats,
            });
        } catch (error) {
            console.log(error);
        }
        console.log("Chat seleccionado:", chat);
        cambiarChat(chat.idChat, chat.usuario);
    };

    const handleSearchChange = event => {
        setSearchTerm(event.target.value);
    };

    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };


    const handleDelete = async (chat) => {
    const usuarioChatsRef = doc(db, "chatusuarios", usuarioActual.id);
    const receptorChatsRef = doc(db, "chatusuarios", chat.idReceptor);
    const chatDocRef = doc(db, "chats", chat.idChat);

    try {
        // Eliminar chat de la cole "chats"
        await deleteDoc(chatDocRef);

        // Actualizar la lista de chats del usuario actual
        const usuarioChats = chats.filter(item => item.idChat !== chat.idChat);
        await updateDoc(usuarioChatsRef, {
            chats: usuarioChats.map(({ usuario, ...rest }) => rest),
        });

        // Actualizar la lista de chats del receptor
        const receptorChatsSnap = await getDoc(receptorChatsRef);
        if (receptorChatsSnap.exists()) {
            const receptorChats = receptorChatsSnap.data().chats.filter(item => item.idChat !== chat.idChat);
            await updateDoc(receptorChatsRef, {
                chats: receptorChats,
            });
        }

        // Eliminar ambos usuarios de los agregados del otro usuario
        const usuarioActualRef = doc(db, "usuarios", usuarioActual.id);
        const receptorRef = doc(db, "usuarios", chat.idReceptor);

        const usuarioActualSnap = await getDoc(usuarioActualRef);
        const receptorSnap = await getDoc(receptorRef);

        if (usuarioActualSnap.exists() && receptorSnap.exists()) {
            const usuarioActualData = usuarioActualSnap.data();
            const receptorData = receptorSnap.data();

            const updatedUsuariosAgregadosActual = usuarioActualData.usuariosAgregados.filter(id => id !== chat.idReceptor);
            const updatedUsuariosAgregadosReceptor = receptorData.usuariosAgregados.filter(id => id !== usuarioActual.id);

            await updateDoc(usuarioActualRef, {
                usuariosAgregados: updatedUsuariosAgregadosActual,
            });

            await updateDoc(receptorRef, {
                usuariosAgregados: updatedUsuariosAgregadosReceptor,
            });
        }

            // Actu  estado local
            cambiarChat(null, null);
            setChats(usuarioChats);

    } catch (error) {
        console.log("Error al eliminar el chat:", error);
    }
};

    return (
        <div className="listaChat">
            <img
                src={"añadir.png"}
                alt=""
                className="añadir"
                onClick={() => setModoAdd((a) => !a)}
            />
            
            <Link to={`/chat-grupal/${usuarioActual.id}`} >
                <img src={"grupo.png"} alt="" className="grupo" />
            </Link>
            <div className="chatListContainer">
                <input
                    type="text"
                    placeholder="Buscar chats..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                {filteredChats.map((chat) => (
                    <div className="item" key={chat.idChat} onClick={() => handleSelect(chat)}
                        style={{ backgroundColor: chat?.esEnviado ? "transparent" : "orange" }}>
                        <div className="texts">
                            <span>{chat.usuario.usuario}</span>
                            <p>{truncateText(chat.ultimoMensaje, 30)}</p>
                            <button className="deleteButton" onClick={() => handleDelete(chat)}>Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
            {addModo && <AddUser />}
        </div>
    );
};

export default ListaChat;
