package service;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;
import java.util.ArrayList;

/**
 * MailService which handles all emails.
 */
public class MailService {
    private Properties props; // connection to gmail server + login
    private Session session;
    private int emailsSent; // counter for amount of emails sent.

    public MailService() {
        this.props = new Properties();
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.socketFactory.port", "465");
        props.put("mail.smtp.socketFactory.class",
                "javax.net.ssl.SSLSocketFactory");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.port", "465");

        this.session = Session.getInstance(props,
                new javax.mail.Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication("voting@isek.se", "iwoehrhgftkfqbbi");
                    }
                });
    }

    /**
     * Returns counter.
     * 
     * @return counter.
     */
    public int getEmailSentCount() {
        return emailsSent;
    }

    /**
     * Send email for every voter in list, including their voterId.
     * 
     * @param voters elections.voters
     */
    public void sendEmails(ArrayList<Voter> voters) {
        emailsSent = 0;
        for (Voter voter : voters) {
            if (voter.email != null) {
                sendSingleEmail(voter.email, voter.voterId, voter.name);
            }
        }
    }

    /**
     * Send one email.
     * 
     * @param mail
     * @param voterId
     */
    public void sendSingleEmail(String mail, String voterId, String name) {
        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("voting@isek.se"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(mail));
            message.setSubject("Din valkod till sektionsmötet");
            // message.setText("Snart är det dags för sektionsmötet! Du röstar på
            // vote.isek.se\n\nHär är din valkod: 1234\n\nVid frågor mejla");

            // Set the content type to HTML
            message.setContent(htmlContent(voterId, name), "text/html; charset=utf-8");
            // Send the email
            Transport.send(message);
            System.out.println("Email sent successfully!");
            emailsSent++;
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    /**
     * Send email to voting@isek.se on password reset.
     * 
     * @param newPassword
     */
    public void resetPasswordEmail(String newPassword) {
        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("voting@isek.se"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse("voting@isek.se"));
            message.setSubject("Nytt lösenord: vote.isek.se");
            message.setText("Nytt lösenord: " + newPassword);
            Transport.send(message);
            System.out.println("Reset email sent successfully!");
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    /**
     * Content in emails.
     * 
     * @param voterId voterId to be seen in email.
     * @return html content.
     */
    private String htmlContent(String voterId, String name) {
        String url = "https://vote.isek.se/" + voterId;
        String[] fullName = name.split(" ");
        String firstName = fullName[0];
        String html = """
                    <!DOCTYPE HTML
                    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
                    xmlns:o="urn:schemas-microsoft-com:office:office">

                <head>
                    <!--[if gte mso 9]>
                <xml>
                  <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                  </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta name="x-apple-disable-message-reformatting">
                    <meta charset="UTF-8">
                    <!--[if !mso]><!-->
                    <meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
                    <title></title>

                    <style type="text/css">
                        @media only screen and (min-width: 520px) {
                            .u-row {
                                width: 500px !important;
                            }

                            .u-row .u-col {
                                vertical-align: top;
                            }

                            .u-row .u-col-100 {
                                width: 500px !important;
                            }

                        }

                        @media (max-width: 520px) {
                            .u-row-container {
                                max-width: 100% !important;
                                padding-left: 0px !important;
                                padding-right: 0px !important;
                            }

                            .u-row .u-col {
                                min-width: 320px !important;
                                max-width: 100% !important;
                                display: block !important;
                            }

                            .u-row {
                                width: 100% !important;
                            }

                            .u-col {
                                width: 100% !important;
                            }

                            .u-col>div {
                                margin: 0 auto;
                            }
                        }

                        body {
                            margin: 0;
                            padding: 0;
                        }

                        table,
                        tr,
                        td {
                            vertical-align: top;
                            border-collapse: collapse;
                        }

                        p {
                            margin: 0;
                        }

                        .ie-container table,
                        .mso-container table {
                            table-layout: fixed;
                        }

                        * {
                            line-height: inherit;
                        }

                        a[x-apple-data-detectors='true'] {
                            color: inherit !important;
                            text-decoration: none !important;
                        }

                        table,
                        td {
                            color: #000000;
                        }

                        @media (max-width: 480px) {
                            #u_content_heading_1 .v-font-size {
                                font-size: 19px !important;
                            }

                            #u_content_heading_1 .v-line-height {
                                line-height: 140% !important;
                            }
                        }
                    </style>



                </head>

                <body class="clean-body u_body"
                    style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffeee8;color: #000000">
                    <!--[if IE]><div class="ie-container"><![endif]-->
                    <!--[if mso]><div class="mso-container"><![endif]-->
                    <table
                        style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffeee8;width:100%"
                        cellpadding="0" cellspacing="0">
                        <tbody>
                            <tr style="vertical-align: top">
                                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffeee8;"><![endif]-->


                                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                                        <div class="u-row"
                                            style="Margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                                            <div
                                                style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px;"><tr style="background-color: transparent;"><![endif]-->

                                                <!--[if (mso)|(IE)]><td align="center" width="500" style="width: 500px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                                <div class="u-col u-col-100"
                                                    style="max-width: 320px;min-width: 500px;display: table-cell;vertical-align: top;">
                                                    <div style="height: 100%;width: 100% !important;">
                                                        <!--[if (!mso)&(!IE)]><!-->
                                                        <div
                                                            style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                                            <!--<![endif]-->

                                                            <table style="font-family:arial,helvetica,sans-serif;" role="presentation"
                                                                cellpadding="0" cellspacing="0" width="100%" border="0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                                                                            align="left">

                                                                            <h4 class="v-line-height v-font-size"
                                                                                style="margin: 0px; line-height: 140%; text-align: left; word-wrap: break-word; font-size: 16px; font-weight: 400;">
                                                                            </h4>

                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>

                                                            <table id="u_content_heading_1"
                                                                style="font-family:arial,helvetica,sans-serif;" role="presentation"
                                                                cellpadding="0" cellspacing="0" width="100%" border="0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                                                                            align="left">

                                                                            <h1 class="v-line-height v-font-size"
                                                                                style="margin: 0px; color: #70002d !important; line-height: 140%; text-align: center; word-wrap: break-word; font-size: 25px; font-weight: 400;">

                                                                                Hej,"""
                + " " + firstName +
                """
                                                                                            </h1>

                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>

                                                                        <table style="font-family:arial,helvetica,sans-serif;" role="presentation"
                                                                            cellpadding="0" cellspacing="0" width="100%" border="0">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                                                                                        align="left">

                                                                                        <div class="v-line-height v-font-size"
                                                                                            style="font-size: 15px; line-height: 140%; text-align: left; word-wrap: break-word;">
                                                                                            <p style="line-height: 140%; text-align: center;">Snart är det dags för sektionsmöte! Här kommer din personliga valkod. Du röstar under
                                                                                                mötet på vote.isek.se eller genom att klicka på länken:</p>
                                                                                        </div>

                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>

                                                                        <table style="font-family:arial,helvetica,sans-serif;" role="presentation"
                                                                            cellpadding="0" cellspacing="0" width="100%" border="0">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                                                                                        align="left">

                                                                                        <table height="0px" align="center" border="0"
                                                                                            cellpadding="0" cellspacing="0" width="100%"
                                                                                            style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                                            <tbody>
                                                                                                <tr style="vertical-align: top">
                                                                                                    <td
                                                                                                        style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                                                        <span>&#160;</span>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>

                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>

                                                                        <table style="font-family:arial,helvetica,sans-serif;" role="presentation"
                                                                            cellpadding="0" cellspacing="0" width="100%" border="0">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                                                                                        align="left">

                                                                                        <h1 class="v-line-height v-font-size"
                        style="margin: 0px; color: #70002d; line-height: 140%; text-align: center; word-wrap: break-word; font-size: 22px; font-weight: 400;">
                        VALKOD:
                                <a href="""
                +
                url +
                """
                        >""" + " " + voterId
                + """
                            </a>
                        </h1>





                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>

                                                                            <table style="font-family:arial,helvetica,sans-serif;" role="presentation"
                                                                                cellpadding="0" cellspacing="0" width="100%" border="0">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                                                                                            align="left">

                                                                                            <table height="0px" align="center" border="0"
                                                                                                cellpadding="0" cellspacing="0" width="100%"
                                                                                                style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                                                <tbody>
                                                                                                    <tr style="vertical-align: top">
                                                                                                        <td
                                                                                                            style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                                                            <span>&#160;</span>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </table>

                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>

                                                                            <table style="font-family:arial,helvetica,sans-serif;" role="presentation"
                                                                                cellpadding="0" cellspacing="0" width="100%" border="0">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:9px;font-family:arial,helvetica,sans-serif;"
                                                                                            align="left">

                                                                                            <table width="100%" cellpadding="0" cellspacing="0"
                                                                                                border="0">
                                                                                                <tr>
                                                                                                    <td style="padding-right: 0px;padding-left: 0px;"
                                                                                                        align="center">

                                                                                                        <img align="center" border="0"
                                                                                                            src="https://static.wixstatic.com/media/4733dc_46a400aa17d3430283c7e7b5af714f7d~mv2.png"
                                                                                                            alt="" title=""
                                                                                                            style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 300px;"
                                                                                                            width="482" />

                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>

                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>

                                                                            <!--[if (!mso)&(!IE)]><!-->
                                                                        </div><!--<![endif]-->
                                                                    </div>
                                                                </div>
                                                                <!--[if (mso)|(IE)]></td><![endif]-->
                                                                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                                            </div>
                                                        </div>
                                                    </div>


                                                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <!--[if mso]></div><![endif]-->
                                    <!--[if IE]></div><![endif]-->
                                </body>

                                </html>
                                                      """;
        return html;
    }
}
