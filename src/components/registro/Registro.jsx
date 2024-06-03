import { useState } from "react";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import getPublicIP from "../../util/util";
import { doc, setDoc, getDocs, query, collection, where } from "firebase/firestore";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import emailjs from "emailjs-com";
import "./registro.css";

const Registro = () => {
  const [cargando, setCargando] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [formData, setFormData] = useState(null);

  const manejoRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);

    const formData = new FormData(e.target);
    setFormData(formData);

    const username = formData.get("username");
    const email = formData.get("email");

    try {
      // Validar el nombre de usuario
      if (!username.trim()) {
        toast.error("El nombre de usuario no puede estar vacío");
        setCargando(false);
        return;
      }
      if (username.length > 15) {
        toast.error("El nombre de usuario no puede tener más de 15 caracteres");
        setCargando(false);
        return;
      }
      if (/\s/.test(username)) {
        toast.error("El nombre de usuario no puede contener espacios");
        setCargando(false);
        return;
      }

      // Verificar si el nombre de usuario o el correo electrónico ya existen
      const usernameQuery = query(collection(db, "usuarios"), where("usuario", "==", username));
      const emailQuery = query(collection(db, "usuarios"), where("email", "==", email));

      const usernameSnapshot = await getDocs(usernameQuery);
      const emailSnapshot = await getDocs(emailQuery);

      if (!usernameSnapshot.empty) {
        toast.error("El username ya está en uso");
        setCargando(false);
        return;
      }

      if (!emailSnapshot.empty) {
        toast.error("El email ya está en uso");
        setCargando(false);
        return;
      }

      // Realizar el pago con PayPal
      setPagando(true);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
      setCargando(false);
    }
  };

  const handlePaymentComplete = async (details, data) => {
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const ipUsuario = await getPublicIP();

      // Actualizar la información del usuario en Firestore
      await setDoc(doc(db, "usuarios", res.user.uid), {
        usuario: username,
        email: email,
        id: res.user.uid,
        ip: ipUsuario
      });

      // Crear una colección para los chats del usuario
      await setDoc(doc(db, "chatusuarios", res.user.uid), {
        chats: []
      });

      // Enviar correo 
      const emailParams = {
        from_name: "0RT TEAM!",
        to_name: username,
        to_email: email,
        message: "Gracias por registrarse en nuestro Chat Web. Cualquier pregunta, contáctenos a este correo."
      };

      emailjs.send(
        import.meta.env.VITE_EMAILJS_API_KEY_SERVICE,
        import.meta.env.VITE_EMAILJS_API_KEY_TEMPLATE,
        emailParams,
        import.meta.env.VITE_EMAILJS_API_KEY_USERID
      )
      .then(() => {
        toast.success("CUENTA CREADA EXITOSAMENTE!!!");
      })
      .catch((error) => {
        console.error("Error sending email", error);
      });

    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setCargando(false);
      setPagando(false);
    }
  };

  const handlePaymentError = () => {
    toast.error("Pago no completado");
    setPagando(false);
  };

  return (
    <PayPalScriptProvider options={{ "client-id": "AbnGDSOMev0it_KO9a7fgfFRC57vH4kbl4qXANEAjm2-b1HwUWgqQ82hOWHFwVOAyiUsZq4sKHB-oN62" }}>
      <div className="registro">
        <div className="item">
          <h2>Crear Una Cuenta</h2>
          <form onSubmit={manejoRegistro}>
            <input type="text" placeholder="Username" name="username" />
            <input type="text" placeholder="Email" name="email" />
            <input type="password" placeholder="Password" name="password" />
            <button disabled={cargando}>{cargando ? "CARGANDO" : "REGISTRARSE"}</button>
          </form>
          {pagando && (
            <PayPalButtons
              style={{ layout: "horizontal" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: "0.01"
                      },
                      custom_id: "user_registration"
                    }
                  ]
                });
              }}
              onApprove={handlePaymentComplete}
              onError={handlePaymentError}
            />
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default Registro;
