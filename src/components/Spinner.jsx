
import ClipLoader from "react-spinners/ClipLoader";

// override → A small CSS object to center the spinner with some margin.

// Spinner component → Takes a loading prop:

//  true → spinner spins.

// false → spinner stops.
const override = {
  display: 'block',
  margin: '100px auto',
};

const Spinner = ({ loading }) => {
  return (
    <ClipLoader
      color='#4338ca'
      loading={loading}
      cssOverride={override}
      size={150}
    />
  );
};
export default Spinner;
