import jwt from "jsonwebtoken";

const secret = "your_secret_key";

export function generateToken(user: any) {
    return jwt.sign(user, secret);
}

export function verifyToken(token: string) {
    return jwt.verify(token, secret);
}