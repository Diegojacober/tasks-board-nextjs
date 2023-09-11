import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyDFhw-5MFimfX3de-hczCSRP_ncEBL5_iE",
    authDomain: "tarefas-plus-fd85d.firebaseapp.com",
    projectId: "tarefas-plus-fd85d",
    storageBucket: "tarefas-plus-fd85d.appspot.com",
    messagingSenderId: "336942915662",
    appId: "1:336942915662:web:14f04f615a4a138ac9e31f"
};


const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp)

export { db }
