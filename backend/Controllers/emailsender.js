// import "../env.js";

// export const sendPaymentEmail = async ({
//     email,
//     name,
//     planName,
//     amount,
//     paymentId,
//     subscriptionId,
// }) => {
//     try {
//         const { data, error } = await resend.emails.send({
//             from: "Twiller <onboarding@resend.dev>",

//             to: [email],

//             subject: `Payment Successful - ${planName} Plan`,

//             html: `
//                 <!DOCTYPE html>
//                 <html>
//                 <head>
//                     <meta charset="UTF-8">
//                     <title>Payment Successful</title>
//                 </head>

//                 <body style="
//                     font-family: Arial, sans-serif;
//                     background-color: #f5f5f5;
//                     padding: 30px;
//                 ">

//                     <div style="
//                         max-width: 600px;
//                         margin: auto;
//                         background: white;
//                         padding: 30px;
//                         border-radius: 10px;
//                     ">

//                         <h2>Payment Successful 🎉</h2>

//                         <p>Hello ${name},</p>

//                         <p>
//                             Your subscription payment was successful.
//                         </p>

//                         <h3>Payment Details</h3>

//                         <p>
//                             <strong>Plan:</strong>
//                             ${planName}
//                         </p>

//                         <p>
//                             <strong>Amount:</strong>
//                             ₹${amount}
//                         </p>

//                         <p>
//                             <strong>Payment ID:</strong>
//                             ${paymentId}
//                         </p>

//                         <p>
//                             <strong>Subscription ID:</strong>
//                             ${subscriptionId}
//                         </p>

//                         <p>
//                             <strong>Status:</strong>
//                             Successful
//                         </p>

//                         <br>

//                         <p>
//                             Thank you for subscribing to Twiller!
//                         </p>

//                         <p>
//                             Regards,<br>
//                             <strong>Twiller Team</strong>
//                         </p>

//                     </div>

//                 </body>
//                 </html>
//             `,
//         });

//         if (error) {
//             console.error("Payment email error:", error);
//             throw new Error(error.message);
//         }

//         console.log(
//             "Payment email sent successfully:",
//             data.id
//         );

//         return data;

//     } catch (error) {
//         console.error(
//             "Payment email sending failed:",
//             error.message
//         );

//         throw error;
//     }
// };