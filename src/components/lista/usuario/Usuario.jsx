import "./usuario.css"
import { useStoreUsuario } from "../../../lib/storeUsuario"
import { auth } from "../../../lib/firebase";


const Usuario = () => {

    const { usuarioActual } = useStoreUsuario()
    return (
        <div className='usuario'>
            <div className="user">
                {/* <img src="./perfil.png" alt="" /> */}
                <h2>{usuarioActual.usuario}</h2>
            </div>
            <button className="cerrarSesion" onClick={() => auth.signOut()}>Cerrar Sesión</button>
        </div>

    )
}

export default Usuario