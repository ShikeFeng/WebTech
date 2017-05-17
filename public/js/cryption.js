function aesEncrypt_object(object){
  return CryptoJS.AES.encrypt(JSON.stringify(object), 'secret key 123');
}

function aesEncrypt_plainText(text){
  return CryptoJS.AES.encrypt(text, 'secret key 123');
}

function aesDecrypt_object(message){
  return JSON.parse(CryptoJS.AES.decrypt(message.toString(), 'secret key 123').toString(CryptoJS.enc.Utf8));
}

function aesDecrypt_text(message){
  return CryptoJS.AES.decrypt(message.toString(), 'secret key 123').toString(CryptoJS.enc.Utf8);
}
