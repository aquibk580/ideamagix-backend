import multer, { StorageEngine, FileFilterCallback } from "multer";
import { Request } from "express";

const storage: StorageEngine = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];

    if (!validTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, JPG, GIF, and WEBP are allowed."
        )
      );
    }

    cb(null, true);
  },
});

export { upload };
