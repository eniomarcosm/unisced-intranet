import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Optionally import the services that you want to use
// import {...} from "firebase/database";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyBduBk49WNy4RWeXB3D3J6OMpJd8Rolt-k',
  authDomain: 'sistema-de-ferias-456ef.firebaseapp.com',
  projectId: 'sistema-de-ferias-456ef',
  storageBucket: 'sistema-de-ferias-456ef.appspot.com',
  messagingSenderId: '197881941919',
  appId: '1:197881941919:web:9e3683d0d67395d427f7aa',
  measurementId: 'G-WCCMV818KG'
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const firestore = getFirestore(app)
const storage = getStorage(app)

export { app, firestore, auth, storage }

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

// IOS: 624452011562-37clk4l3ou6dn47ubs47joptk74hkrd5.apps.googleusercontent.com
// Android: 624452011562-b4pvbhj08tc4m5tgoim12229a8m993d2.apps.googleusercontent.com
