import { Request, Response } from "express";
import * as authService from "../service/authService";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const register = async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body
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
