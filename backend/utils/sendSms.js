import axios from "axios";

export const sendSmsOtp = async (phone, otp) =>{

    const response = await axios.post(
        "https://api.httpsms.com/v1/messages/send",{
            content: "Your Code is " + otp,
            from : process.env.HTTPSMS_FROM,
            to: phone
        },{
            headers:{
                "x-api-key" : process.env.HTTPSMS_API_KEY,
                "Content-Type" : "application/json"
            }
        }
    );

    console.log("SMS sent successfully", response.data);

    return response.data;
}