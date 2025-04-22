import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const SignIn = () => {
  const { signInWithGoogle, checkIfUserExists } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      const result = await signInWithGoogle();
      const userExists = await checkIfUserExists(result.user.uid);

      if (userExists) {
        navigate('/home');
      } else {
        navigate('/profile-info');
      }
    } catch (error) {
      setError('Failed to sign in with Google');
      console.error(error);
    }
  };


  return (
    <div className="h-screen bg-[#020222] flex justify-center items-center relative">
      <div className="bg-[#E2E2FE] w-[756px] h-[422px] opacity-[25%] rounded-[8px]" />
      <div className="bg-[#848DF9] w-[700px] h-[371px] rounded-[8px] absolute flex items-center justify-center shadow-md shadow-[#63636c]">
        <div>
          <img src="/bgLeft.svg" className="absolute left-0 top-0" />
          <img src="/bgRight.svg" className="absolute right-0 top-0" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-8">
            <img src="/Logo.svg" alt="Logo" />
          </div>
          <p className="font-bold text-[#E2E2FE] text-[28px] mb-8">CollabDev</p>
          <button className="w-[301px] h-[58px] bg-[#020222] rounded-[30px] border-[#E2E2FE] border-2 flex gap-3 p-2 items-center justify-center drop-shadow-xl" onClick={handleGoogleSignIn}>
            <img src="/google.svg" alt="google" />
            <p className="font-bold text-[#E2E2FE] text-[18px] " >Continue with Google</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;