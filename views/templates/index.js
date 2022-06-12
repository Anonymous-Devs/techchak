const path = require("path");
const mjml = require("mjml");
const ejs = require("ejs");
const config = require(path.resolve("configs", "config"));

/**
 * @params {fileName - The file name of the template, object - datas that will be displayed in the email body **/
exports.use = async(fileName, object) => {

    object.header = object.header === false ? false : true;
    object.footer = object.footer === false ? false : true;
    object.headerText = object.headerText || "";
    object.footerText = object.footerText || "";
    object.userName = object.userName || "";
    object.buttonText = object.buttonText || "";
    object.buttonLink = object.buttonLink || "";
    object.additionalText = object.additionalText || "";
    object.appName = config.application_name;

    const filePath = await ejs.renderFile(path.join(__dirname, `files/${fileName}.ejs`), object);
    return mjml(filePath).html;
}