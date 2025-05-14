import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        const validTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/gif",
            "image/webp",
        ];
        if (!validTypes.includes(file.mimetype)) {
            return cb(new Error("Invalid file type. Only JPEG, PNG, JPG, GIF, and WEBP are allowed."));
        }
        cb(null, true);
    },
});
export { upload };
