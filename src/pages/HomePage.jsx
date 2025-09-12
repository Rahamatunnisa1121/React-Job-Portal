import Hero from '../components/Hero';
import HomeCards from '../components/HomeCards';
import HomepageFilters from '../components/HomepageFilters'; // Add this import
import JobListings from '../components/JobListings';
import ViewAllJobs from '../components/ViewAllJobs';
import { validateEmail } from '../utils/validateEmail';

const HomePage = () => {
  return (
    <>
      <Hero />
      <HomeCards />
      <HomepageFilters />  {/* Add this line */}
      <JobListings isHome={true} />
      <ViewAllJobs />
    </>
  );
};

export default HomePage;