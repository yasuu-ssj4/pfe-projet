import nodemailer from "nodemailer";
import { env } from "process";
 

 const transporter = nodemailer.createTransport({
    host : "smtp.gmail.com",
    port : 465,
    secure : true,
    auth : {
        user : "naftalgestionmro@gmail.com" ,
        pass: "qjrl eojk ldxs nqcp" 
    },
 });

 export async function sendInterventionNotification(
  recipientEmail= "",
  interventionId =  "",
  vehicleCode = "",
) {
  try {
    const info = await transporter.sendMail({
      from: '"Système Naftal MRO" <naftalgestionmro@gmail.com>',
      to: recipientEmail,
      subject: "Notification: Nouvelle demande d'intervention",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Notification Naftal MRO</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Title -->
            <tr>
              <td align="center" bgcolor="#003366" style="padding: 15px 0; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Naftal Gestion MRO</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 30px 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                      <p style="margin: 0 0 20px 0;">Bonjour,</p>
                      <p style="margin: 0 0 20px 0; font-weight: bold; color: #0056b3; font-size: 18px;">
                        Une demande d'intervention a été initialisée. Veuillez remplir la qualification et le rapport après les travaux.
                      </p>
                      <p style="margin: 0 0 20px 0;">Détails de la demande :</p>
                    </td>
                  </tr>
                  
                  <!-- Details Box -->
                  <tr>
                    <td style="padding: 0 0 20px 0;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9f9; border: 1px solid #dddddd; border-radius: 5px;">
                        <tr>
                          <td style="padding: 15px;">
                            <p style="margin: 0 0 10px 0;"><strong>ID Demande:</strong> ${interventionId}</p>
                            ${vehicleCode ? `<p style="margin: 0 0 10px 0;"><strong>Code Véhicule:</strong> ${vehicleCode}</p>` : ""}
                            <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString("fr-FR")}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Action Button -->
                  <tr>
                    <td style="padding: 0 0 20px 0;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 15px 0;">
                            <a href="#" style="background-color: #0056b3; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; display: inline-block;">
                              Accéder à la demande
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 0; color: #333333; font-size: 16px; line-height: 1.5;">
                      <p style="margin: 0 0 10px 0;">Merci de traiter cette demande dans les plus brefs délais.</p>
                      <p style="margin: 0;">Cordialement,</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td align="center" bgcolor="#eeeeee" style="padding: 15px 0; color: #666666; font-size: 12px;">
                <p style="margin: 0 0 5px 0;">Ce message est généré automatiquement, merci de ne pas y répondre.</p>
                <p style="margin: 0 0 5px 0;">© ${new Date().getFullYear()} Naftal - Tous droits réservés</p>
                <p style="margin: 0;">Système de Gestion MRO</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    console.log("Email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

// Example usage
sendInterventionNotification("", "islam chikor", "islam chbab").then((result) => {
  if (result.success) {
    console.log(process.env.EMAIL_USER)
    console.log("Notification email sent successfully")
  } else {
    console.log(process.env.EMAIL_USER)
    console.error("Failed to send notification email")
  }
})