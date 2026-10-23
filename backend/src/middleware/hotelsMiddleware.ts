import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from "path";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// Check if the logged-in user is an administrator
export const isAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please log in first.",
        });
    }

    if (req.user.role !== "Admin") {
        return res.status(403).json({
            message: "Forbidden. Admin access level required.",
        });
    }

    next();
};

// Store uploaded images in Cloudinary
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        const nameWithoutExt = path.parse(file.originalname).name;

        return {
            folder: "PillowPick_accommodations",
            public_id: `${nameWithoutExt}-${uniqueSuffix}`,
        };
    },
});

// Allow image files only
const fileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    cb
) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"));
    }
};

// Upload middleware
export const uploadImage = multer({
    storage: cloudinaryStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB per image
    },
});