const {
 request
} = require("./request");
let req = require("request");
const configs = require("../configs/config");
const FormData = require('form-data');
const fs = require('fs');
// import fetch from 'node-fetch';


class REMOVEBG {
 /**
 * @param {object} config - config object
 * @param {string} config.uploadType - image upload type: "url", "file" or "base64"
 * @param {string} config.data - image to upload, depending on the `config.type`
 * @param {string} config.size - returned image resolution: "preview" [`default`], "full" or "auto"
 * @param {string} config.type - the content of the image: "person" [`default`], "product" or "car"
 * @param {string} config.format - image format: "png" [`default`] - transparency will be applied, "jpg" or "zip" no transparency
 * @param {boolean} config.crop - crop the returned image: true or false [`default`]
 * @param {string} config.cropMargin - Adds a margin around the cropped image [`default: 0`]: Can be a "px" or a "%" value
 * @param {string} config.scale - Scales the image relative to the total image size. Can be any value from "10%" to "100%", or "original" [`default`]. Scaling the image implies `config.position:"center"` (unless specified otherwise).
 * @param {string} config.position - Positions the subject within the image canvas. Can be "original" (default unless "scale" is given), "center" (default when "scale" is given) or a value from "0%" to "100%" (both horizontal and vertical) or two values (horizontal, vertical).
 * @param {boolean} config.addShadow - Whether to add an artificial shadow to the result [`default: false`]. NOTE: Adding shadows is currently only supported for car photos. Other subjects are returned without shadow, even if set to true (this might change in the future).
 * @param {string} config.bgColor - background color of the image: can be rgb or hex [`default:"transparent"`]
 * @param {string} config.bgImageFile - Adds a background image from a File `"binary"`. The image is centered and resized to fill the canvas while preserving the aspect ratio, unless it already has the exact same dimensions as the foreground image. (If this parameter is present, the other bg parameters must be empty.)
 * * @param {string} config.bgImageUrl - Adds a background image from a URL. The image is centered and resized to fill the canvas while preserving the aspect ratio, unless it already has the exact same dimensions as the foreground image. (If this parameter is present, the other bg parameters must be empty.)
 
 * @returns {object} - response object
 */
 constructor(config) {
  this.config = config
  this.baseUrl = "https://api.remove.bg/v1.0";
  this.apiKey = configs.remove_bg_api_key || process.env.REMOVE_BG_API_KEY;
 }
 /**
  * @description - remove background from image
  * @param {string} image - alias of `config.data`: set the value of `config.data`
  * @param {object} outputFilePath - Path to save output file
  * @returns {object} - response object
  **/
 async removeBackground(image, outputFilePath) {
  try {
   if (image) this.config.data = image;

   const {
    uploadType,
    data,
    size,
    type,
    format,
    crop,
    cropMargin,
    scale,
    position,
    addShadow,
    bgColor,
    bgImageFile,
    bgImageUrl,
   } = this.config;

   let response = {};

   let url = this.baseUrl.concat("/removebg");
   let formData = {
    size: size || "preview",
    type: type || "person",
    format: format || "png",
    // crop: crop || false,
    crop_margin: cropMargin || 0,
    scale,
    position,
    // add_shadow: addShadow || false,
    bg_color: bgColor,
    bg_image_file: bgImageFile,
    bg_image_url: bgImageUrl,
   };

   if (bgImageFile == (undefined || null)) delete formData.bg_image_file;
   if (bgImageUrl == (undefined || null)) delete formData.bg_image_url;
   if (bgColor == (undefined || null)) delete formData.bg_color;
   if (!scale) delete formData.scale
   if (!position) delete formData.position
   // if (!addShadow) delete formData.add_shadow
   // if (!crop) delete formData.crop

   let contentType,
   mpart = false;
   if (uploadType === "file") {
    formData.image_file = fs.createReadStream(data);
    contentType = "multipart/form-data";
    mpart=true;
   } else if (uploadType === "base64") {
    formData.image_file_b64 = data;
    contentType = "multipart/form-data";
    mpart=true;
   } else {
    formData.image_url = data; 
    contentType = "application/json";
   }

   
   let form = new FormData();
   for (let key in formData) {
    if (formData[key] !== undefined) {
     form.append(key, formData[key]);
    }
   }

   const balance = await this.getAccountInfo();
   
  let arr = [];
  for(let i in balance.data){
    let output = Object.values(balance.data[i]).filter(value => typeof value != "string")
     arr.push(...output)
  }
  
  let datas = null;
  const option = {
   method: "POST",
   headers: {
    'X-Api-Key': this.apiKey,
    "Content-Type": contentType,
   }
  };
  if (mpart) {
   option.formData = formData;
  } else {
   option.body = JSON.stringify(formData);
  }
  if(Math.max(...arr) > 0){
   datas = req(url, option)
   .pipe(fs.createWriteStream(outputFilePath || "./removed_bg.png"));
   datas = {
    path: datas.path,
    status: 201,
    message: "Created"
   }
  }


   return datas;
  } catch (e) {
   console.log(e);
   // logger.error(e.response.data.errors[0]);
  }
 }

 async getAccountInfo() {
  try {
   const url = this.baseUrl.concat("/account");
   const {
    status,
    data
   } = await request({
    endpoint: url,
    headers: {
     'X-Api-Key': this.apiKey,
     "Content-Type": "application/json"
    }
   });

   return {
    status,
    data: data.data.attributes
   };
  } catch (e) {
   throw e;
  }
 }
}

module.exports = REMOVEBG;