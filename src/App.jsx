import { useState, useEffect } from "react";
import Chat from "./components/chat/Chat"
// import Detalle from "./components/detalle/Detalle"
import Lista from "./components/lista/Lista"
import Login from "./components/login/Login"
import Toast from "./components/toastmsg/Toast"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./lib/firebase"
import { useStoreUsuario } from "./lib/storeUsuario"
import { useStoreChat } from "./lib/storeChat"
import Registro from "./components/registro/Registro";



const App = () => {


  //  const usuario = false
  const { usuarioActual, estaCargando, buscarInfoUser } = useStoreUsuario()
  const { idChat } = useStoreChat();
  const [mostrarLogin, setMostrarLogin] = useState(false); // Estado para determinar qué componente mostrar


  // useEffect observa cambios en usuario. 
  // Cuando el usuario cambia, se llama a buscarInfoUser con el UID del usuario actual. 
  // La suscripción se cancela cuando el componente se desmonta o cuando buscarInfoUser cambia. 
  // Finalmente, usuarioActual se imprime en la consola para mostrar el estado actual del usuario autenticado.
  useEffect(() => {
    const cancelarSuscripcion = onAuthStateChanged(auth, (usuario) => {
      buscarInfoUser(usuario?.uid)
    });

    return () => {
      cancelarSuscripcion();
    };
  }, [buscarInfoUser]);

  console.log(usuarioActual)

  if (estaCargando) return <div className="cargando">Cargando...!!!</div>

  return (
    <>
      <div className="contenedor">
        {usuarioActual ? (
          <>
            <Lista />
            {idChat && <Chat />}
          </>
        ) : (
          <div className="contenedor2">
            <nav>
              <ul className="nav-links">
                <li>
                  <button onClick={() => setMostrarLogin(!mostrarLogin)}>
                    {mostrarLogin ? "Volver al Registro" : "Iniciar Sesión"}
                  </button>
                </li>
              </ul>
            </nav>
            {mostrarLogin ? ( // Mostrar el componente de inicio de sesión si mostrarLogin es true
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