
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideLockKeyholeOpen } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { API_URL } from "../../../config/sourceConfig";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const RecoveryForm = () => {
    const { toast } = useToast();
    const [error, setError] = useState('');
    const navigate = useNavigate();
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
                    // console.log("true");
                } else {
                    // console.log("false");
                }
            })
            .catch((err) => {
                // console.log("Error", err);
            });
    }

    useEffect(() => {
        onChecker();
    }, []);

    const [formError, setFormError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate passwords
        if (credentials.password !== credentials.confirmpassword) {
            setFormError('Passwords do not match.');
            // console.log('Passwords do not match.');
            return;
        }

        try {
            const response = await axios.post(
                API_URL + "/hots_auth/change_pass_forgot", 
                { pswd: credentials.password }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast({
                title: 'Success!',
                description: response.data.message,
                duration: 9000,
            });

            navigate('/');
            setCredentials({
                password: '',
                confirmpassword: ''
            });
            setFormError('');
        } catch (err: any) {
            toast({
                title: "Error!",
                description: err.response?.data?.message || 'An error occurred',
                variant: "destructive",
                duration: 6000,
            });
            // console.log(err);
        }
    };

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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <strong>Create New Password</strong>
                            {formError && <small className="text-red-500 text-xs block mt-1">{formError}</small>}
                        </div>
                        
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your new password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            required
                        />

                        <Input
                            id="confirmpassword"
                            type="password"
                            placeholder="Confirm your new password"
                            value={credentials.confirmpassword}
                            onChange={(e) => setCredentials({ ...credentials, confirmpassword: e.target.value })}
                            required
                        />

                        <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800">
                            Reset Password
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>For technical support, contact IT Department</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RecoveryForm;
