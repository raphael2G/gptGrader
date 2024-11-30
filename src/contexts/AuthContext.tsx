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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FireAuth, (currentUser) => {
      console.log(currentUser);
      if (currentUser) {
        console.log("User is logged in");
        setUser(currentUser);
      } else {
        setUser(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();


  }, [user]);



  const isUserLoggedIn = () => {
    return user !== null;
  }


  return (
    <AuthContext.Provider value={{ user, googleSignIn, logOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};




