
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { loginUser, clearError } from "@/store/slices/authSlice";
import { validateLoginForm } from "@/utils/validation";

interface LoginformProps {
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

const Loginform = ({
  showPassword,
  setShowPassword,
  credentials,
  setCredentials,
  setForgotToggle,
  setLockedAccount,
}: LoginformProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { isLoading, error, isAuthenticated, isLocked, loginAttempts } = useAppSelector(
    (state) => state.auth
  );

  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  // Clear error when component mounts or credentials change
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [credentials.username, credentials.password, dispatch]);

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      toast({
        title: "Login Successful",
        description: "Welcome back to HOTS",
      });
      navigate("/service-catalog");
    }
  }, [isAuthenticated, isLoading, navigate, toast]);

  // Handle account lock
  useEffect(() => {
    if (isLocked) {
      setLockedAccount(true);
    }
  }, [isLocked, setLockedAccount]);

  // Handle login errors
  useEffect(() => {
    if (error && !isLoading) {
      if (error.includes("Too many login attempt")) {
        toast({
          title: "Account Locked",
          description: error,
          variant: "destructive",
          duration: 5000,
        });
        setLockedAccount(true);
      } else {
        toast({
          title: "Login Failed",
          description: error,
          variant: "destructive",
          duration: 4000,
        });
      }
    }
  }, [error, isLoading, toast, setLockedAccount]);

  const handleInputChange = (field: 'username' | 'password', value: string) => {
    setCredentials({ ...credentials, [field]: value });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateLoginForm(credentials.username, credentials.password);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Clear any existing validation errors
    setValidationErrors({});

    // Dispatch login action
    try {
      await dispatch(loginUser({
        username: credentials.username.trim(),
        password: credentials.password,
      })).unwrap();
    } catch (err) {
      // Error handling is done in useEffect
      console.error('Login failed:', err);
    }
  };

  const remainingAttempts = Math.max(0, 5 - loginAttempts);

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
        {/* Show login attempts warning */}
        {loginAttempts > 0 && !isLocked && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username / Employee ID</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={credentials.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              disabled={isLoading}
              className={validationErrors.username ? "border-red-500" : ""}
              required
            />
            {validationErrors.username && (
              <p className="text-sm text-red-600">{validationErrors.username}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={isLoading}
                className={validationErrors.password ? "border-red-500" : ""}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {validationErrors.password && (
              <p className="text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-800"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <button
            onClick={(e) => {
              e.preventDefault();
              setForgotToggle(true);
            }}
            className="hover:underline hover:text-blue-900"
            disabled={isLoading}
          >
            Forgot Password?
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>For technical support, contact IT Department</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Loginform;
