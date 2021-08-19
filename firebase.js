const firebase = require("firebase");

const firebaseConfig = {
  apiKey: "AIzaSyDCp2-jBYxnirkAmFqtyjZbWNyDL2mZaOo",

  authDomain: "facebook-helpdesk-ad9c7.firebaseapp.com",

  projectId: "facebook-helpdesk-ad9c7",

  storageBucket: "facebook-helpdesk-ad9c7.appspot.com",

  messagingSenderId: "709931206688",

  appId: "1:709931206688:web:30995d7768cb2fc3449445",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

module.exports = db;
