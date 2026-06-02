import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from "./firebase.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.post("/api/v2/register", async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        console.log(req.body)
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password required"
            });
        }

        const userRef = db
            .ref("users")
            .child(email.replace(/\./g, "_"));

        const snapshot = await userRef.get();

        if (snapshot.exists()) {
            return res.status(400).json({
                error: "User already exists"
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            createdAt: Date.now(),
        };

        await userRef.set(userData);

        // create token
        const token = jwt.sign(
            { email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "User registered successfully",
            token,
            user: {
                firstName,
                lastName,
                email,
                phone
            }
        });

    } catch (err) {
        console.error("Register error:", err);

        res.status(500).json({
            error: err.message
        });
    }
});
app.post("/api/v2/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password required"
            });
        }

        const userRef = db
            .ref("users")
            .child(email.replace(/\./g, "_"));

        const snapshot = await userRef.get();

        if (!snapshot.exists()) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const user = snapshot.val();

        // compare hashed password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid password"
            });
        }

        // create token
        const token = jwt.sign(
            { email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        const responseUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
        };

        res.json({
            message: "Login successful",
            token,
            user: responseUser
        });

    } catch (err) {
        console.error("Login error:", err);

        res.status(500).json({
            error: err.message
        });
    }
});

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Access denied"
        });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch {
        res.status(403).json({
            error: "Invalid token"
        });
    }
};

app.get("/api/profile", verifyToken, async (req, res) => {
    res.json({
        message: "Protected route",
        user: req.user
    });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));