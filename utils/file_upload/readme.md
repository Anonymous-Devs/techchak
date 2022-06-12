
### Core changes
1. **Cloudinary** service 

```javascript
const Cloudinary = require("./services/file_upload/cloudinary");
/**
* @description - Cloudinary service
*@params {Object} config - cloudinary config with some extra keys like  *folder*, *type*, *sign_url*
*@returns {Object} methods - e.g upload(), update(), delete() and get()
*/
const cloud = new Cloudinary(config);

/**
* @description - Uploads a file to cloudinary
*@params {Object} file - path to the file
* @params {Object} options - extra options to be passed to cloudinary, it uses default options if not passed
*@returns {Object} - cloudinary response
*/
cloud.upload(file, options)

/**
* @description - Updates a file in cloudinary
*@params {Object} file - path to the file
* @params {Object} options - extra options to be passed to cloudinary, it uses default options if not passed
*@returns {Object} - cloudinary response
*/
cloud.update(file, options)

/**
* @description - retrieves  a files url from cloudinary
*@params {String} public_id - public id of the file
* @params {Object} options - extra options to be passed to cloudinary, it uses default options if not passed
*@returns {Object} - the files url
*/
cloud.get(file, options);

/**
* @description - Deletes a file from cloudinary
*@params {String} public_id - public id of the file
* @params {Object} options - extra options to be passed to cloudinary, it uses default options if not passed
*@returns {Object} - cloudinary response
*/
cloud.delete(file, options);
```

__Note:__ The **cloud.delete()** method is not stable yet.;

- [ ] complete cloud.delete() service to delete passed file public_id.

  <br>

 Thank you for your time.
##

#### Contributors: <br>

[![](https://github.com/remilekun-elijah.png?size=50)](https://github.com/remilekun-elijah) 



