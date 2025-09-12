// // import { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { toast } from 'react-toastify';

// // const AddJobPage = ({ addJobSubmit }) => {
// //   const [title, setTitle] = useState('');
// //   const [type, setType] = useState('Full-Time');
// //   const [location, setLocation] = useState('');
// //   const [description, setDescription] = useState('');
// //   const [salary, setSalary] = useState('Under $50K');
// //   const [companyName, setCompanyName] = useState('');
// //   const [companyDescription, setCompanyDescription] = useState('');
// //   const [contactEmail, setContactEmail] = useState('');
// //   const [contactPhone, setContactPhone] = useState('');
// //   const [emailError, setEmailError] = useState('');

// //   const navigate = useNavigate();

// //   const submitForm = (e) => {
// //     e.preventDefault();
// //     if (!validateEmail(contactEmail)) {
// //       setEmailError('Please enter a valid email address.');
// //       return;
// //     } else {
// //       setEmailError('');
// //     }
// //     const newJob = {
// //       title,
// //       type,
// //       location,
// //       description,
// //       salary,
// //       company: {
// //         name: companyName,
// //         description: companyDescription,
// //         contactEmail,
// //         contactPhone,
// //       },
// //     };
// //     addJobSubmit(newJob);
// //     toast.success('Job Added Successfully');
// //     return navigate('/jobs');
// //   };

// //   function validateEmail(email) {
// //     // Basic syntax check
// //     const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
// //     if (!emailRegex.test(email)) return false;
// //     if (email.includes('..')) return false; // No consecutive periods
// //     if (email.startsWith('.') || email.endsWith('.')) return false;
// //     if (email.includes(' ')) return false;
// //     return true;
// //   }
// // //   The email must match this pattern:

// // // Allowed characters before the "@" are letters, numbers, periods (.), underscores (_), and hyphens (-).
// // // There must be exactly one "@" symbol.
// // // The domain part (after "@") allows letters, numbers, and hyphens, with at least one period and a top-level domain of at least two letters.
// // // No consecutive periods ("..") are allowed.

// // // The email cannot start or end with a period.

// // // No spaces are allowed in the email.

// //   return (
// //     <section className='bg-indigo-50'>
// //       <div className='container m-auto max-w-2xl py-24'>
// //         <div className='bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0'>
// //           <form onSubmit={submitForm}>
// //             <h2 className='text-3xl text-center font-semibold mb-6'>Add Job</h2>

// //             <div className='mb-4'>
// //               <label
// //                 htmlFor='type'
// //                 className='block text-gray-700 font-bold mb-2'
// //               >
// //                 Job Type
// //               </label>
// //               <select
// //                 id='type'
// //                 name='type'
// //                 className='border rounded w-full py-2 px-3'
// //                 required
// //                 value={type}
// //                 onChange={(e) => setType(e.target.value)}
// //               >
// //                 <option value='Full-Time'>Full-Time</option>
// //                 <option value='Part-Time'>Part-Time</option>
// //                 <option value='Remote'>Remote</option>
// //                 <option value='Internship'>Internship</option>
// //               </select>
// //             </div>

// //             <div className='mb-4'>
// //               <label className='block text-gray-700 font-bold mb-2'>
// //                 Job Listing Name
// //               </label>
// //               <input
// //                 type='text'
// //                 id='title'
// //                 name='title'
// //                 className='border rounded w-full py-2 px-3 mb-2'
// //                 placeholder='eg. Beautiful Apartment In Miami'
// //                 required
// //                 value={title}
// //                 onChange={(e) => setTitle(e.target.value)}
// //               />
// //             </div>
// //             <div className='mb-4'>
// //               <label
// //                 htmlFor='description'
// //                 className='block text-gray-700 font-bold mb-2'
// //               >
// //                 Description
// //               </label>
// //               <textarea
// //                 id='description'
// //                 name='description'
// //                 className='border rounded w-full py-2 px-3'
// //                 rows='4'
// //                 placeholder='Add any job duties, expectations, requirements, etc'
// //                 value={description}
// //                 onChange={(e) => setDescription(e.target.value)}
// //               ></textarea>
// //             </div>

// //             <div className='mb-4'>
// //               <label
// //                 htmlFor='type'
// //                 className='block text-gray-700 font-bold mb-2'
// //               >
// //                 Salary
// //               </label>
// //               <select
// //                 id='salary'
// //                 name='salary'
// //                 className='border rounded w-full py-2 px-3'
// //                 required
// //                 value={salary}
// //                 onChange={(e) => setSalary(e.target.value)}
// //               >
// //                 <option value='Under $50K'>Under $50K</option>
// //                 <option value='$50K - 60K'>$50K - $60K</option>
// //                 <option value='$60K - 70K'>$60K - $70K</option>
// //                 <option value='$70K - 80K'>$70K - $80K</option>
// //                 <option value='$80K - 90K'>$80K - $90K</option>
// //                 <option value='$90K - 100K'>$90K - $100K</option>
// //                 <option value='$100K - 125K'>$100K - $125K</option>
// //                 <option value='$125K - 150K'>$125K - $150K</option>
// //                 <option value='$150K - 175K'>$150K - $175K</option>
// //                 <option value='$175K - 200K'>$175K - $200K</option>
// //                 <option value='Over $200K'>Over $200K</option>
// //               </select>
// //             </div>

// //             <div className='mb-4'>
// //               <label className='block text-gray-700 font-bold mb-2'>
// //                 Location
// //               </label>
// //               <input
// //                 type='text'
// //                 id='location'
// //                 name='location'
// //                 className='border rounded w-full py-2 px-3 mb-2'
// //                 placeholder='Company Location'
// //                 required
// //                 value={location}
// //                 onChange={(e) => setLocation(e.target.value)}
// //               />
// //             </div>

// //             <h3 className='text-2xl mb-5'>Company Info</h3>

// //             <div className='mb-4'>
// //               <label
// //                 htmlFor='company'
// //                 className='block text-gray-700 font-bold mb-2'
// //               >
// //                 Company Name
// //               </label>
// //               <input
// //                 type='text'
// //                 id='company'
// //                 name='company'
// //                 className='border rounded w-full py-2 px-3'
// //                 placeholder='Company Name'
// //                 value={companyName}
// //                 onChange={(e) => setCompanyName(e.target.value)}
// //               />
// //             </div>

// //             <div className='mb-4'>
// //               <label
// //                 htmlFor='company_description'
// //                 className='block text-gray-700 font-bold mb-2'
// //               >
// //                 Company Description
// //               </label>
// //               <textarea
// //                 id='company_description'
// //                 name='company_description'
// //                 className='border rounded w-full py-2 px-3'
// //                 rows='4'
// //                 placeholder='What does your company do?'
// //                 value={companyDescription}
// //                 onChange={(e) => setCompanyDescription(e.target.value)}
// //               ></textarea>
// //             </div>

// //             <div className='mb-4'>
// //               <label
// //                 htmlFor='contact_email'
// //                 className='block text-gray-700 font-bold mb-2'
// //               >
// //                 Contact Email
// //               </label>
// //               <input
// //                 type='email'
// //                 id='contact_email'
// //                 name='contact_email'
// //                 className={`border rounded w-full py-2 px-3 ${emailError ? 'border-red-500' : ''}`}
// //                 placeholder='Email address for applicants'
// //                 required
// //                 value={contactEmail}
// //                 onChange={(e) => setContactEmail(e.target.value)}
// //               />
// //               {emailError && (
// //                 <p className='text-red-500 text-sm mt-1'>{emailError}</p>
// //               )}
// //             </div>
// //             <div className='mb-4'>
// //               <label
// //                 htmlFor='contact_phone'
// //                 className='block text-gray-700 font-bold mb-2'
// //               >
// //                 Contact Phone
// //               </label>
// //               <input
// //                 type='tel'
// //                 id='contact_phone'
// //                 name='contact_phone'
// //                 className='border rounded w-full py-2 px-3'
// //                 placeholder='Optional phone for applicants'
// //                 value={contactPhone}
// //                 onChange={(e) => setContactPhone(e.target.value)}
// //               />
// //             </div>

// //             <div>
// //               <button
// //                 className='bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline'
// //                 type='submit'
// //               >
// //                 Add Job
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // };
// // export default AddJobPage;
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { useAuth } from '../context/AuthContext';

// const AddJobPage = ({ addJobSubmit }) => {
//   const [title, setTitle] = useState('');
//   const [type, setType] = useState('Full-Time');
//   const [location, setLocation] = useState('');
//   const [description, setDescription] = useState('');
//   const [salary, setSalary] = useState('Under $50K');
//   const [companyName, setCompanyName] = useState('');
//   const [companyDescription, setCompanyDescription] = useState('');
//   const [contactEmail, setContactEmail] = useState('');
//   const [contactPhone, setContactPhone] = useState('');
//   const [emailError, setEmailError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();
//   const { user } = useAuth();

//   // Pre-fill company name if user has one
//   useState(() => {
//     if (user && user.company) {
//       setCompanyName(user.company);
//     }
//   }, [user]);

//   const submitForm = async (e) => {
//     e.preventDefault();
    
//     if (!validateEmail(contactEmail)) {
//       setEmailError('Please enter a valid email address.');
//       return;
//     } else {
//       setEmailError('');
//     }

//     setLoading(true);

//     const newJob = {
//       title,
//       type,
//       location,
//       description,
//       salary,
//       company: {
//         name: companyName,
//         description: companyDescription,
//         contactEmail,
//         contactPhone,
//       },
//       employerId: user?.id,
//       createdAt: new Date().toISOString(),
//       status: 'active'
//     };

//     try {
//       await addJobSubmit(newJob);
//       toast.success('Job Added Successfully');
//       navigate('/jobs');
//     } catch (error) {
//       toast.error('Failed to add job. Please try again.');
//       console.error('Error adding job:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   function validateEmail(email) {
//     // Basic syntax check
//     const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
//     if (!emailRegex.test(email)) return false;
//     if (email.includes('..')) return false; // No consecutive periods
//     if (email.startsWith('.') || email.endsWith('.')) return false;
//     if (email.includes(' ')) return false;
//     return true;
//   }

//   return (
//     <section className='bg-indigo-50'>
//       <div className='container m-auto max-w-2xl py-24'>
//         <div className='bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0'>
//           <form onSubmit={submitForm}>
//             <h2 className='text-3xl text-center font-semibold mb-6'>Add Job</h2>

//             <div className='mb-4'>
//               <label
//                 htmlFor='type'
//                 className='block text-gray-700 font-bold mb-2'
//               >
//                 Job Type
//               </label>
//               <select
//                 id='type'
//                 name='type'
//                 className='border rounded w-full py-2 px-3'
//                 required
//                 value={type}
//                 onChange={(e) => setType(e.target.value)}
//               >
//                 <option value='Full-Time'>Full-Time</option>
//                 <option value='Part-Time'>Part-Time</option>
//                 <option value='Remote'>Remote</option>
//                 <option value='Internship'>Internship</option>
//               </select>
//             </div>

//             <div className='mb-4'>
//               <label className='block text-gray-700 font-bold mb-2'>
//                 Job Listing Name
//               </label>
//               <input
//                 type='text'
//                 id='title'
//                 name='title'
//                 className='border rounded w-full py-2 px-3 mb-2'
//                 placeholder='eg. Senior React Developer'
//                 required
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//               />
//             </div>
            
//             <div className='mb-4'>
//               <label
//                 htmlFor='description'
//                 className='block text-gray-700 font-bold mb-2'
//               >
//                 Description
//               </label>
//               <textarea
//                 id='description'
//                 name='description'
//                 className='border rounded w-full py-2 px-3'
//                 rows='4'
//                 placeholder='Add any job duties, expectations, requirements, etc'
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//               ></textarea>
//             </div>

//             <div className='mb-4'>
//               <label
//                 htmlFor='salary'
//                 className='block text-gray-700 font-bold mb-2'
//               >
//                 Salary
//               </label>
//               <select
//                 id='salary'
//                 name='salary'
//                 className='border rounded w-full py-2 px-3'
//                 required
//                 value={salary}
//                 onChange={(e) => setSalary(e.target.value)}
//               >
//                 <option value='Under $50K'>Under $50K</option>
//                 <option value='$50K - $60K'>$50K - $60K</option>
//                 <option value='$60K - $70K'>$60K - $70K</option>
//                 <option value='$70K - $80K'>$70K - $80K</option>
//                 <option value='$80K - $90K'>$80K - $90K</option>
//                 <option value='$90K - $100K'>$90K - $100K</option>
//                 <option value='$100K - 125K'>$100K - $125K</option>
//                 <option value='$125K - 150K'>$125K - $150K</option>
//                 <option value='$150K - 175K'>$150K - $175K</option>
//                 <option value='$175K - 200K'>$175K - $200K</option>
//                 <option value='Over $200K'>Over $200K</option>
//               </select>
//             </div>

//             <div className='mb-4'>
//               <label className='block text-gray-700 font-bold mb-2'>
//                 Location
//               </label>
//               <input
//                 type='text'
//                 id='location'
//                 name='location'
//                 className='border rounded w-full py-2 px-3 mb-2'
//                 placeholder='Company Location'
//                 required
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//               />
//             </div>

//             <h3 className='text-2xl mb-5'>Company Info</h3>

//             <div className='mb-4'>
//               <label
//                 htmlFor='company'
//                 className='block text-gray-700 font-bold mb-2'
//               >
//                 Company Name
//               </label>
//               <input
//                 type='text'
//                 id='company'
//                 name='company'
//                 className='border rounded w-full py-2 px-3'
//                 placeholder='Company Name'
//                 required
//                 value={companyName}
//                 onChange={(e) => setCompanyName(e.target.value)}
//               />
//             </div>

//             <div className='mb-4'>
//               <label
//                 htmlFor='company_description'
//                 className='block text-gray-700 font-bold mb-2'
//               >
//                 Company Description
//               </label>
//               <textarea
//                 id='company_description'
//                 name='company_description'
//                 className='border rounded w-full py-2 px-3'
//                 rows='4'
//                 placeholder='What does your company do?'
//                 value={companyDescription}
//                 onChange={(e) => setCompanyDescription(e.target.value)}
//               ></textarea>
//             </div>

//             <div className='mb-4'>
//               <label
//                 htmlFor='contact_email'
//                 className='block text-gray-700 font-bold mb-2'
//               >
//                 Contact Email
//               </label>
//               <input
//                 type='email'
//                 id='contact_email'
//                 name='contact_email'
//                 className={`border rounded w-full py-2 px-3 ${emailError ? 'border-red-500' : ''}`}
//                 placeholder='Email address for applicants'
//                 required
//                 value={contactEmail}
//                 onChange={(e) => setContactEmail(e.target.value)}
//               />
//               {emailError && (
//                 <p className='text-red-500 text-sm mt-1'>{emailError}</p>
//               )}
//             </div>
//             <div className='mb-4'>
//               <label
//                 htmlFor='contact_phone'
//                 className='block text-gray-700 font-bold mb-2'
//               >
//                 Contact Phone
//               </label>
//               <input
//                 type='tel'
//                 id='contact_phone'
//                 name='contact_phone'
//                 className='border rounded w-full py-2 px-3'
//                 placeholder='Optional phone for applicants'
//                 value={contactPhone}
//                 onChange={(e) => setContactPhone(e.target.value)}
//               />
//             </div>

//             <div>
//               <button
//                 className='bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline'
//                 type='submit'
//               >
//                 Add Job
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AddJobPage;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/validateEmail';

const AddJobPage = ({ addJobSubmit }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Full-Time');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('Under $50K');
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Pre-fill company name if user has one
  useState(() => {
    if (user && user.company) {
      setCompanyName(user.company);
    }
  }, [user]);

  // Handle email blur (when user clicks away from email field)
  const handleEmailBlur = () => {
    if (contactEmail && !validateEmail(contactEmail)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  // Validate email when clicking anywhere on the page (except the email field)
  useEffect(() => {
    const handleClick = (e) => {
      // If the email field is focused, do nothing
      const emailInput = document.getElementById('contact_email');
      if (emailInput && document.activeElement === emailInput) return;
      // If email is not valid, show error
      if (contactEmail && !validateEmail(contactEmail)) {
        setEmailError('Please enter a valid email address.');
      }
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [contactEmail]);

  // Handle email change
  const handleEmailChange = (e) => {
    setContactEmail(e.target.value);
    // Clear error when user starts typing if field is not empty
    if (emailError && e.target.value) {
      setEmailError('');
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    
    // Final validation on submit
    if (contactEmail && !validateEmail(contactEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (!contactEmail.trim()) {
      setEmailError('Contact email is required.');
      return;
    }

    setLoading(true);

    const newJob = {
      title,
      type,
      location,
      description,
      salary,
      company: {
        name: companyName,
        description: companyDescription,
        contactEmail,
        contactPhone,
      },
      employerId: user?.id,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    try {
      await addJobSubmit(newJob);
      toast.success('Job Added Successfully');
      navigate('/jobs');
    } catch (error) {
      toast.error('Failed to add job. Please try again.');
      console.error('Error adding job:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='bg-indigo-50'>
      <div className='container m-auto max-w-2xl py-24'>
        <div className='bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0'>
          <form onSubmit={submitForm}>
            <h2 className='text-3xl text-center font-semibold mb-6'>Add Job</h2>

            <div className='mb-4'>
              <label
                htmlFor='type'
                className='block text-gray-700 font-bold mb-2'
              >
                Job Type
              </label>
              <select
                id='type'
                name='type'
                className='border rounded w-full py-2 px-3'
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value='Full-Time'>Full-Time</option>
                <option value='Part-Time'>Part-Time</option>
                <option value='Remote'>Remote</option>
                <option value='Internship'>Internship</option>
              </select>
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2'>
                Job Listing Name
              </label>
              <input
                type='text'
                id='title'
                name='title'
                className='border rounded w-full py-2 px-3 mb-2'
                placeholder='eg. Senior React Developer'
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className='mb-4'>
              <label
                htmlFor='description'
                className='block text-gray-700 font-bold mb-2'
              >
                Description
              </label>
              <textarea
                id='description'
                name='description'
                className='border rounded w-full py-2 px-3'
                rows='4'
                placeholder='Add any job duties, expectations, requirements, etc'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className='mb-4'>
              <label
                htmlFor='salary'
                className='block text-gray-700 font-bold mb-2'
              >
                Salary
              </label>
              <select
                id='salary'
                name='salary'
                className='border rounded w-full py-2 px-3'
                required
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              >
                <option value='Under $50K'>Under $50K</option>
                <option value='$50K - $60K'>$50K - $60K</option>
                <option value='$60K - $70K'>$60K - $70K</option>
                <option value='$70K - $80K'>$70K - $80K</option>
                <option value='$80K - $90K'>$80K - $90K</option>
                <option value='$90K - $100K'>$90K - $100K</option>
                <option value='$100K - 125K'>$100K - $125K</option>
                <option value='$125K - 150K'>$125K - $150K</option>
                <option value='$150K - $175K'>$150K - $175K</option>
                <option value='$175K - $200K'>$175K - $200K</option>
                <option value='Over $200K'>Over $200K</option>
              </select>
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2'>
                Location
              </label>
              <input
                type='text'
                id='location'
                name='location'
                className='border rounded w-full py-2 px-3 mb-2'
                placeholder='Company Location'
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <h3 className='text-2xl mb-5'>Company Info</h3>

            <div className='mb-4'>
              <label
                htmlFor='company'
                className='block text-gray-700 font-bold mb-2'
              >
                Company Name
              </label>
              <input
                type='text'
                id='company'
                name='company'
                className='border rounded w-full py-2 px-3'
                placeholder='Company Name'
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className='mb-4'>
              <label
                htmlFor='company_description'
                className='block text-gray-700 font-bold mb-2'
              >
                Company Description
              </label>
              <textarea
                id='company_description'
                name='company_description'
                className='border rounded w-full py-2 px-3'
                rows='4'
                placeholder='What does your company do?'
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
              ></textarea>
            </div>

            <div className='mb-4'>
              <label
                htmlFor='contact_email'
                className='block text-gray-700 font-bold mb-2'
              >
                Contact Email
              </label>
              <input
                type='email'
                id='contact_email'
                name='contact_email'
                className={`border rounded w-full py-2 px-3 ${
                  emailError ? 'border-red-500 bg-red-50' : ''
                }`}
                placeholder='Email address for applicants'
                required
                value={contactEmail}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
              />
              {emailError && (
                <div className='mt-1 text-red-600 text-sm flex items-center'>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {emailError}
                </div>
              )}
            </div>
            
            <div className='mb-4'>
              <label
                htmlFor='contact_phone'
                className='block text-gray-700 font-bold mb-2'
              >
                Contact Phone
              </label>
              <input
                type='tel'
                id='contact_phone'
                name='contact_phone'
                className='border rounded w-full py-2 px-3'
                placeholder='Optional phone for applicants'
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div>
              <button
                className='bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline disabled:opacity-50'
                type='submit'
                disabled={loading || emailError}
              >
                {loading ? 'Adding Job...' : 'Add Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddJobPage;
