import { Request, Response } from "express";
import * as authService from "../service/authService";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const register = async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body
    console.log("[DEBUG - CONTROLLER] User object returned from service layer:",);
    if (!email || !password || !name || !role) {
        return res.status(400).json({ message: "Email, password,role and name are required" })
    }
    try {
        const existingUser = await authService.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "Email is ready in use" });
        }
        const user = await authService.createUser({ email, password, role, name });
        res
            .status(201)
            .json({ message: "user registered successfully", userId: user.id });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error registering the user" });
    }
};

// export const login = async (req: Request, res: Response) => {
//     const { email, password } = req.body;
//     if (!email || !password) {
//         return res.status(400).json({ message: "Email and password are required" });
//     }

//     try {
//         const user = await authService.findUserByEmail(email);
//         const payload = { userId: user?.id, email: user?.email }
//         const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" })
//         res.status(200).json({ message: "Login Successful", token })
//     } catch (error) {
//         res.status(401).json({ message: "Invalid Password" })

//     }
// };



export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        const user = await authService.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const payload = { userId: user.id, email: user.email, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
        res.status(200).json({
            message: "Login successful", token, user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role

            }
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error logging in" });
    }
};