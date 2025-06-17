import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff, X, Lock, User, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { loginUser } from "@/store/slices/authSlice";

interface TokenExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToLogin: () => void;
  username: string;
}

const TokenExpiredModal: React.FC<TokenExpiredModalProps> = ({
  isOpen,
  onClose,
  onNavigateToLogin,
  username
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { isLoading, user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);
  
  // Use ref to prevent multiple logout calls
  const hasNavigatedRef = useRef(false);

  const maxAttempts = 3;
  const remainingAttempts = maxAttempts - failedAttempts;

  // Only redirect to login once when user becomes completely unauthenticated
  useEffect(() => {
    if (!isAuthenticated && !user && !isProcessingLogin && !isLoading && !hasNavigatedRef.current) {
      console.log('User is completely logged out, redirecting to login');
      hasNavigatedRef.current = true;
      onNavigateToLogin();
    }
  }, [isAuthenticated, user, isProcessingLogin, isLoading, onNavigateToLogin]);

  // Reset navigation flag when modal opens
  useEffect(() => {
    if (isOpen) {
      hasNavigatedRef.current = false;
    }
  }, [isOpen]);

  const handleClose = () => {
    // Reset form state
    setPassword('');
    setValidationError('');
    setShowPassword(false);
    setFailedAttempts(0);
    setIsAccountLocked(false);
    setIsProcessingLogin(false);
    
    // Prevent multiple calls
    if (!hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      onNavigateToLogin();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setValidationError('Password is required');
      return;
    }

    setValidationError('');
    setIsProcessingLogin(true);

    // Use username prop as fallback if user data is cleared
    const loginUsername = user?.uid || user?.username || username;
    
    console.log('Attempting re-authentication for:', loginUsername);

    try {
      await dispatch(loginUser({
        username: loginUsername,
        password: password,
        isReauthentication: true,
      })).unwrap();

      toast({
        title: "Authentication Successful",
        description: "Your session has been renewed",
      });

      // Reset states on successful login
      setPassword('');
      setValidationError('');
      setShowPassword(false);
      setFailedAttempts(0);
      setIsAccountLocked(false);
      setIsProcessingLogin(false);
      onClose();
    } catch (error) {
      console.log('Re-authentication failed:', error);
      setIsProcessingLogin(false);
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      if (newFailedAttempts >= maxAttempts) {
        setIsAccountLocked(true);
        toast({
          title: "Account Locked",
          description: "Too many failed attempts. Please end session and contact IT support.",
          variant: "destructive",
          duration: 6000,
        });
        setValidationError('Account locked due to multiple failed attempts');
      } else {
        toast({
          title: "Authentication Failed",
          description: `Invalid password. ${maxAttempts - newFailedAttempts} attempt(s) remaining.`,
          variant: "destructive",
        });
        setValidationError(`Invalid password. ${maxAttempts - newFailedAttempts} attempt(s) remaining.`);
      }
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (validationError && !isAccountLocked) {
      setValidationError('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <div className="absolute right-4 top-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <DialogHeader className="text-center space-y-4 pb-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
            isAccountLocked 
              ? "bg-gradient-to-br from-red-500 to-red-600" 
              : "bg-gradient-to-br from-orange-400 to-red-500"
          }`}>
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {isAccountLocked ? "Account Locked" : "Session Expired"}
            </DialogTitle>
            <p className="text-gray-600 mt-2">
              {isAccountLocked 
                ? "Your account has been locked due to multiple failed login attempts."
                : "Your session has expired. Please re-enter your password to continue."
              }
            </p>
          </div>
        </DialogHeader>

        {/* Show failed attempts warning */}
        {failedAttempts > 0 && !isAccountLocked && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before account lock
            </p>
          </div>
        )}

        {/* Show account locked warning */}
        {isAccountLocked && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800">
              Account locked. Please contact IT support or use the forgot password option.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Input - only show if not locked */}
          {!isAccountLocked && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  disabled={isLoading || isProcessingLogin}
                  className={`pr-10 ${validationError ? "border-red-500" : ""}`}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isProcessingLogin}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {validationError && (
                <p className="text-sm text-red-600">{validationError}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-4">
            {!isAccountLocked && (
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5"
                disabled={isLoading || isProcessingLogin}
              >
                {isLoading || isProcessingLogin ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Continue Session
                  </>
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading || isProcessingLogin}
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              End Session & Logout
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          <p>
            {isAccountLocked 
              ? "Contact IT support for assistance with account unlock"
              : "For security, please verify your identity to continue"
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenExpiredModal;
