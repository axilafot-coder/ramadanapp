import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { LucideIcon } from 'lucide-react'; // Example import for icons

// Firebase configuration
const firebaseConfig = {
  // Your Firebase config here
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

function App() {
  const [user, setUser] = useState(null);
  const [prayerData, setPrayerData] = useState([]);
  const [quranReading, setQuranReading] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      setUser(user);
      if (user) {
        fetchPrayerData();
        fetchQuranReading();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPrayerData = async () => {
    const data = await db.collection('prayers').get();
    setPrayerData(data.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchQuranReading = async () => {
    const data = await db.collection('quranReading').get();
    setQuranReading(data.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleLogin = async () => {
    // Firebase authentication logic here
  };

  const handleLogout = async () => {
    await firebase.auth().signOut();
    setUser(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Ramadan Pro</h1>
      {user ? (
        <> 
          <div>
            <h2 className="text-xl">Welcome, {user.displayName}</h2>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div>
            <h3>Prayer Tracker</h3>
            {/* Display the prayerData with Tailwind styles */}
          </div>
          <div>
            <h3>Quran Reading Tracker</h3>
            {/* Display the quranReading with Tailwind styles */}
          </div>
        </>
      ) : (
        <button onClick={handleLogin}>Login with Firebase</button>
      )}
    </div>
  );
}

export default App;