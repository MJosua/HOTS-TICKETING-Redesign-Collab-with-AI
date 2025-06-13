import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { API_URL } from "../../../config/sourceConfig"
import { useState } from "react";

const Loginform = ({
    showPassword,
    setShowPassword,
    credentials,
    setCredentials,
    setForgotToggle,
    setLockedAccount,

}) => {


    const { toast } = useToast();

    const [error, setError] = useState('');


    const HandleLogin = async (e, uid, asin) => {
        e.preventDefault()

        try {
            // Perform the POST request to the login API
            const res = await axios.post(`${API_URL}/hots_auth/login`, {
                uid,  // Shorthand property name
                asin  // Shorthand property name
            });
            // Check if login was successful
            if (res.data.success) {
                // Store token in localStorage
                localStorage.setItem("tokek", res.data.tokek); // Ensure token storage is appropriate
                // Optionally, remove the token from the response object
                delete res.data.tokek;
                // Check if userData exists and is an array with at least one element
                const userData = res.data.userData;

                // Dispatch a Redux action with user data
                if (userData) {
                    // dispatch({
                    //     type: "LOGIN_SUCCESS",
                    //     payload: userData,
                    // });

                    // Return success object with user details
                    toast({
                        title: "Login Successful",
                        description: "Welcome back to HOTS",
                        variant: "default", // or "destructive"
                    });
                    setError("")
                    // navigate("/service-catalog");

                } else {
                    // Return failure object if userData is missing or invalid
                    toast({
                        title: "Login Un-Successful",
                        variant: "error", // or "destructive"
                        duration: 3000,
                    });

                }
            } else {


                if (res.data.message.includes("Too many login attempt")) {
                    setLockedAccount(true);
                    toast({
                        title: "Account Locked",
                        description: res.data.message,
                        variant: "error", // or "destructive"
                        duration: 3000,
                    });
                } else {
                    setError(res.data.message);
                    toast({
                        title: "Account Locked",
                        description: res.data.message,
                        variant: "error", // or "destructive"
                        duration: 3000,
                    });
                }
                setError(res.data.message);


            }
        } catch (error) {
            // Handle errors (e.g., network issues)
            console.error('Login error:', error);
            toast({
                title: "Login Un-Successful",
                description: `${error.message}`,
                variant: "error", // or "destructive"
                duration: 3000,
            });
            setError("");

            // Return failure object with error message


        }
    };

    return (

        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">HOTS</span>
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
                    <p className="text-gray-600 mt-2">PT INDOFOOD CBP SUKSES MAKMUR</p>
                    <p className="text-sm text-gray-500">Helpdesk and Operational Tracking System</p>
                </div>
            </CardHeader>
            <CardContent>
            <form onSubmit={
                    (e) => {
                        HandleLogin(e, credentials.username, credentials.password)
                    }} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username / Employee ID</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                required
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <Button type="submit"
                        className="w-full bg-blue-900 hover:bg-blue-800">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                    </Button>
                </form>

                <div className="mt-1 text-center text-sm text-gray-500">
                    <a href=""
                        onClick={(e) => {
                            e.preventDefault();
                            setForgotToggle(true);
                        }}
                        className=" hover:underline hover:text-blue-900 ">Forget Password</a>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>For technical support, contact IT Department</p>
                </div>
            </CardContent>
        </Card >
    )
}

export default Loginform;

