import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { findUserByEmail } from "../service/authService"
import { User } from "../types/userTypes"

interface JwtPayLoad {
    userId: number,
    email: string
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            console.log(req.headers, "request headers");
            console.log(req.headers.authorization, "token");
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayLoad;
            console.log(decoded, 'decoded token');

            const user: User | null = await findUserByEmail(decoded.email)
            req.user = user || undefined

            if (!req.user) {
                return res
                    .status(401)
                    .json({ message: "Not authorize, user not found" });
            }

            return next()
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Not authorized,no token" })
    }
    return res.status(401).json({ message: "Not authorized" })
}