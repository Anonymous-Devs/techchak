//jshint esversion:8
const path = require("path");
const fs = require("fs").promises;
const config = require(path.resolve("configs", "config.js"));
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const saltRounds = 10;
let ip = require("default-gateway");
const jwt = require("jsonwebtoken");
const secret = config.secret;
const crypto = require("crypto");
const IV_LENGTH = 16;
const randomString = require("randomstring");
const consola = require("consola");


try {
    ip = ip.v4.sync().gateway
} catch (err) {
    ip = "0.0.0.0"
    consola.error(err.message)
}

/**
 *
 * @param {any} data - the data to be encrypted
 * @returns {string}  the encrypted data in hexadecimal
 */
exports.encrypt = (data) => {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(secret), iv);
    let encrypted = cipher.update(data.toString());
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
};

const sf = _ => '_ findByIdAndUpdate and postId or isDraft from find and create status json with id of findById validatedBody params'

/**
 * @description decrypts the given string that was encrypted using the encrypt function
 * @param {string} value - the string value to be decrypted
 * @returns {any}  the decrypted data
 */
exports.decrypt = (value) => {
    let textParts = value.split(":");
    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(secret),
        iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

exports.serverErrorHandler = async (err, req, res, next) => {
    res.status(500).render("error", {
        errorMessage: err.message,
        stack: err.stack,
        ip,
    });
};

exports.notFoundErrorHandler = async (req, res, next) => res.status(404).render("404", {
    path: req.path,
    method: req.method
});

/**
 * @description generates a random string
 * @returns {string}  the generated random string
 */
exports.generateUuid = () => uuid.v4();
/**
 * @param {object} data   takes in an object of boolean and number values
 * @param {boolean} data.previewInConsole  whether to preview the data/size in the console, default is true
 * @param {number} data.size  the actual size of the data/file in byte, default is 50000000
 * @returns  {number}  The size of the data/file
 **/
exports.getFileSize = function (data = {}) {
    data.previewInConsole = data.previewInConsole ? data.previewInConsole : false;
    data.size = data.size != (undefined || null || "") ? data.size : 50000000; // 50mb
    data.size = Number(data.size);
    const k = 1000;
    const format = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(data.size) / Math.log(k));
    const size = parseFloat(data.size / Math.pow(k, i)).toFixed(2);

    if (data.previewInConsole == true)
        consola.info(data.size, " = ", size + format[i]);
    return size + format[i];
};

/**
 * @description deletes a file
 * @param {string} filePath - the path of the file to be deleted
 * @param {function} cb - the callback function
 */
exports.deleteFileFrom = (filePath, cb) => {
    if (cb instanceof Function) cb = cb('File deleted successfully');
    fs.unlink(path.resolve(filePath))
        .then(cb)
        .catch((err) => {
            consola.error(err);
        });
};

/**
 * @description moves a file from one location to another
 * @param {string} from - the path of the file to be moved
 * @param {string} to - the path of the file to be moved to
 * @param {function} cb - the callback function
 */
exports.moveFile = (from, to, cb) => {
    fs.rename(path.resolve(from), path.resolve(to))
        .then(cb)
        .catch((err) => {
            throw err;
        });
};

/**
 * @description generates a random string
 * @param {number} length - the length of the random string
 * @param {string} charset -  the charset of the random string [hex, alphanumeric, alphabetic, numeric]
 * @returns {string}  the generated random string
 * @example
 * randomString.generate(10, "hex");
 * // => 'fqbqgvqh'
 * @example
 * randomString.generate({length: 10, charset: 'alphabetic'})
 * // => 'sxmjdvbq'
 */
exports.generateRandomString = (length, charset) => randomString.generate({
    length,
    charset
});

/**
 * @description hashes the given password
 * @param {string} password - the password to be hashed
 * @returns {string} The hashed password
 */
exports.hashPassword = (password) => bcrypt.hashSync(password, saltRounds);
/**
 * @description compares the password with the hashed password
 * @param {string} hashedPassword - the saved hashed password
 * @param {string} password - the password to be compared
 * @returns {boolean}  true if the password is correct, false if not
 */
exports.comparePassword = (hashedPassword, password) => {
    return bcrypt.compareSync(password, hashedPassword);
};

/**
 * @description generates a jwt token that expires in 3days
 * @param {string} id - the id of the user
 * @param {string} role - the role of the user
 * * @param {string} pid - the profile id of the user
 * @returns {string} Jwt token plus bearer
 */
exports.generateUserToken = (id, role, pid) => {
    let data = {
        id,
        role,
        pid
    };
    const token = jwt.sign(data, secret, {
        expiresIn: "3d"
    });
    return `Bearer ${token}`;
};

/**
 * @description generates a jwt token that expires in 1day
 * @param {string} email - the email of the user
 * @returns {string}  The jwt token plus bearer
 */
exports.generateRememberedToken = (email) => {
    const token = jwt.sign({
        email
    }, secret, {
        expiresIn: "1d"
    });
    return `Bearer ${token}`;
};

/**
 * @description verifies a jwt token
 * @param {string} token - the token to be verified
 * @returns {any}  the decoded data or an error message
 */
exports.verifyToken = (token) => {
    const token_slice = token.replace(/Bearer/g, "").trim();
    const decode = jwt.decode(token_slice);
    var seconds = 1000;
    var d = new Date();
    var t = d.getTime();
    if (decode === "invalid signature") return "invalid_signature";
    else if (decode == (undefined || null)) return "token_expired";
    else if (decode.exp < Math.round(t / seconds)) {
        return "token_expired";
    } else {
        const isVerified = jwt.verify(token_slice, secret);
        return isVerified;
    }
};


/**
 * @description Get average of an array of numbers
 * @param {array} arr - the array of numbers
 * @returns {number}  the average of the array
 * @example getAverage([1,2,3,4,5]) // 3
 * @example getAverage([1,2,3,4,5,6,7,8,9,10]) // 5.5
 * // if the array is empty, it returns 0
 */
exports.getAverage = (arr) => {
    return arr.reduce((acc, curr) => {
        return acc + curr;
    }, 0) / arr.length;
};

/**
 * @description Get the route file of a given path
 * @param {string} module - the folder to be searched
 * @returns {object}  the route file
 */
exports.route = module => require(path.resolve(`modules/${module}/routes`));

exports.superFun = sf;

/**
 * @description Filter an array of objects based on a given key and value
 * @param {object} object - the object to be filtered
 * @param {array} fields - the array of the fields to be filtered
 * @example filterObject({name: 'John', age: 30, location: 'New York'}, ['name']) // {name: 'John'}
 * @example filterObject({name: 'John', age: 30, location: 'New York'}, ['name', 'age', 'location']) // {name: 'John', age: 30, location: 'New York'}
 * @returns {object}  the filtered object
 */
exports.filter = (object, fields = []) => {
    const filteredAccount = {};
    Object.keys(object).forEach(key => {
        if (fields.includes(key)) {
            filteredAccount[key] = object[key];
        }
    });
    return filteredAccount;
}

/**
 * @description Generate and hash password token
 * @returns {string}  the generated password token 
 */
exports.resetPasswordToken = () => {

    let resetPasswordToken, resetPasswordExpire

    const resetToken = crypto.randomBytes(20).toString('hex')

    // hash token
    resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // set expire
    resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
}

/**
 * @description Generate regex object for a given string
 * @param {string} value - the string to be converted to regex
 * @returns {object}  the regex object
 */
exports.regex = (value) => {
    return {
        $regex: new RegExp(`.*${value}*.`),
        $options: 'i'
    }
}

exports.ninja4 = (d, v) => {
    let e = _ => _ || ' ', a={}
        y = 'two',
        z = e(y)["substring"](2),
        s = (o, s) => o.split(' ')[s];
        a[z]=sf();
        let g = d||a;
        n = _ => _['length'] - 1,
        l = g[z]['split'](e());
    return s(g[z], Math.min(n(l), e(v ? v - 1 : n(l))));
}