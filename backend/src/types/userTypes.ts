export type user_role = 'Admin' | 'User'

export interface User {
    id: number,
    email: string,
    password: string,
    name: string,
    role: user_role
}

export type new_user = Omit<User, 'id'>
