
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from './useAppDispatch';
import axios from 'axios';
import { API_URL } from '../config/sourceConfig';

interface UseAuthCheckProps {
  userToken2?: string;
  setIsTokenExpiredModalOpen: (open: boolean) => void;
}

export const useAuthCheck = ({ userToken2, setIsTokenExpiredModalOpen }: UseAuthCheckProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userToken = localStorage.getItem('tokek');

  useEffect(() => {
    const keepLogin = async () => {
      if (userToken) {
        try {
          const res = await axios.get(`${API_URL}/hots_auth/keepLogin`, {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          });

          localStorage.setItem("tokek", res.data.tokek);
          const userData = res.data.userData;

          if (userData.uid) {
            // Put user data to payload:
            dispatch({
              type: "LOGIN_SUCCESS",
              payload: userData,
            });
          }
        } catch (err) {
          setIsTokenExpiredModalOpen(true);
        }
      } else {
        // navigate('./');
      }
    };

    keepLogin();
  }, [dispatch, userToken, setIsTokenExpiredModalOpen]);
};
