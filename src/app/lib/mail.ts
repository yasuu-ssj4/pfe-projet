import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "naftalgestionmro@gmail.com",
    pass: "qjrl eojk ldxs nqcp",
  },
})

export async function sendInterventionNotification(recipientEmail = "", interventionId: number, vehicleCode = "") {
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

export async function sendVehicleIssueNotification(
  recipientEmail = "",
  code_vehicule = "",
  probabilite_panne: number,
  kilometrage: number,
  marque = "",
  type = "",
) {
  try {
   
    const probabiliteFormatted = `${(probabilite_panne*100).toFixed(1)}%`

    const kilometrageFormatted = new Intl.NumberFormat("fr-FR").format(kilometrage)

    let riskColor = "#28a745"
    let riskText = "Faible"

    if (probabilite_panne > 0.7) {
      riskColor = "#dc3545" 
      riskText = "Élevé"
    } else if (probabilite_panne > 0.3) {
      riskColor = "#ffc107" 
      riskText = "Moyen"
    }

    const info = await transporter.sendMail({
      from: '"Système Naftal MRO" <naftalgestionmro@gmail.com>',
      to: recipientEmail,
      subject: `Alerte: Risque de panne véhicule ${code_vehicule}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Alerte Véhicule Naftal MRO</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Title -->
            <tr>
              <td align="center" bgcolor="#003366" style="padding: 15px 0; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Alerte Véhicule</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 30px 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                      <p style="margin: 0 0 20px 0;">Bonjour,</p>
                      <p style="margin: 0 0 20px 0; font-weight: bold; color: ${riskColor}; font-size: 18px;">
                        Alerte: Risque de panne détecté pour le véhicule ${code_vehicule}
                      </p>
                      <p style="margin: 0 0 20px 0;">Notre système a détecté un risque potentiel de panne pour le véhicule suivant :</p>
                    </td>
                  </tr>
                  
                  <!-- Vehicle Details Box -->
                  <tr>
                    <td style="padding: 0 0 20px 0;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9f9; border: 1px solid #dddddd; border-radius: 5px;">
                        <tr>
                          <td style="padding: 15px;">
                            <p style="margin: 0 0 10px 0;"><strong>Code Véhicule:</strong> ${code_vehicule}</p>
                            <p style="margin: 0 0 10px 0;"><strong>Marque:</strong> ${marque}</p>
                            <p style="margin: 0 0 10px 0;"><strong>Type:</strong> ${type}</p>
                            <p style="margin: 0 0 10px 0;"><strong>Kilométrage actuel:</strong> ${kilometrageFormatted} km</p>
                            <p style="margin: 0; font-weight: bold;">
                              <strong>Niveau de risque:</strong> 
                              <span style="color: ${riskColor};">${riskText} (${probabiliteFormatted})</span>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Risk Indicator -->
                  <tr>
                    <td style="padding: 0 0 20px 0;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="padding: 10px 0;">
                            <p style="margin: 0 0 5px 0;"><strong>Indicateur de risque:</strong></p>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="height: 20px; border-radius: 10px; overflow: hidden; background-color: #e9ecef;">
                              <tr>
                                <td style="width: ${probabilite_panne*100}%; background-color: ${riskColor}; height: 20px;"></td>
                                <td style="width: ${probabilite_panne*100}%; background-color: transparent; height: 20px;"></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Recommendation -->
                  <tr>
                    <td style="padding: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                      <p style="margin: 0 0 10px 0; font-weight: bold;">Recommandation:</p>
                      <p style="margin: 0 0 10px 0;">
                        ${
                          probabilite_panne > 0.7
                            ? "Une inspection immédiate du véhicule est fortement recommandée. Veuillez planifier une intervention dès que possible."
                            : probabilite_panne > 0.3
                              ? "Une vérification préventive est recommandée lors de la prochaine maintenance programmée."
                              : "Aucune action immédiate n'est requise, mais gardez un œil sur ce véhicule lors des prochaines inspections de routine."
                        }
                      </p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 0; color: #333333; font-size: 16px; line-height: 1.5;">
                      <p style="margin: 0 0 10px 0;">Merci de prendre les mesures appropriées selon le niveau de risque indiqué.</p>
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

    console.log("Vehicle issue email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending vehicle issue email:", error)
    return { success: false, error }
  }
}