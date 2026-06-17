import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDElvnpE8PghF2QydZzcwnBHLdcc3cWqUc",
  authDomain: "shadow-anime-26eb1.firebaseapp.com",
  projectId: "shadow-anime-26eb1",
  storageBucket: "shadow-anime-26eb1.firebasestorage.app",
  messagingSenderId: "377013835562",
  appId: "1:377013835562:web:1c0ec34f2b0efc1fc9b053",
  measurementId: "G-61T4FLSZC5"
}

const app = initializeApp(firebaseConfig)
const fbAuth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { app, fbAuth, googleProvider }
