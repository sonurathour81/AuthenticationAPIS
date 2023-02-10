import ejs from "ejs";
import path from "path";
import transporter from "../config/emailConfig.js";
const __dirname = path.resolve();

export const sendEmail = (obj) => {
  let filePath = __dirname + "/templates/welcome.ejs";

  ejs.renderFile(filePath, { obj }, (err, data) => {
    if (err) {
    } else {
      var mailOptions = {
        from: process.env.EMAIL_FROM,
        to: obj.receiver,
        subject: obj.subject,
        html: data,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
      });
    }
  });
};
