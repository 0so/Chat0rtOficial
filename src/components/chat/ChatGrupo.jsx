import React, { useState, useEffect, useRef } from "react";
import { db } from "../../lib/firebase";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    doc,
    getDoc
} from "firebase/firestore";
import "./chatgrupal.css";
import { useParams } from "react-router-dom";

const ChatGrupal = () => {
    const [mensaje, setMensaje] = useState("");
    const [mensajes, setMensajes] = useState([]);
    const { userId } = useParams();
    console.log("ID del usuario:", userId);

    const ultimoMensajeRef = useRef(null);

    useEffect(() => {
        if (mensajes.length > 0) {
            setMensaje("");
        }
    }, [mensajes]);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            query(collection(db, "mensajes"), orderBy("timestamp", "asc")),
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMensajes(data);
            }
        );

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        ultimoMensajeRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mensaje.trim() === "") return;

        try {
            // Consulta el documento de usuario en la colección "usuarios"
            const usuarioDoc = await getDoc(doc(db, "usuarios", userId));
            let nombreUsuario = "Usuario desconocido";
            if (usuarioDoc.exists()) {
                nombreUsuario = usuarioDoc.data().usuario;
            }

            await addDoc(collection(db, "mensajes"), {
                usuario: nombreUsuario,
                contenido: mensaje,
                timestamp: new Date(),
            });

        } catch (error) {
            console.error("Error al enviar mensaje:", error);
        }
    };

    return (
        <div className="chatGrupal">
            <h1>Chat Grupal</h1>
            <div className="mensajesContainer">
                {mensajes.map((mensaje) => (
                    <div key={mensaje.id} className="mensaje">
                        <span className="usuario">{mensaje.usuario}:</span>
                        <p className="contenido">{mensaje.contenido}</p>
                    </div>
                ))}
                <div ref={ultimoMensajeRef}></div>
            </div>
            <form onSubmit={handleSubmit}>
                <input
                    className="inputMensaje"
                    type="text"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                />
                <button type="submit">Enviar</button>
            </form>
        </div>
    );
};

export default ChatGrupal;
