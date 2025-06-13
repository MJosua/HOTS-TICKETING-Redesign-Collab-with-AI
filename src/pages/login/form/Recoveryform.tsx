import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, LockKeyhole, LockKeyholeOpenIcon, LucideLockKeyholeOpen } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { API_URL } from "../../../config/sourceConfig";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Lockedaccount from "./lockedaccount";

const RecoveryForm = ({
}) => {
    const { toast } = useToast();
    const [error, setError] = useState('');

    const params = useParams();
    let token = params.token;

    const [credentials, setCredentials] = useState({
        password: '',
        confirmpassword: ''
    });


    const onChecker = async () => {
        await axios.get(
            API_URL + "/hots_auth/verify-token", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
        )
            .then((res) => {
                if (res.data.success) {
                    // setValid(true);
                    // setLoading(false);

                    console.log("true");
                } else {
                    // setValid(true);
                    console.log("false");
                    // setLoading(true);

                }
            })
            .catch((err) => {
                // setValid(false);
                // setLoading(false);

                console.log("Error", err);
            });
    }

    useEffect(() => {
        onChecker();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-0 to-blue-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg"><LucideLockKeyholeOpen /></span>
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">Password Recovery</CardTitle>
                        <p className="text-gray-600 mt-2">PT INDOFOOD CBP SUKSES MAKMUR</p>
                        <p className="text-sm text-gray-500">Helpdesk and Operational Tracking System</p>
                    </div>
                </CardHeader>

                <CardContent>


                    <>

                        <form onSubmit="" className="space-y-4">

                            <Input
                                id="username"
                                type="password"
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                required
                            />


                            <Input
                                id="username"
                                type="password"
                                placeholder="Confirm your password"
                                value={credentials.confirmpassword}
                                onChange={(e) => setCredentials({ ...credentials, confirmpassword: e.target.value })}
                                required
                            />


                            <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800">

                                Sent Reset Email
                            </Button>


                        </form>

                    </>




                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>For technical support, contact IT Department</p>
                    </div>
                </CardContent>

            </Card>
        </div>
    );
};

export default RecoveryForm;
