// Chat.jsx
import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { db, storage } from "../../lib/firebase";
import { useStoreChat } from "../../lib/storeChat";
import { useStoreUsuario } from "../../lib/storeUsuario";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Chat = ({ onToggleLista }) => {
  const [abrir, setAbrir] = useState(false);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const imageInputRef = useRef(null);
  const { idChat, usuario } = useStoreChat();
  const { usuarioActual } = useStoreUsuario();
  const [perfilUrl, setPerfilUrl] = useState("");
  const [enLinea, setEnLinea] = useState(false);
  const [usuarioEnLinea, setUsuarioEnLinea] = useState(false);
  const [chat, setChat] = useState();
  const ultimoChat = useRef(null);

  const MAX_CARACTERES = 10000;

  useEffect(() => {
    ultimoChat.current?.scrollIntoView({ behavior: "auto" });
  });

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

  useEffect(() => {
    const fetchPerfilUrl = async () => {
      if (!usuario?.id) return;
      const usuarioDocRef = doc(db, "usuarios", usuario.id);
      const usuarioDocSnap = await getDoc(usuarioDocRef);
      if (usuarioDocSnap.exists()) {
        const usuarioData = usuarioDocSnap.data();
        if (usuarioData.perfilUrl) {
          setPerfilUrl(usuarioData.perfilUrl);
        }
        setUsuarioEnLinea(usuarioData.enLinea || false); // Actualiza el estado del otro usuario
      }
    };

    fetchPerfilUrl();
  }, [usuario?.id]);

  useEffect(() => {
    if (!usuario?.id || !usuarioActual?.id) return;

    const usuarioDocRef = doc(db, "usuarios", usuario.id);
    const unsubscribe = onSnapshot(usuarioDocRef, (doc) => {
      if (doc.exists()) {
        const usuarioData = doc.data();
        setPerfilUrl(usuarioData.perfilUrl || "./perfil.png");
        setUsuarioEnLinea(usuarioData.enLinea || false); // Actualiza el estado del otro usuario
      }
    });

    const usuarioActualDocRef = doc(db, "usuarios", usuarioActual.id);
    const unsubscribeUsuarioActual = onSnapshot(usuarioActualDocRef, (doc) => {
      if (doc.exists()) {
        const usuarioData = doc.data();
        setEnLinea(usuarioData.enLinea || false); // Actualiza el estado del usuario actual
      }
    });

    return () => {
      unsubscribe();
      unsubscribeUsuarioActual();
    };
  }, [usuario?.id, usuarioActual?.id]);

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div className='chat'>
      {!idChat ? (
        <div className="no-chat-selected">
          <p>¡Añada un usuario para empezar a chatear!</p>
        </div>
      ) : (
        <>
          <div className="top">
            <div className="user">
              <img src={perfilUrl || "./perfil.png"} alt="Perfil" className="perfil-img" />
              <div className="texts">
                <span>{usuario?.usuario}</span>
                <span className={`status ${usuarioEnLinea ? "online" : "offline"}`}>
                  {usuarioEnLinea ?
                    <div className="rojo">
                      <img src="./online.png" alt="Online" />
                      <span>  ONLINE</span>
                    </div>
                    :
                    <div className="verde">
                      <img src="./offline.png" alt="Offline" />
                      <span>  OFFLINE</span>
                    </div>}
                </span>
              </div>
              <button className="screen" onClick={onToggleLista}>Screen</button> 
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
              onKeyDown={handleKeyDown}
              value={text}
              maxLength={MAX_CARACTERES}
            />
            <span>{text.length}/{MAX_CARACTERES}</span>
            <div className="emoticonos">
              <img src="./emoticonos.png" alt="" onClick={() => setAbrir((a) => !a)} />
              <div className="selector">
                <EmojiPicker open={abrir} onEmojiClick={e => setText(text + e.emoji)} />
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
        </>
      )}
    </div>
  );
};

export default Chat;