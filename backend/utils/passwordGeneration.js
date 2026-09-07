import crypto from "crypto";

const generatePassword = (length = 16) =>{
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

    const randomBytes = crypto.randomBytes(length);

    let password = "";

    for(let i =0; i< length; i++){
        password += characters.charAt(randomBytes[i] % characters.length);
    }

    return password;
}

export default generatePassword;;