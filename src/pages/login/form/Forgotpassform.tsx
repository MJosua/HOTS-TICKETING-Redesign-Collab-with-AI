import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Eye, EyeOff } from 'lucide-react';

const Forgotpassform = ({
    showPassword,
    setShowPassword,
    credentials,
    setCredentials,
    handleLogin,
    setForgotToggle
}) => {
    return (

        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">HOTS</span>
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password Procedure</CardTitle>
                    <p className="text-gray-600 mt-2">PT INDOFOOD CBP SUKSES MAKMUR</p>
                    <p className="text-sm text-gray-500">Helpdesk and Operational Tracking System</p>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
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
                        Sent Confirmation Email
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

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>For technical support, contact IT Department</p>
                </div>
            </CardContent>
        </Card>
    )
}

export default Forgotpassform;

