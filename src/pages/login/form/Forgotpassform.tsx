
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail } from 'lucide-react';
import { ForgotpassformProps } from '@/types/loginTypes';

const Forgotpassform = ({ setForgotToggle, setRecoveryToggle }: ForgotpassformProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the reset email
    setRecoveryToggle(true);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password</CardTitle>
          <p className="text-sm text-gray-500">
            Enter your email to receive password reset instructions
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <Button type="submit" className="w-full">
            Send Reset Instructions
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={() => setForgotToggle(false)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Forgotpassform;
