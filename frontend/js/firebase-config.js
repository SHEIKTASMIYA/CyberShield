/* ==========================================================================
   CYBERSHIELD — FIREBASE WEB SDK INITIALIZER & MODULE WRAPPER
   Dynamically loads the official Firebase v10 Modular SDK via CDN, initialises
   the connection, and exposes authentication & Firestore database helpers.
   ========================================================================== */

(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBkNRW6l_YHlo4iCFz72resS8DiMMABdio",
    authDomain: "cybershield-999bc.firebaseapp.com",
    projectId: "cybershield-999bc",
    storageBucket: "cybershield-999bc.firebasestorage.app",
    messagingSenderId: "801492235574",
    appId: "1:801492235574:web:1a0784f739b3c23a536f97",
    measurementId: "G-QMH89CBPW2"
  };

  // Expose services under the window.CS_FIREBASE namespace
  window.CS_FIREBASE = {
    initialized: false,
    app: null,
    auth: null,
    db: null,
    ready: null,
    authService: {},
    dbService: {}
  };

  window.CS_FIREBASE.ready = (async function () {
    try {
      // Dynamic imports from Firebase Web CDN modules
      const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
      const {
        getAuth,
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
        signOut,
        onAuthStateChanged
      } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
      const {
        getFirestore,
        doc,
        setDoc,
        getDoc,
        collection,
        query,
        where,
        getDocs,
        addDoc
      } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");

      // Initialise App, Auth, and Firestore
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);

      // Expose instances
      window.CS_FIREBASE.app = app;
      window.CS_FIREBASE.auth = auth;
      window.CS_FIREBASE.db = db;
      window.CS_FIREBASE.initialized = true;

      // Bind Auth wrappers
      window.CS_FIREBASE.authService = {
        login: (email, password) => signInWithEmailAndPassword(auth, email, password),
        signup: (email, password) => createUserWithEmailAndPassword(auth, email, password),
        logout: () => signOut(auth),
        onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback)
      };

      // Bind DB wrappers
      window.CS_FIREBASE.dbService = {
        setDoc: (path, data) => setDoc(doc(db, path), data),
        getDoc: (path) => getDoc(doc(db, path)),
        addDoc: (colPath, data) => addDoc(collection(db, colPath), data),
        getDocs: (colPath, ...queryConstraints) => getDocs(query(collection(db, colPath), ...queryConstraints)),
        doc: (path) => doc(db, path),
        collection: (colPath) => collection(db, colPath),
        where: where,
        query: query
      };

      console.log("🔒 CyberShield: Firebase initialized successfully.");
      return { app, auth, db };
    } catch (error) {
      console.error("❌ CyberShield: Firebase initialization failed:", error);
      throw error;
    }
  })();
})();
