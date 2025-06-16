
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Eye, EyeOff, LockKeyhole } from 'lucide-react';

interface LockedaccountProps {
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  credentials: {
    username: string;
    password: string;
  };
  setCredentials: (credentials: { username: string; password: string }) => void;
  setForgotToggle: (toggle: boolean) => void;
  setLockedAccount: (locked: boolean) => void;
}

const Lockedaccount = ({
    showPassword,
    setShowPassword,
    credentials,
    setCredentials,
    setForgotToggle,
    setLockedAccount
}: LockedaccountProps) => {
    return (
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg"><LockKeyhole /></span>
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Your Account is Locked</CardTitle>
                    <p className="text-sm text-gray-500">
                        You have no remaining attempts.
                        <br></br>
                        Please go to the forget page to reset your password
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mt-1 text-center text-sm text-gray-500">
                    <a href=""
                        onClick={(e) => {
                            e.preventDefault();
                            setForgotToggle(false);
                            setLockedAccount(false);
                        }}
                        className=" hover:underline hover:text-blue-900 ">Back to Login</a>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>For technical support, contact IT Department</p>
                </div>
            </CardContent>
        </Card>
    )
}

export default Lockedaccount;
