import React, { useState, useEffect } from "react";
import { useStoreUsuario } from "../../../lib/storeUsuario";
import { db } from "../../../lib/firebase";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
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

    // Función para truncar el texto y agregar puntos suspensivos
    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    return (
        <div className="listaChat">
            {/* Botón de añadir */}
            <img
                src={"añadir.png"}
                alt=""
                className="añadir"
                onClick={() => setModoAdd((a) => !a)}
            />

            {/* Lista de chats */}
            <div className="chatListContainer">
                <inputit
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
                            <p>{truncateText(chat.ultimoMensaje, 30)}</p> {/* Limita el mensaje a 50 caracteres */}
                        </div>
                    </div>
                ))}
            </div>

            {/* Componente de añadir usuario */}
            {addModo && <AddUser />}
        </div>
    );
};
export default ListaChat;
