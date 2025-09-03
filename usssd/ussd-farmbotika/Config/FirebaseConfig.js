// config/firebaseConfig.js
const admin = require('firebase-admin'); // 1. Import the Firebase Admin SDK
const dotenv = require('dotenv');       // 2. Import dotenv to load environment variables
dotenv.config();                        // 3. Load variables from .env file

// Path to your service account key file
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH); // 4. Load your service account key

admin.initializeApp({ // 5. Initialize the Firebase Admin SDK
    credential: admin.credential.cert(serviceAccount), // Use the service account for authentication
    databaseURL: process.env.FIREBASE_DATABASE_URL // Specify the URL of your Firebase Realtime Database
});

const db = admin.database(); // 6. Get a reference to the Realtime Database service
// const firestore = admin.firestore(); // Optional: Get a reference to Firestore if you use it

module.exports = { db /*, firestore */ }; // 7. Export the database object for use in other files