import "./lista.css"
import Usuario from "./usuario/Usuario"
import ListaChat from "./listaChat/ListaChat"
const Lista = () => {
    return  (
        <div className='lista'> 
            <Usuario></Usuario>
            <ListaChat></ListaChat>
        </div>
    )
  }
  
  export default Lista