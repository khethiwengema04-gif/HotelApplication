import { Request, Response } from "express";
import * as authService from "../service/authService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

export const register = async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
        return res.status(400).json({
            message: "Email, password, role and name are required"
        });
    }

    try {
        const existingUser = await authService.findUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already in use"
            });
        }

        const user = await authService.createUser({
            email,
            password,
            role,
            name
        });

        return res.status(201).json({
            message: "User registered successfully",
            userId: user.id
        });
    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Error registering the user"
        });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {
        const user = await authService.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Error logging in"
        });
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({
            message: "Google credential is required"
        });
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.email_verified) {
            return res.status(401).json({
                message: "Invalid or unverified Google account"
            });
        }

        const email = payload.email;
        const name = payload.name || email.split("@")[0];

        let user = await authService.findUserByEmail(email);

        if (!user) {
            user = await authService.createGoogleUser(name, email);
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Google login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Google login error:", error);

        return res.status(401).json({
            message: "Google authentication failed"
        });
    }
};