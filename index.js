import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from "./firebase.js";

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get("/users", async (req, res) => {
    try {
      const snapshot = await db.ref("users").get();
      if (!snapshot.exists()) {
        return res.status(404).json({ error: "No users found" });
      }
  
      const users = snapshot.val();
  
      // Convert object to array with email as id
      const userList = Object.keys(users).map((key) => ({
        id: key.replace(/_/g, "."),
        ...users[key],
      }));
  
      res.json({ users: userList });
    } catch (err) {
      console.error("Get users error:", err);
      res.status(500).json({ error: err.message });
    }
  });




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));