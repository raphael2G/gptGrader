"use client";
import { useContext, createContext, useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from "@firebase/auth";
import { FireAuth } from "@/firebase/firebase";
import { Types } from "mongoose";
import { useCreateUser } from "@/hooks/queries/useUsers";


interface AuthContext {
  user: User | null;
  googleSignIn: () => Promise<void>; // Make these async
  logOut: () => Promise<void>;
  loading: boolean;
}


interface User {
  // Essential Firebase Auth fields
  uid: string;
  email: string | null;
  displayName: string | null;
  
  // MongoDB ID
  _id: Types.ObjectId;
}

// Separate the initial context value
const INITIAL_CONTEXT: AuthContext = {
  user: null,
  googleSignIn: async () => {},
  logOut: async () => {},
  loading: true,
};

const AuthContext = createContext<AuthContext>(INITIAL_CONTEXT);

export const AuthContextProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { mutateAsync: createUser, isPending: isCreatingUser } = useCreateUser();

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(FireAuth, provider);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(FireAuth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Function to get MongoDB _id from Firebase UID
  const fetchOrCreateMongoId = async (firebaseUser: Omit<User, "_id">) => {
    try {

      // first, look up to see if a user exists
      const lookupResponse = await fetch(`/api/users/lookup?firebaseUid=${firebaseUser.uid}`);
      const lookupData = await lookupResponse.json()
      
      // If user exists, return their MongoDB _id
      if (lookupResponse.ok && lookupData.data) {
        return lookupData.data._id;
      }

      // otherwise, create a new user
      const newUser = await createUser({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || ""
      });

      return newUser._id
    } catch (error) {
      console.error('Error fetching MongoDB _id:', error);
      return null;
    }
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FireAuth, async (currentUser) => {
      try {
        if (currentUser) {
          setLoading(true);
          const mongoId = await fetchOrCreateMongoId(currentUser)
          setUser({...currentUser, _id: mongoId});
        } else {
          setUser(null);
        } 
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading){
    return <div>loading...</div>
  }



  return (
    
    <AuthContext.Provider value={{ user, googleSignIn, logOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};



export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('UserAuth must be used within an AuthContextProvider');
  }
  return context;
};
