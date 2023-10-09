import React, { createContext, useContext, useState } from "react";

// Create the context
const AuthContext = createContext();

// Create a custom hook to access the context
export function useAuth() {
    return useContext(AuthContext);
}

// Create the provider component
export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // You can include other authentication-related state and functions here

    const logIn = () => {
        // Implement your login logic here
        setIsLoggedIn(true);
    };

    const logOut = () => {
        // Implement your logout logic here
        setIsLoggedIn(false);
    };

    // Pass the context values to the provider
    const value = {
        isLoggedIn,
        logIn,
        logOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
