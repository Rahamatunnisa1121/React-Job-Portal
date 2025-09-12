import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DeveloperProfilePage from './DeveloperProfilePage';
import EmployerProfilePage from './EmployerProfilePage';

const ProfileRoute = () => {
  const { user } = useContext(AuthContext);

  console.log('User in ProfileRoute:', user); // Debug

  if (!user) return <div>Not logged in</div>;
  if (user.role === 'developer') return <DeveloperProfilePage />;
  if (user.role === 'employer') return <EmployerProfilePage />;
  return <div>Profile not available for this role.</div>;
};

export default ProfileRoute;