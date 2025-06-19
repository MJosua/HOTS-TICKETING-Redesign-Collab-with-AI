import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, MailQuestion } from 'lucide-react';
import axios from "axios";
import { API_URL } from "../../../config/sourceConfig"
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ForgotpassformProps {
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  credentials: {
    username: string;
    password: string;
  };
  setCredentials: (credentials: { username: string; password: string }) => void;
  setForgotToggle: (toggle: boolean) => void;
}

const Forgotpassform = ({
    showPassword,
    setShowPassword,
    credentials,
    setCredentials,
    setForgotToggle,
}: ForgotpassformProps) => {
    const { toast } = useToast()
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [email, setEmail] = useState("");

    const maskEmail = (email: string) => {
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) {
            // If the local part of the email is too short, just return it as is
            return email;
        }
        // Mask the local part, keeping the first and last character visible
        const maskedLocalPart = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
        return `${maskedLocalPart}@${domain}`;
    };

    const handleForgotPassword = (e: React.FormEvent, uid: string) => {
        e.preventDefault()
        if (uid === '' || !uid || uid === undefined) {
            toast({
                title: "Oopsie!",
                description: `User ID can't be empty! `,
                duration: 6000, //in second
            })
        } else {
            axios.post(
                API_URL + "/hots_auth/forgot/", { uid }
            )
                .then((res) => {
                    if (!res.data.success) {
                        setError(res?.data?.message ?? "An error occurred");
                        setSuccess(false);
                    } else {
                        setSuccess(true)
                        setEmail(res?.data?.email ?? "An error occurred")
                    }
                })
                .catch((err) => {
                    toast({
                        title: "Oopsiee!",
                        description: 'Something bad just happend! Please try again!',
                        duration: 6000,
                        variant: "destructive",
                    });
                    // console.log(err)
                });
        }
    }

    return (
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg"><MailQuestion /></span>
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        {success ?
                            <>
                                Check Your Inbox
                            </>
                            :
                            <>
                                Forgot Password Procedure
                            </>
                        }
                    </CardTitle>

                    {success ?
                        <p className="text-gray-600 mt-2">
                            A Password reset link has been sent to the email address:
                            <br>
                            </br>
                            {maskEmail(email)}
                        </p>
                        :
                        <p className="text-gray-600 mt-2">
                            PT INDOFOOD CBP SUKSES MAKMUR
                        </p>

                    }

                    {!success && <p className="text-sm text-gray-500"> Helpdesk and Operational Tracking System </p>}
                </div>
            </CardHeader>

            <CardContent>
                {!success ?
                    <>
                        <form onSubmit={(e) => { handleForgotPassword(e, credentials.username) }} className="space-y-4">
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

                            <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800">
                                <LogIn className="w-4 h-4 mr-2" />
                                Send Reset Email
                            </Button>
                        </form>
                        <div className="mt-1 text-center text-sm text-gray-500">
                            <a href=""
                                onClick={(e) => {
                                    e.preventDefault();
                                    setForgotToggle(false);
                                }}
                                className=" hover:underline hover:text-blue-900 ">Back to Login</a>
                        </div>
                    </>
                    :
                    <div className="mt-0 text-center text-sm text-gray-500">
                        <a href=""
                            onClick={(e) => {
                                e.preventDefault();
                                setForgotToggle(false);
                            }}
                            className=" hover:underline hover:text-blue-900 ">Back To Login</a>
                    </div>
                }

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>For technical support, contact IT Department</p>
                </div>
            </CardContent>
        </Card >
    )
}

export default Forgotpassform;
