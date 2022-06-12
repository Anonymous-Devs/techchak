const path = require("path");
const config = require(path.resolve("configs", "config"));
const nodemailer = require("nodemailer");
const { info, error, success } = require('consola');

exports.sendMail = async function(message) {
    info("sending mail to", message.to+'...');
    const transporter = nodemailer.createTransport({

        host: config.smtp_host,
        port: 587, // 587 465
        secure: false,
        auth: {
            user: config.smtp_user,
            pass: config.smtp_secret
        }
    })
    const packet = {
        from: `"${config.application_name}" <${config.smtp_from}>`,
        to: message.to,
        replyTo: `<${config.gmailUser}>`,
        subject: message.subject,
        html: message.body
    };

    try {
        /* send the mail */
        transporter.sendMail(packet, (err, infos) => {
            if (err) {
                error("email sending failed:", err.message);
                info("attempting to send mail again...");
                transporter.sendMail(packet, (err, info) => {
                    if (err) {
                        error("Failed to send mail");
                    } else success("Email sent to:", info.messageId, "after failed trial ");
                });
            } else success("Email sent to:", infos.messageId);
        });

    } catch (e) {
        throw new Error("Something is wrong with the mail service, please try again.");
    }
};


