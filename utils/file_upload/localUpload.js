const multer = require("multer");
const uuid = require("uuid");
const path = require("path");
// const fs = require("fs");
// const { info, success, error } = require("consola");

// creates multer uploads/temp folder if not created
// fs.readdir("uploads", (err, files) => {
//     if (files === undefined) {
//         fs.mkdir("uploads", _ => {
//             info("uploads folder created");

//             fs.mkdir("uploads/temp", _ => {
//                 info("temp folder created");
//                 success("Folders successfully created for Multer uploaded files ✨");
//             });
//         });
//     }
// });

// setup storage
const storage = multer.diskStorage({

    destination: "temp/uploads",
    filename: function(req, file, cb) {
        const uniqueName = Date.now() + '-'+ Math.round(Math.random() * 1E5) + path.extname(file.originalname);
        // Set the name of the file in the upload folder
        const filename = uniqueName;
        cb(null, filename);
    },
    limits: {
        fileSize: 50000000, // 50MB
    },
    fileFilter: function(req, file, cb) {
        // Check if the file is an image
        if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video") || file.mimetype.startsWith("application/pdf")) {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file uploaded"), false);
        }
    },
});

exports.upload = multer({ storage: storage }).any();