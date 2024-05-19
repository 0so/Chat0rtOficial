import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { db, storage } from "../../lib/firebase"; // Asegúrate de importar storage
import { useStoreChat } from "../../lib/storeChat";
import { useStoreUsuario } from "../../lib/storeUsuario";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Importar funciones de almacenamiento

const Chat = () => {
    const [abrir, setAbrir] = useState(false);
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const imageInputRef = useRef(null); // Añadido: referencia al input de archivo
    const { idChat, usuario } = useStoreChat();
    const { usuarioActual } = useStoreUsuario();

    const MAX_CARACTERES = 10000;

    const manejoEmoji = (e) => { setText(a => a + e.emoji); setAbrir(false); };
    const ultimoChat = useRef(null);

    useEffect(() => {
        ultimoChat.current?.scrollIntoView({ behavior: "auto" });
    });

    const [chat, setChat] = useState();
    useEffect(() => {
        if (idChat) {
            const unSub = onSnapshot(doc(db, "chats", idChat), (res) => {
                setChat(res.data());
            });

            return () => {
                unSub();
            };
        }
    }, [idChat]);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const enviar = async () => {
        if (text === "" && !image) return;

        let imageUrl = null;
        if (image) {
            const imageRef = ref(storage, `images/${image.name}`);
            await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(imageRef);
            setImage(null); 
            if (imageInputRef.current) {
                imageInputRef.current.value = ""; 
            }
        }

        try {
            const newMessage = {
                emisorId: usuarioActual.id,
                text,
                imageUrl,
                creadoA: new Date(),
            };

            await updateDoc(doc(db, "chats", idChat), {
                mensajes: arrayUnion(newMessage),
            });

            const usuarioIDs = [usuarioActual.id, usuario.id];

            usuarioIDs.forEach(async (id) => {
                const usuarioChatsRef = doc(db, "chatusuarios", id);
                const usuarioChatsSnapShot = await getDoc(usuarioChatsRef);

                if (usuarioChatsSnapShot.exists()) {
                    const usuarioChatsData = usuarioChatsSnapShot.data();
                    const chatIndex = usuarioChatsData.chats.findIndex(c => c.idChat === idChat);

                    usuarioChatsData.chats[chatIndex].ultimoMensaje = text || "Foto";
                    usuarioChatsData.chats[chatIndex].esEnviado = id === usuarioActual.id ? true : false;
                    usuarioChatsData.chats[chatIndex].actualizadoA = Date.now();

                    await updateDoc(usuarioChatsRef, {
                        chats: usuarioChatsData.chats,
                    });
                }
            });

            setText("");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    <img src="./perfil.png" alt="" />
                    <div className="texts">
                        <span>{usuario.usuario}</span>
                        <p>Hola buenos días, ¿cómo estás? ¿Qué tal todo?</p>
                    </div>
                </div>
            </div>
            <div className="center">
                {chat?.mensajes?.map(mensaje => (
                    <div className={mensaje.emisorId === usuarioActual?.id ? "mensaje propio" : "mensaje"} key={mensaje?.creadoA}>
                        <div className="texts">
                            {mensaje.imageUrl && <img src={mensaje.imageUrl} alt="Imagen" />}
                            <p>{mensaje.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={ultimoChat}></div>
            </div>
            <div className="bottom">
                <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    onChange={e => setText(e.target.value)}
                    value={text}
                    maxLength={MAX_CARACTERES}
                />
                <span>{text.length}/{MAX_CARACTERES}</span>
                <div className="emoticonos">
                    <img src="./emoticonos.png" alt="" onClick={() => setAbrir((a) => !a)} />
                    <div className="selector">
                        <EmojiPicker open={abrir} onEmojiClick={manejoEmoji} />
                    </div>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={imageInputRef} 
                />
                <button className="enviarBoton" onClick={enviar}>Enviar</button>
            </div>
        </div>
    );
};

export default Chat;
