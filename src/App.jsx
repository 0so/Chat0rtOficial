import { useState, useEffect } from "react";
import Chat from "./components/chat/Chat"
import Lista from "./components/lista/Lista"
import Login from "./components/login/Login"
import Toast from "./components/toastmsg/Toast"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./lib/firebase"
import { useStoreUsuario } from "./lib/storeUsuario"
import { useStoreChat } from "./lib/storeChat"
import Registro from "./components/registro/Registro";
import Reloj from "./components/reloj/Reloj";

const App = () => {
  const { usuarioActual, estaCargando, buscarInfoUser } = useStoreUsuario()
  const { idChat } = useStoreChat();
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [mostrarListaChat, setMostrarListaChat] = useState(true); 

  useEffect(() => {
    const cancelarSuscripcion = onAuthStateChanged(auth, (usuario) => {
      buscarInfoUser(usuario?.uid)
    });

    return () => {
      cancelarSuscripcion();
    };
  }, [buscarInfoUser]);

  if (estaCargando) return <div className="cargando">Cargando...!!!</div>

  return (
    <>
      <div className="contenedor">
        {usuarioActual ? (
          <>
            {mostrarListaChat && <Lista />} 
            <Chat onToggleLista={() => setMostrarListaChat(!mostrarListaChat)} /> 
          </>
        ) : (
          <div className="contenedor2">
            <nav>
              <div className="nav-container">
                <ul className="nav-links">
                  <li>
                    <button onClick={() => setMostrarLogin(!mostrarLogin)}>
                      {mostrarLogin ? "Volver al Registro" : "Iniciar Sesión"}
                    </button>
                  </li>
                </ul>
                <Reloj />
              </div>
            </nav>
            {mostrarLogin ? (
              <Login />
            ) : (
              <Registro />
            )}
          </div>
        )}
      </div>
      <Toast />
    </>
  );
}

export default App
