import React, { useState, useEffect } from "react";
import { useStoreUsuario } from "../../lib/storeUsuario";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./admin.css"; // Importa el archivo CSS para aplicar estilos

const AdminPanel = () => {
  const [contrasena, setContrasena] = useState(""); // Estado para la contraseña ingresada
  const [contrasenaCorrecta, setContrasenaCorrecta] = useState(false); // Estado para verificar si la contraseña es correcta
  const { usuarios, estaCargando, obtenerUsuarios } = useStoreUsuario();

  useEffect(() => {
    obtenerUsuarios(); // Llama a la función para obtener la lista de usuarios al montar el componente
  }, []);

  //  manejar el cambio en el campo de entrada de la contraseña
  const handleContrasenaChange = (event) => {
    setContrasena(event.target.value);
  };

  // manejar el envío del formulario de contraseña
  const handleSubmit = (event) => {
    event.preventDefault(); 
    if (contrasena === "admin123") {
      setContrasenaCorrecta(true); 
    } else {
      toast.error('Contraseña incorrecta');
    }
  };

  // Si se está cargando, muestra "Cargando..."
  if (estaCargando) return <div>Cargando...</div>;

  // Si la contraseña es correcta, mostrar datos del usuario registrado
  if (contrasenaCorrecta) {
    return (
      <div className="admin-panel-container">
        <h1 className="admin-panel-header">Panel de Administración</h1>
        <table className="admin-panel-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>IP Registro</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.usuario}</td>
                <td>{usuario.email}</td>
                <td>{usuario.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Si la contraseña no es correcta, form de la pass
  return (
    <div className="admin-panel-container">
      <h1 className="admin-panel-header">Desbloquear con Key</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={contrasena}
          onChange={handleContrasenaChange}
          placeholder="Contraseña"
        />
        <button type="submit">Enviar</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AdminPanel;
