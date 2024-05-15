import axios from 'axios';

// Sacar dirección IP pública del usuario
async function getPublicIP() {
  try {
    const response = await axios.get('https://api64.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('Error al obtener la dirección IP pública:', error);
    return null;
  }
}

export default getPublicIP;
