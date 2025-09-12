import JobListings from '../components/JobListings';
import { validateEmail } from '../utils/validateEmail';

const JobsPage = () => {
  return (
    <section className='bg-blue-50 px-4 py-6'>
      <JobListings />
    </section>
  );
};
export default JobsPage;