import React, { useState, useEffect } from "react";
import "./usuario.css";
import { useStoreUsuario } from "../../../lib/storeUsuario";
import { auth, db, storage } from "../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Usuario = () => {
    const { usuarioActual } = useStoreUsuario();
    const [perfilUrl, setPerfilUrl] = useState("");

    useEffect(() => {
        const fetchPerfilUrl = async () => {
            const usuarioDocRef = doc(db, "usuarios", usuarioActual.id);
            const usuarioDocSnap = await getDoc(usuarioDocRef);
            if (usuarioDocSnap.exists()) {
                const usuarioData = usuarioDocSnap.data();
                if (usuarioData.perfilUrl) {
                    setPerfilUrl(usuarioData.perfilUrl);
                }
            }
        };

        fetchPerfilUrl();

        // Manejar el evento beforeunload para actualizar el estado en línea antes de cerrar la página o el navegador
        const handleBeforeUnload = async () => {
            try {
                // Actualiza el estado en línea a false
                await updateDoc(doc(db, "usuarios", usuarioActual.id), {
                    enLinea: false
                });
            } catch (error) {
                console.error("Error al actualizar el estado en línea antes de cerrar la página: ", error);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [usuarioActual.id]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const storageRef = ref(storage, `perfiles/${usuarioActual.id}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);

        const usuarioDocRef = doc(db, "usuarios", usuarioActual.id);
        await updateDoc(usuarioDocRef, { perfilUrl: downloadUrl });

        setPerfilUrl(downloadUrl);
    };

    const handleLogout = async () => {
        try {
            // Actualiza el estado en línea a false
            await updateDoc(doc(db, "usuarios", usuarioActual.id), {
                enLinea: false
            });
            // Cierra sesión
            await auth.signOut();
        } catch (error) {
            console.error("Error al cerrar sesión: ", error);
        }
    };

    return (
        <div className="usuario">
            <div className="user">
                <img
                    src={perfilUrl || "perfil.png"}
                    alt="Perfil"
                    className="perfil-img"
                />
                <button onClick={() => document.getElementById('fileInput').click()} className="cambiar-foto">
                    Cambiar foto
                </button>
                <input
                    id="fileInput"
                    type="file"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                />
                <h2>{usuarioActual.usuario}</h2>
            </div>
            <button className="cerrarSesion" onClick={handleLogout}>Cerrar Sesión</button>
        </div>
    );
};

export default Usuario;