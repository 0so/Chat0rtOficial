import { useEffect, useRef, useState } from "react"
import "./chat.css"
import EmojiPicker from "emoji-picker-react"
import { arrayUnion, doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useStoreChat } from "../../lib/storeChat";
import { useStoreUsuario } from "../../lib/storeUsuario";

const Chat = () => {

    const [abrir, setAbrir] = useState(false);
    const [text, setText] = useState("");
    const { idChat, usuario } = useStoreChat();
    const { usuarioActual } = useStoreUsuario()

    const MAX_CARACTERES = 10000; // Establecer el máximo número de caracteres permitidos


    const manejoEmoji = (e) => { console.log(e); setText(a => a + e.emoji); setAbrir(false); };
    const ultimoChat = useRef(null)
    useEffect(() => {
        ultimoChat.current?.scrollIntoView({ behavior: "auto" })
    });

    const [chat, setChat] = useState()
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
    console.log(chat);
    console.log("id chat", idChat)

    const enviar = async () => {
        if (text == "") return;

        try {
            await updateDoc(doc(db, "chats", idChat), {
                mensajes: arrayUnion({
                    emisorId: usuarioActual.id,
                    text,
                    creadoA: new Date(),
                })
            })

            const usuarioIDs = [usuarioActual.id, usuario.id]

            usuarioIDs.forEach(async (id) => {
                const usuarioChatsRef = doc(db, "chatusuarios", id)
                const usuarioChatsSnapShot = await getDoc(usuarioChatsRef)

                if (usuarioChatsSnapShot.exists()) {
                    const usuarioChatsData = usuarioChatsSnapShot.data()

                    const chatIndex = usuarioChatsData.chats.findIndex(c => c.idChat === idChat)

                    usuarioChatsData.chats[chatIndex].ultimoMensaje = text;
                    usuarioChatsData.chats[chatIndex].esEnviado = id === usuarioActual.id ? true : false;
                    usuarioChatsData.chats[chatIndex].actualizadoA = Date.now()

                    await updateDoc(usuarioChatsRef, {
                        chats: usuarioChatsData.chats,
                    })

                }
            })
            setText("");


        } catch (error) {
            console.log(error)
        }
    }



    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    {/* <img src="./perfil.png" alt="" /> */} 
                    <div className="texts">
                        <span>{usuario.usuario}</span>
                    </div>
                </div>
            </div>
            <div className="center">
                {chat?.mensajes?.map(mensaje => (
                    <div className={mensaje.emisorId === usuarioActual?.id ? "mensaje propio" : "mensaje"} key={mensaje?.creadoA}>
                        {/* <img src="./perfil.png" alt="" /> */}
                        <div className="texts">
                            <p>{mensaje.text}</p>
                            {/* <span>1 min ago</span> */}
                        </div>
                    </div>
                ))
                }
                <div ref={ultimoChat}></div>
            </div>
            <div className="bottom">
                <input type="text" placeholder="Escribe un mensaje..." 
                onChange={e => setText(e.target.value)} 
                value={text} maxLength={MAX_CARACTERES} // Establecer el límite máximo de caracteres
                />
                <span>{text.length}/{MAX_CARACTERES}</span> {/* Mostrar el contador de caracteres */}
                <div className="emoticonos">
                    <img src="./emoticonos.png" alt="" onClick={() => setAbrir((a) => !a)} />
                    <div className="selector">
                        <EmojiPicker open={abrir} onEmojiClick={manejoEmoji}></EmojiPicker>
                    </div>
                </div>

                <button className="enviarBoton" onClick={enviar}>Enviar</button>
            </div>
        </div>
    )
}

export default Chat