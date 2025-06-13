
import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import Loginform from './form/loginform';
import Forgotpassform from './form/forgotpassform';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const navigate = useNavigate();

  

  const [forgotToggle, setForgotToggle] = useState(false)
  const [lockedAccount, setLockedAccount] = useState('');

  


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-0 to-blue-100 flex items-center justify-center p-4">
      {!forgotToggle &&
        <Loginform
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          credentials={credentials}
          setCredentials={setCredentials}
          setForgotToggle={setForgotToggle}
          setLockedAccount={setLockedAccount}
        />
      }


      {forgotToggle &&
        <Forgotpassform
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          credentials={credentials}
          setCredentials={setCredentials}
          setForgotToggle={setForgotToggle}
        />
      }
    </div>
  );
};

export default Login;
