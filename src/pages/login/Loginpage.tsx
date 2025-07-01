
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Loginform from './form/Loginform';
import Forgotpassform from './form/Forgotpassform';
import Recoveryform from './form/Recoveryform';
import Lockedaccount from './form/Lockedaccount';

const Loginpage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [forgotToggle, setForgotToggle] = useState(false);
  const [recoveryToggle, setRecoveryToggle] = useState(false);
  const [lockedAccount, setLockedAccount] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {lockedAccount ? (
            <Lockedaccount 
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              credentials={credentials}
              setCredentials={setCredentials}
              setLockedAccount={setLockedAccount}
              setForgotToggle={setForgotToggle}
            />
          ) : recoveryToggle ? (
            <Recoveryform 
              setRecoveryToggle={setRecoveryToggle}
              setForgotToggle={setForgotToggle}
            />
          ) : forgotToggle ? (
            <Forgotpassform 
              setForgotToggle={setForgotToggle}
              setRecoveryToggle={setRecoveryToggle}
            />
          ) : (
            <Loginform 
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              credentials={credentials}
              setCredentials={setCredentials}
              setForgotToggle={setForgotToggle}
              setLockedAccount={setLockedAccount}
            />
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Loginpage;
