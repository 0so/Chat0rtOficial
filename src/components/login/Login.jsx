// Login.jsx
import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase"; // Asegúrate de importar db
import { doc, updateDoc } from "firebase/firestore"; // Importa updateDoc

const Login = () => {
  const [cargando, setCargando] = useState(false);

  const manejoLogin = async (e) => {
    e.preventDefault();
    setCargando(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Actualiza el estado en línea en Firestore
      await updateDoc(doc(db, "usuarios", user.uid), {
        enLinea: true
      });
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={manejoLogin}>
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={cargando}>{cargando ? "CARGANDO" : "INICIAR SESION"}</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
