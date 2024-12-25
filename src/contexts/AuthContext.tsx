"use client";
import { useContext, createContext, useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from "@firebase/auth";
import { FireAuth } from "@/firebase/firebase";

interface AuthContext {
  user: any;
  googleSignIn: () => void;
  logOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContext>({
  user: null,
  googleSignIn: () => {},
  logOut: () => {},
  loading: true,
});

export const UserAuth = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(FireAuth, provider);
  };

  const logOut = () => {
    signOut(FireAuth);
  };

  // Function to get MongoDB _id from Firebase UID
  const fetchMongoId = async (firebaseUid: string) => {
    try {
      const response = await fetch(`/api/users/lookup?firebaseUid=${firebaseUid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      return data.data._id;
    } catch (error) {
      console.error('Error fetching MongoDB _id:', error);
      return null;
    }
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FireAuth, async (currentUser) => {
      if (currentUser) {
        setLoading(true);
        const mongoId = await fetchMongoId(currentUser.uid)
        setUser({...currentUser, _id: mongoId});
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, googleSignIn, logOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};




