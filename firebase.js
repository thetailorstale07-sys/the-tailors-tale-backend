import admin from "firebase-admin";
import dotenv from 'dotenv'

dotenv.config()
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

serviceAccount.private_key =
  serviceAccount.private_key.replace(/\\n/g, "\n");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://design-to-code-53917-default-rtdb.firebaseio.com"
    
  });
  
  const db = admin.database();
  export default db;
