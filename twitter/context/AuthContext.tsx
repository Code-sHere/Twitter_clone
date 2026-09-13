"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { auth } from "@/context/firbase";
import axiosInstance from "../lib/axiosInstance";

interface User {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  joinedDate?: string;
  website?: string;
  location?: string;
  isTemporaryPassword?: boolean;
}

interface AuthContextType {
  user: User | null;

  login: (
    identifier: string,
    password: string
  ) => Promise<{
    requiresOtp: boolean;
    userId?: string;
    user?: User;
  }>;

  signup: (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => Promise<void>;

  updateProfile: (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => Promise<void>;

  logout: () => Promise<void>;

  isLoading: boolean;

  googlesignin: () => Promise<void>;

  verifyOtp: (
    userId: string,
    otp: string
  ) => Promise<User>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("twitter-user");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error(
        "Failed to restore user:",
        error
      );

      localStorage.removeItem("twitter-user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    identifier: string,
    password: string
  ) => {
    try {
      setIsLoading(true);

      const res = await axiosInstance.post(
        "/login",
        {
          identifier: identifier.trim(),
          password,
        }
      );

      if (!res.data?.success) {
        throw new Error(
          res.data?.message || "Login failed"
        );
      }


      if (res.data.requiresOtp) {
        return {
          requiresOtp: true,
          userId: res.data.userId
        }
      }

      const loggedInUser: User =
        res.data.user;

      setUser(loggedInUser);

      localStorage.setItem(
        "twitter-user",
        JSON.stringify(loggedInUser)
      );

      return {
        requiresOtp: false,
        user: loggedInUser,
      };

    } catch (error: any) {
      console.error(
        "Login Error:",
        error
      );

      throw new Error(
        error?.response?.data?.message ||
        error?.message ||
        "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (
    userId: string,
    otp: string
  ) => {
    try {
      setIsLoading(true);

      const res = await axiosInstance.post(
        "/verift-otp",
        {
          userId,
          otp
        }
      );

      if (!res.data?.success) {
        throw new Error(
          res.data?.message ||
          "Verification failed"
        );
      }

      const loggedInUser: User =
        res.data.user;

      setUser(loggedInUser);

      localStorage.setItem(
        "twitter-user",
        JSON.stringify(loggedInUser)
      );

      return loggedInUser;

    } catch (error) {
      console.error("OTP Verification Error:", error);

      throw new Error(
        error?.response?.data?.message ||
        error?.message ||
        "OTP verification failed"
      );
    }
    finally {
      setIsLoading(false);
    }
  }

  const signup = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => {
    try {
      setIsLoading(true);

      const res = await axiosInstance.post(
        "/register",
        {
          email: email.trim(),
          password,
          username: username.trim(),
          displayName: displayName.trim(),
        }
      );

      if (!res.data?.success) {
        throw new Error(
          res.data?.message ||
          "Registration failed"
        );
      }

      const newUser: User =
        res.data.user;

      setUser(newUser);

      localStorage.setItem(
        "twitter-user",
        JSON.stringify(newUser)
      );
    } catch (error: any) {
      console.error(
        "Signup Error:",
        error
      );

      throw new Error(
        error?.response?.data?.message ||
        error?.message ||
        "Signup failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const googlesignin = async () => {
    try {
      setIsLoading(true);

      const provider =
        new GoogleAuthProvider();

      const result =
        await signInWithPopup(
          auth,
          provider
        );

      const firebaseUser =
        result.user;

      if (!firebaseUser.email) {
        throw new Error(
          "Google account email not found"
        );
      }

      let userData: User | null = null;

      try {
        const res =
          await axiosInstance.get(
            "/loggedinuser",
            {
              params: {
                email:
                  firebaseUser.email,
              },
            }
          );

        if (res.data) {
          userData = res.data;
        }
      } catch (error) {
        userData = null;
      }

      if (!userData) {
        const googleUser = {
          username:
            firebaseUser.email.split("@")[0],

          displayName:
            firebaseUser.displayName ||
            "User",

          avatar:
            firebaseUser.photoURL ||
            "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400",

          email:
            firebaseUser.email,
        };

        const registerRes =
          await axiosInstance.post(
            "/google-user",
            googleUser
          );

        if (!registerRes.data?.success) {
          throw new Error(
            registerRes.data?.message ||
            "Google registration failed"
          );
        }

        userData =
          registerRes.data.user;
      }

      if (!userData) {
        throw new Error(
          "Google login failed"
        );
      }

      setUser(userData);

      localStorage.setItem(
        "twitter-user",
        JSON.stringify(userData)
      );
    } catch (error: any) {
      console.error(
        "Google Sign-In Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
        error?.message ||
        "Google login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(
        "Logout Error:",
        error
      );
    } finally {
      setUser(null);

      localStorage.removeItem(
        "twitter-user"
      );
    }
  };

  const updateProfile = async (
    profileData: {
      displayName: string;
      bio: string;
      location: string;
      website: string;
      avatar: string;
    }
  ) => {
    if (!user) {
      throw new Error(
        "User is not logged in"
      );
    }

    try {
      setIsLoading(true);

      const res =
        await axiosInstance.patch(
          `/userupdate/${user.email}`,
          profileData
        );

      const updatedUser: User =
        res.data;

      setUser(updatedUser);

      localStorage.setItem(
        "twitter-user",
        JSON.stringify(updatedUser)
      );
    } catch (error: any) {
      console.error(
        "Update Profile Error:",
        error
      );

      throw new Error(
        error?.response?.data?.message ||
        error?.message ||
        "Profile update failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        updateProfile,
        logout,
        verifyOtp,
        isLoading,
        googlesignin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};