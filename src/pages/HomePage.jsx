import Hero from "../components/Hero";
import HomeCards from "../components/HomeCards";
import HomepageFilters from "../components/HomepageFilters"; 
import JobListings from "../components/JobListings";
import ViewAllJobs from "../components/ViewAllJobs";

const HomePage = () => {
  return (
    <>
      <Hero />
      <HomepageFilters />
      <HomeCards />
      <JobListings isHome={true} />
      <ViewAllJobs />
    </>
  );
};

export default HomePage;
