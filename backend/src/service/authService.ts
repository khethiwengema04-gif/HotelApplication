import { query } from "../config/database"
import bcrypt from "bcryptjs"
import { User } from "../types/userTypes"
import { new_user } from "../types/userTypes"

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const { rows } = await query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] || null;
};

export const createUser = async (userData: new_user): Promise<User> => {
    const { email, password, name, role } = userData
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt)

    console.log("[DEBUG - SERVICE] Hashing complete. Generated Hash string:", password_hash);
    const { rows } = await query(
        "INSERT INTO users (email, password, name, role) VALUES ($1,$2,$3,$4) RETURNING*",
        [email, password_hash, name, role]
    );
    return rows[0];
};


