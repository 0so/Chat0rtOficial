import React, { useState, useEffect } from 'react';
import './reloj.css'
const Reloj = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Limpiar  intervalo al desmontar  componente
  }, []);

  return (
    <div className="clock">
      {time.toLocaleTimeString()}
    </div>
  );
};

export default Reloj;