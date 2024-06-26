import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";


export default function LogInForm() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [action, setAction] = useState("Sign in"); 
    const [loginFormData, setLoginFormData] = useState({
        username: "",
        password: "",
    });
    const [signupFormData, setSignupFormData] = useState({
        username: "",
        email: "",
        password: "",
        disabled: true
    });



    const handleChange = (event) => {
        const { name, value } = event.target;

        if (action === "Sign in") {
            setLoginFormData({ ...loginFormData, [name]: value });
        } else if (action === "Sign up") {
            setSignupFormData({ ...signupFormData, [name]: value });
        }
    }


    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            if (action === "Sign in") {
                const response = await axios.post('http://localhost:8000/login', loginFormData, { withCredentials: true, }); console.log('User logged in successfully:', response.data);
                const token = Cookies.get("some_value");
                navigate("/search")
            } else if (action === "Sign up") {
                const response = await axios.post('http://localhost:8000/register', signupFormData);
                console.log("User signed up successfully:", response.data);
            }
        } catch (error) {
            setError(error.response.data.detail);
            console.error('Error:', error);
        }
    }


    return (
        <>
            <div className="min-h-screen flex justify-center items-center">
                <div className="relative">
                    <div className="w-full flex justify-center mt-20 relative z-10">
                        <form className="" onSubmit={handleSubmit}>
                            <div className="flex items-center justify-center mb-4 gap-4">
                                <button onClick={() => { setAction("Sign in") }}
                                    className={action === "Sign in" ? " bg-blue-800 border border-gray-300 text-gray-900 w-32 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" : " bg-gray-50 border border-gray-300 text-gray-900 w-32 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"}
                                    type="button"
                                >
                                    Sign In
                                </button>
                                <button onClick={() => { setAction("Sign up") }}
                                    className={action === "Sign up" ? " bg-blue-800 border border-gray-300 text-gray-900 w-32 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" : " bg-white border border-gray-300 text-gray-900 w-32 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"}
                                    type="button"
                                >
                                    Sign Up
                                </button>
                            </div>
                            {action === "Sign in" ? (
                                <div>
                                    <div className="mb-4">

                                        <input onChange={handleChange}
                                            className="shadow appearance-none border rounded w-96 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="username"
                                            type="text"
                                            name="username"
                                            placeholder="Username"
                                            value={loginFormData.username}
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <input onChange={handleChange}
                                            className="shadow appearance-none border border-red-500 rounded w-96 py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                            id="password"
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            value={loginFormData.password}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-4">
                                        <input onChange={handleChange}
                                            className="shadow appearance-none border rounded w-96 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="email"
                                            type="text"
                                            name="email"
                                            placeholder="Email"
                                            value={signupFormData.email}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <input onChange={handleChange}
                                            className="shadow appearance-none border rounded w-96 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="username"
                                            type="text"
                                            name="username"
                                            placeholder="Username"
                                            value={signupFormData.username}
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <input onChange={handleChange}
                                            className="shadow appearance-none border border-red-500 rounded w-96 py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                            id="password"
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            value={signupFormData.password}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-center gap-4">
                                <button type='submit' className=" bg-blue-800 border border-gray-300 text-gray-900 w-44 h-10 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ">
                                    {action === "Sign in" ? "Sign In" : "Sign Up"}
                                </button>
                                <button type='submit' className=" bg-blue-800 border border-gray-300 text-gray-900 w-44 h-10 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ">
                                    Forgot passowrd?
                                </button>
                            </div>
                            {action === "Sign up" && error && <div className="text-red-500">Something went wrong</div>}
                        </form>

                    </div>
                    <div className="absolute inset-0 flex justify-center items-center z-0">
                        <div className="text-custom-size font-extrabold text-center text-gray-900 dark:text-white">
                            Movie Land
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}





