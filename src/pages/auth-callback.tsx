import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { authApi } from '@/store/api/authApi';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch: any = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Temporarily set the token so the api request works
      dispatch(setCredentials({ token, user: null }));

      // Fetch the user profile using the token
      dispatch(authApi.endpoints.getProfile.initiate(undefined))
        .unwrap()
        .then((user: any) => {
          // Update credentials with the full user object
          dispatch(setCredentials({ token, user }));

          // Check roles and navigate accordingly
          navigate('/');
        })
        .catch((error: any) => {
          console.error('Failed to fetch user profile:', error);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        <h2 className="text-xl font-medium text-gray-700">Authenticating...</h2>
      </div>
    </div>
  );
}
