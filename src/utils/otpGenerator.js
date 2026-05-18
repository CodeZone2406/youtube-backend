export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateOTPHtml(otp) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>OTP Verification</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4; padding:40px 0;">
            <tr>
                <td align="center">

                    <!-- Email Container -->
                    <table width="600" cellpadding="0" cellspacing="0" border="0"
                        style="background:#ffffff; border-radius:10px; overflow:hidden;">

                        <!-- Header -->
                        <tr>
                            <td align="center"
                                style="background:#2563eb; padding:30px; color:#ffffff;">
                                <h1 style="margin:0; font-size:28px;">
                                    Verify Your Account
                                </h1>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding:40px 30px; color:#333333;">

                                <h2 style="margin-top:0;">
                                    Hello User,
                                </h2>

                                <p style="font-size:16px; line-height:1.6;">
                                    Use the OTP below to complete your verification process.
                                </p>

                                <!-- OTP Box -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td align="center" style="padding:30px 0;">
                                            <div style="
                                                display:inline-block;
                                                background:#f3f4f6;
                                                padding:20px 40px;
                                                border-radius:8px;
                                                font-size:36px;
                                                letter-spacing:8px;
                                                font-weight:bold;
                                                color:#2563eb;
                                            ">
                                                ${otp}
                                            </div>
                                        </td>
                                    </tr>
                                </table>

                                <p style="font-size:14px; color:#666666; line-height:1.6;">
                                    If you did not request this OTP, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}
