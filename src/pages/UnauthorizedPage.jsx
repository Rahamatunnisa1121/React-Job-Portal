import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const UnauthorizedPage = () => {
  return (
    <section className='text-center flex flex-col justify-center items-center h-96'>
      <FaExclamationTriangle className='text-red-400 text-6xl mb-4' />
      <h1 className='text-6xl font-bold mb-4'>403 Unauthorized</h1>
      <p className='text-xl mb-5'>You don't have permission to access this page</p>
      <div className='flex space-x-4'>
        <Link
          to='/'
          className='text-white bg-indigo-700 hover:bg-indigo-900 rounded-md px-3 py-2 mt-4'
        >
          Go Home
        </Link>
        <Link
          to='/login'
          className='text-indigo-700 bg-white border border-indigo-700 hover:bg-indigo-50 rounded-md px-3 py-2 mt-4'
        >
          Login
        </Link>
      </div>
    </section>
  );
};

export default UnauthorizedPage;