export const environment = {
  production: true,
  // Added firebaseConfig to match non-prod environment so production builds that
  // reference environment.firebaseConfig (in app.module.ts) compile without TS errors.
  // Replace with production credentials if needed.
  firebaseConfig: {
    apiKey: "AIzaSyBN422eOTw9wtpTApsrqgD9oMGxMOE_8tk",
    authDomain: "crud-maria-7d596.firebaseapp.com",
    projectId: "crud-maria-7d596",
    storageBucket: "crud-maria-7d596.firebasestorage.app",
    messagingSenderId: "486548853277",
    appId: "1:486548853277:web:9109f393762bee4c8eecf4",
    measurementId: "G-5YXKMXZKHW"
  }
};
