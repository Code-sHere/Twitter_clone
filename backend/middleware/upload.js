import multer from "multer";

const storage = multer.memoryStorage();

const uploade = multer({
    storage,
    limits:{
        fileSize: 100 * 1024 * 1024,
    },
    fileFilter:(req, file, cb) =>{
        if(!file.mimetype.startsWith("audio/")){
            return cb(new Error("Please select an audio file"));
        }

        cb(null, true);
    }
})

export default uploade;