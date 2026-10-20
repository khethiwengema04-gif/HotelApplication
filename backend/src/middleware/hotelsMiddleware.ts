import { Response, NextFunction } from "express";
import { user_role } from "../types/userTypes";
import { Request } from "express";

export const isAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user || req.user.role !== "Admin") {
        return res.status(401).json({
            message: "Not authorized"
        });
    }


    if (req.user.role !== "Admin") {
        return res.status(403).json({
            message: "Forbidden. Admin access level required"
        });
    }

    next();
};
