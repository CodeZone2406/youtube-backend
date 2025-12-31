import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log("🟢 Multer destination called for field:", file.fieldname);
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        // console.log("🟢 Multer filename called for file:", file.originalname);
        cb(null, file.originalname)
    }
})

export const upload = multer({ 
    storage: storage,
})

