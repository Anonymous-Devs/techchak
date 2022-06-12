const Mail = require('../utils/mail');
// const helper = require('../utils/helper');
const config = require('../configs/config');
const template = require('../views/templates');
const {
  ADMIN,
  SUPERADMIN
} = require('../utils/role');

class Notificaton {
  static async sendVerificationEmail(option = {}) {
    // uses jwt to hash the email
    const secure = helper.generateRememberedToken(option.to);
    // uses crypto to encrypt the jwt hash
    let encryptedLink = helper.encrypt(secure),
      url = `${config.host}/auth/verify/?secure=${encryptedLink}`;
    const pass = option.defaultPassword ? "<br> Your default password is: <h3>" + option.defaultPassword + "</h3>" : "";
    const data = {
      userName: option.name || option.to,
      buttonText: "Verify Account",
      buttonLink: url,
      header: true,
      headerText: `Welcome to ${config.application_name}`,
      text: `Welcome to our platform. ${pass}`,
      additionalText: "Kindly use the button below to verify your account.",
    };
    // message config
    const message = {
      from: config.smtp_from,
      to: option.to,
      subject: "Account Verification",
      body: await template.use("dynamic-template", data),
    };
    // send the mail
    await Mail.sendMail(message);
  }

  static async sendSuspensionMail(option = {}) {
    const data = {
      userName: option.name || option.to,
      header: true,
      headerText: `Suspension Notice`,
      text: `We regret to tell you this, but your account has been suspended on our platform.`,
      additionalText: "If you mind, you can use the button below to do a follow up on this action.",
      buttonLink: "mailto:support@techchak.com",
      buttonText: "Contact Support",
    };
    // message config
    const message = {
      from: config.smtp_from,
      to: option.to,
      subject: "Account Suspended",
      body: await template.use("dynamic-template", data),
    };
    // send the mail
    await Mail.sendMail(message);
  }

  static async sendSuspensionRevokedMail(option = {}) {
    let url;
    if ([ADMIN, SUPERADMIN].includes(option.role)) {
      url = config.frontend_admin_host;
    } else {
      url = `${config.frontend_host}/login`;
    }
    const data = {
      userName: option.name || option.to,
      header: true,
      headerText: `Suspension Notice`,
      text: `We are glad to tell you that your account suspension has been revoked.`,
      additionalText: "You can now log into your account to continue enjoying all our amazing services.",
      buttonLink: url,
      buttonText: "Login",
    };
    // message config
    const message = {
      from: config.smtp_from,
      to: option.to,
      subject: "Account Suspension Updated",
      body: await template.use("dynamic-template", data),
    };
    // send the mail
    await Mail.sendMail(message);
  }

  static async sendChangedPasswordEmail(option = {}) {
    // uses jwt to hash the email
    const secure = helper.generateRememberedToken(option.to);
    // uses crypto to encrypt the jwt hash
    let encryptedLink = helper.encrypt(secure);
    let url;
    if ([ADMIN, SUPERADMIN].includes(option.role)) {
      url = config.frontend_admin_host
    } else url = config.frontend_host;
    const data = {
      userName: option.name || option.to,
      buttonText: "Reset Password",
      buttonLink: `${url}/password-reset/?secure=${encryptedLink}`,
      headerText: `Password Changed`,
      text: `Your password was changed successfully.`,
      additionalText: "If this action was not done by you, kindly use the button below to reset your password.",
    };
    // message config
    const message = {
      from: config.smtp_from,
      to: option.to,
      subject: "Password Changed",
      body: await template.use("dynamic-template", data),
    };
    // send the mail
    await Mail.sendMail(message);
  }

  static async sendResetPasswordMail(option = {}) {
    try {
      // uses jwt to hash the email
      const secure = helper.generateRememberedToken(option.to);
      // uses crypto to encrypt the jwt hash
      let encryptedLink = helper.encrypt(secure);
      let url;
      if ([ADMIN, SUPERADMIN].includes(option.role)) {
        url = config.frontend_admin_host
      } else url = config.frontend_host;
      const data = {
        userName: option.name || option.to,
        buttonText: "Reset Password",
        buttonLink: `${url}/password-reset/?secure=${encryptedLink}`,
        header: true,
        headerText: `Welcome back to ${config.application_name}`,
        text: "You requested for a password reset earlier.",
        additionalText: "Kindly use the button below to confirm your request.",
      };
      // message config
      const message = {
        from: config.smtp_from,
        to: option.to,
        subject: "Password Reset",
        body: await template.use("dynamic-template", data)
      };
      /* send the mail */
      await Mail.sendMail(message);

    } catch (e) {
      throw e;
    }
  }

  static async sendApplicationNotification(option = {}) {
    try {
      const data = {
        userName: option.name || option.to,
        header: true,
        headerText: `Welcome to ${config.application_name}`,
        text: "Your application to join our platform has been received. <br> Please give us some time to review it.",
        additionalText: "You will get notified once it is reviewed.",
      };
      // message config
      const message = {
        from: config.smtp_from,
        to: option.to,
        subject: "Membership Application",
        body: await template.use("dynamic-template", data)
      };
      /* send the mail */
      await Mail.sendMail(message);
    } catch (e) {
      throw e;
    }
  }

  static async sendAutomatedAcceptanceMail(option = {}) {
    try {

      const data = {
        userName: option.name || option.to,
        header: false,
        footer: true,
        headerText: `Welcome to ${config.application_name}`,
        text: "<p>My name is Gabriel Olokunwolu, and I am Techchak's CEO. I'd like to express my heartfelt gratitude for joining the Techchak family. One of the most significant advantages you will receive from us is access to exclusive hands-on projects in your area of specialization to help you grow your skills, as well as specially curated wikis tailored to your specialty.<br/>We've also given you your own unique profile to showcase your project solutions, wiki, and skill sets in order to inspire and collaborate with your peers. In addition, we have a dedicated support group to assist you when you are stuck on a project.</p>",
        additionalText: "<p style='margin-bottom:0; paddiing-bottom:0;'>You should have already received an email with your login information so that you can begin exploring projects, wikis, and people with similar skill sets and interests. <br/><br/> If you have any questions, please contact us at <a style='text-decoration: none !important; color: #333 !important' href='mailto:info@techchak.com'>info@techchak.com</a>. Welcome to Techchak once more!<br/><br/>Cheers to expansion!</p>",

      };
      // message config
      const message = {
        from: config.smtp_from,
        to: option.to,
        subject: "Membership Application",
        body: await template.use("dynamic-template", data)
      };
      /* send the mail */
      await Mail.sendMail(message);
    } catch (e) {
      throw e;
    }
  }

  static async sendAccountDeletedEmail(option = {}) {
    try {
      const data = {
        userName: option.name || option.to,
        header: true,
        headerText: `Account Deletion`,
        text: "Your account was deleted on our platform.",
        additionalText: "We know this wasn't your action, however, you can contact our support team to learn more about what could have led to this action.",
        buttonLink: "mailto:support@techchak.com",
        buttonText: "Contact Support",
      };
      // message config
      const message = {
        from: config.smtp_from,
        to: option.to,
        subject: "Account Deletion",
        body: await template.use("dynamic-template", data)
      };
      /* send the mail */
      await Mail.sendMail(message);

    } catch (e) {
      throw e;
    }
  }


  static async sendDataDeletionNotification(option = {}) {
    try {
      const data = {
        userName: option.name || option.to,
        header: true,
        headerText: `${option.type} Deletion`,
        text: `Your ${option.type.toLowerCase()} was deleted on our platform by a Super Admin.<br>`,
        additionalText: option.reason ? `Here is the reason: <br> ${option.reason} <br><br> ` : "" +
          `You can contact the support team for clarity on the rules guiding ${option.type.toLowerCase()} creation .`,
        buttonLink: "mailto:support@techchak.com",
        buttonText: "Contact Support",
      };
      // message config
      const message = {
        from: config.smtp_from,
        to: option.to,
        subject: "Project Deletion",
        body: await template.use("dynamic-template", data),

      };
      /* send the mail */
      await Mail.sendMail(message);

    } catch (e) {
      throw e;
    }
  }

  static async sendAppStatusEmail(option = {}) {
    option.status = option.status.toLowerCase();

    try {
      let text = `Good News! Your Techchak profile has been created`,
        btn, additionalText,
        topic;

      if (option.status === "accepted") {
        topic = 'Profile Created'
        text = text.concat(`. <br><br>Your default password is: <h3 style='margin-top:0'>${option.defaultPassword}</h3>`);
        additionalText = 'kindly use the button below to log into your account.'
        btn = {
          buttonText: "Login",
          buttonLink: `${config.frontend_host}/login`
        }
      } else if (option.status === "rejected") {
        topic = 'Application Rejected'
        text = "We regret to tell you this, but <br>" + text.toLocaleLowerCase() + " due to unmet requirements in your application information.";
        additionalText = "However, you can apply again sometime in the future if you think you can upscale your application information to look better than before.",
          btn = {}
      }

      const data = {
        userName: option.name || option.to,
        header: true,
        headerText: topic,
        text,
        additionalText,
        ...btn
      };
      // message config
      const message = {
        from: config.smtp_from,
        to: option.to,
        subject: "Membership Application Updated",
        body: await template.use("dynamic-template", data)
      };
      /* send the mail */
      await Mail.sendMail(message);

    } catch (e) {
      throw e;
    }
  }

  static async sendWaitlistMessage(option = {}) {
    try {
      const data = {
        userName: option.name || option.to,
        header: true,
        headerText: `Wait-list Update`,
        text: `Hi There,
        Thank you for being interested in joining Techchak. You’ve been added to the Techchak waitlist as a fellow.`,
        additionalText: `For questions or concerns, send us an email at <a style='text-decoration: none !important; color: #333 !important' href='mailto:info@techchak.com'>info@techchak.com</a>.`,
        // buttonLink: "mailto:
      }
      // message config
      const message = {
        from: config.smtp_from,
        to: option.to,
        subject: "Waitlist",
        body: await template.use("dynamic-template", data)
      };
      /* send the mail */
      await Mail.sendMail(message);
    } catch (e) {
      throw e;
    }
  }
}
module.exports = Notificaton;
