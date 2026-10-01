import twilio from 'twilio';

let client;

const getClient = () => {
    if (!client) {
        client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }
    return client;
}

const service = () => getClient().verify.v2.services(process.env.TWILIO_SERVICE_SID);

// turn the phone number into E.164 format, which is required by Twilio
export const toE164 = (phone)=>{
    const digits = String(phone).replace(/\D/g, '');

    return digits.length === 10 ? `+91${digits}` : `+${digits}`;
}

// twilio generates the code and send it to the user via sms
export const sendSmsOtp = async (phone) => {
    const verification = await service().verifications.create({
        channel: 'sms',
        to: phone
    });

    console.log("verification", verification); //" pending"

    return verification.status; //" pending"
}

// Twilio checks the code the user typed
export const checkSmsOtp = async(phone, code) =>{
    const check = await service().verificationChecks.create({
        to: phone,
        code
    })

    return check.status === "approved"; //"approved" or "pending"
}