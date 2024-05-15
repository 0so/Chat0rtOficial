// AdminPanel.jsx
import React, { useState, useEffect } from "react";
import { useStoreUsuario } from "../../lib/storeUsuario";
import "./admin.css"; // Importa el archivo CSS para aplicar estilos

const AdminPanel = () => {
  const { usuarios, estaCargando, obtenerUsuarios } = useStoreUsuario();

  useEffect(() => {
    obtenerUsuarios(); // Llama a la función para obtener la lista de usuarios al montar el componente
  }, []);

  if (estaCargando) return <div>Cargando...</div>;

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
};

export default AdminPanel;
