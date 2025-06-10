import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_KEY_API_CREATE;

export const encryptData = (data) => {
  const str = JSON.stringify(data);
  return CryptoJS.AES.encrypt(str, SECRET_KEY).toString();
};

export const decryptData = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
  } catch (e) {
    console.error('Erreur déchiffrement:', e);
    return null;
  }
};
