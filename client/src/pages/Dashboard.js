import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import drishtiLogo from '../assets/images/drishti_logo.png';
import './styels.css';

const Dashboard = () => {
  // State variables for managing user roles, view modes, and loading/error states
  const [role, setRole] = useState(null); // User role (e.g., Administrator, Manager)
  const [username, setUsername] = useState(null); // Logged-in user's username
  const [view, setView] = useState('default'); // Current view (e.g., 'default', 'current-openings', 'create-job')
  const [loading, setLoading] = useState(true); // Loading state for fetching user info
  const [error, setError] = useState(''); // Error message
  const [success, setSuccess] = useState(''); // Success message

  // Loading states for different operations
  const [loadingRegistration, setLoadingRegistration] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingJobCreation, setLoadingJobCreation] = useState(false);
  const [loadingJobOpenings, setLoadingJobOpenings] = useState(false);

  // States for managing job applications and forms
  const [selectedJob, setSelectedJob] = useState(null); // Selected job for application
  const [showApplyForm, setShowApplyForm] = useState(false); // Toggle to show/hide apply form

  // States for Register form
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // States for Login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // States for Create Job form
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobSalary, setJobSalary] = useState('');

  // States for job application form
  const [applicationName, setApplicationName] = useState('');
  const [applicationEmail, setApplicationEmail] = useState('');
  const [applicationPhone, setApplicationPhone] = useState('');
  const [applicationResume, setApplicationResume] = useState(null);

  // States for storing job openings
  const [jobOpenings, setJobOpenings] = useState([]);

  // Fetch user info on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL; // API URL from environment variables
        const { data } = await axios.get(`${apiUrl}/api/user-info`, { withCredentials: true });
        setRole(data.role); // Set user role
        setUsername(data.username); // Set username
        setView('dashboard'); // Set view to 'dashboard'
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        setView('default'); // Fall back to 'default' view if there's an error
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };

    fetchUserInfo(); // Call the function to fetch user info
  }, []);

  // Fetch job openings when 'current-openings' view is selected
  useEffect(() => {
    if (view === 'current-openings') {
      const fetchJobOpenings = async () => {
        setLoadingJobOpenings(true); // Start loading indicator
        try {
          const apiUrl = process.env.REACT_APP_API_URL;
          const { data } = await axios.get(`${apiUrl}/api/job-openings`);
          setJobOpenings(data.jobs || []); // Set job openings (ensure it's always an array)
        } catch (err) {
          console.error('Failed to fetch job openings:', err);
          setError('Failed to load job openings.'); // Set error message
        } finally {
          setLoadingJobOpenings(false); // Stop loading indicator
        }
      };

      fetchJobOpenings(); // Call the function to fetch job openings
    }
  }, [view]);

  // Handler functions
  const handleShowRegister = () => setView('register'); // Show registration form
  const handleShowLogin = () => setView('login'); // Show login form

  // Handle successful login
  const handleLoginSuccess = (role) => {
    const username = localStorage.getItem('username');
    setRole(role);
    setUsername(username);
    setView('dashboard'); // Navigate to dashboard on successful login
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    localStorage.removeItem('role'); // Remove role from local storage
    localStorage.removeItem('username'); // Remove username from local storage
    setRole(null); // Clear role state
    setUsername(null); // Clear username state
    setView('default'); // Navigate to default view
  };

  // Handle click on 'Apply' button for a job
  const handleApplyClick = (job) => {
    setSelectedJob(job); // Set selected job
    setShowApplyForm(true); // Show apply form
  };

  // Handle closing of the apply form
  const handleFormClose = () => {
    setShowApplyForm(false); // Hide apply form
    setSelectedJob(null); // Clear selected job
  };

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoadingRegistration(true); // Start loading indicator
    setError(''); // Clear previous error
    setSuccess(''); // Clear previous success message

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${apiUrl}/api/register`, {
        username: registerUsername,
        password: registerPassword
      });

      setSuccess(response.data.message || 'Registration successful. Please log in.'); // Set success message
      setRegisterUsername(''); // Clear registration form fields
      setRegisterPassword('');
      handleShowLogin(); // Show login form
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.'); // Set error message
    } finally {
      setLoadingRegistration(false); // Stop loading indicator
    }
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingLogin(true); // Start loading indicator
    setError(''); // Clear previous error
    setSuccess(''); // Clear previous success message

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${apiUrl}/api/login`, {
        username: loginUsername,
        password: loginPassword
      });

      // Store login details in local storage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('username', response.data.username);

      handleLoginSuccess(response.data.role); // Handle login success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.'); // Set error message
    } finally {
      setLoadingLogin(false); // Stop loading indicator
    }
  };

  // Handle back button click to navigate to dashboard
  const handleBack = () => {
    setView('dashboard');
  };

  // Handle job creation form submission
  const handleCreateJob = async (e) => {
    e.preventDefault();
    setLoadingJobCreation(true); // Start loading indicator
    setError(''); // Clear previous error
    setSuccess(''); // Clear previous success message
  
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${apiUrl}/api/create-job`, {
        title: jobTitle,
        description: jobDescription,
        location: jobLocation,
        salary: jobSalary
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // Authorization header with token
        }
      });
  
      setSuccess(response.data.message || 'Job created successfully.'); // Set success message
      setJobTitle(''); // Clear job creation form fields
      setJobDescription('');
      setJobLocation('');
      setJobSalary('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job. Please try again.'); // Set error message
    } finally {
      setLoadingJobCreation(false); // Stop loading indicator
    }
  };
  
  const renderSidebar = () => {
    const features = [
      { name: 'Current Openings', roleAccess: [ 'Manager', 'Regular User'] },
      { name: 'Create Job', roleAccess: ['Administrator'] },
      { name: 'Manage Users', roleAccess: ['Administrator'] },
      { name: 'View Candidates', roleAccess: ['Administrator', 'Manager'] },
      { name: 'Profile Settings', roleAccess: ['Administrator', 'Manager', 'Regular User'] }
    ];

    return features
      .filter(feature => feature.roleAccess.includes(role))
      .map((feature, index) => (
        <a
          key={index}
          href={`#${feature.name.toLowerCase().replace(/ /g, '-')}`}
          className="sidebar-item"
          onClick={() => setView(feature.name.toLowerCase().replace(/ /g, '-'))}
        >
          {feature.name}
        </a>
      ));
  };

    // Handle job application form submission
    const handleApplyJob = async (e, job) => {
      e.preventDefault();
      // Perform form submission logic here, e.g., send data to the server
      // This is a placeholder implementation
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const formData = new FormData();
        formData.append('name', applicationName);
        formData.append('email', applicationEmail);
        formData.append('phone', applicationPhone);
        formData.append('resume', applicationResume);
        formData.append('jobId', job.id);
  
        const response = await axios.post(`${apiUrl}/api/apply`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        setSuccess(response.data.message || 'Application submitted successfully.'); // Set success message
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to submit application.'); // Set error message
      } finally {
        handleFormClose(); // Close the form
      }
    };

  const renderContent = () => {
    return (
      <div>
        {view !== 'dashboard' && view !== 'default' && (
         <button className="btn back" onClick={handleBack}>
         <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
         Back
       </button>
        )}
        {view === 'register' && (
          <div>
         
            <form onSubmit={handleRegister}className='register-form'>
              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}
              
              <div className="form-group">
              <h2>Register</h2>
                <label htmlFor="register-username">Username</label>
                <input
                  id="register-username"
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>
              <button className="btn" type="submit" disabled={loadingRegistration}>
                {loadingRegistration ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        )}
        {view === 'login' && (
          <div>
            
            <form onSubmit={handleLogin} className='login-form'>
              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}
              <div className="form-group">
              <h2>Login</h2>
                <label htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <button className="btn" type="submit" disabled={loadingLogin}>
                {loadingLogin ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        )}

{view === 'current-openings' && (
        <div>
          {loadingJobOpenings ? (
            <p>Loading job openings...</p>
          ) : (
            <ul>
              {jobOpenings.length === 0 ? (
                <p>No job openings available.</p>
              ) : (
                jobOpenings.map((job, index) => (
                  <div key={index} className="job-opening">
                    <h3>{job.title}</h3>
                    <p>{job.description}</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Salary:</strong> {job.salary}</p>
                    <button onClick={() => handleApplyClick(job)}>Apply</button>
                  </div>
                ))
              )}
            </ul>
          )}
          {/* Modal Component */}
          {showApplyForm && selectedJob && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button className="modal-close" onClick={handleFormClose}>×</button>
                <form onSubmit={(e) => handleApplyJob(e, selectedJob)} className="apply-form">
                  <h3>Apply for {selectedJob.title}</h3>
                  <label>
                    Name:
                    <input
                      type="text"
                      value={applicationName}
                      onChange={(e) => setApplicationName(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Email:
                    <input
                      type="email"
                      value={applicationEmail}
                      onChange={(e) => setApplicationEmail(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Phone:
                    <input
                      type="tel"
                      value={applicationPhone}
                      onChange={(e) => setApplicationPhone(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Resume:
                    <input
                      type="file"
                      onChange={(e) => setApplicationResume(e.target.files[0])}
                      required
                    />
                  </label>
                  <button type="submit">Submit Application</button>
                  <button type="button" onClick={handleFormClose}>Cancel</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
   
        

         
   
         
            
     
      
        {view === 'create-job' && (
         <div>
       
         <form onSubmit={handleCreateJob} className='create-job-form'>
           {error && <div className="error">{error}</div>}
           {success && <div className="success">{success}</div>}
           
           <div className="form-group">
             <label htmlFor="job-title">Job Title</label>
             <input
               id="job-title"
               type="text"
               value={jobTitle}
               onChange={(e) => setJobTitle(e.target.value)}
               required
             />
           </div>
           <div className="form-group">
             <label htmlFor="job-description">Job Description</label>
             <textarea
               id="job-description"
               value={jobDescription}
               onChange={(e) => setJobDescription(e.target.value)}
               required
             />
           </div>
           <div className="form-group">
             <label htmlFor="job-location">Job Location</label>
             <input
               id="job-location"
               type="text"
               value={jobLocation}
               onChange={(e) => setJobLocation(e.target.value)}
               required
             />
           </div>
           <div className="form-group">
             <label htmlFor="job-salary">Job Salary</label>
             <input
               id="job-salary"
               type="text"
               value={jobSalary}
               onChange={(e) => setJobSalary(e.target.value)}
               required
             />
           </div>
           <button className="btn" type="submit" disabled={loadingJobCreation}>
             {loadingJobCreation ? 'Creating Job...' : 'Create Job'}
           </button>
         </form>
       </div>
        )}
        {view === 'manage-users' && (
          <div>
            <h2>Manage Users</h2>
            <p>Manage user accounts here...</p>
          </div>
        )}
        {view === 'view-candidates' && (
          <div>
            <h2>View Candidates</h2>
            <p>List of candidates here...</p>
          </div>
        )}
        {view === 'default' && (
         <div className="text-center">
         <h2>Welcome to the Job Portal</h2>
         <p>
         log in 
    or register now to explore our comprehensive dashboard features designed to 
    streamline your job search and hiring process
         </p>
       </div>
       
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="dashboard">
      <header className="navbar">
        <div className="container">
          <img src={drishtiLogo} alt="Company Logo" className="logo" />
          <div className="navbar-right">
            {username && (
            <span className="welcome-container">
            <FontAwesomeIcon icon={faUser} className="user-icon" />
            <span className="username-text">{username}</span>
          </span>
            )}
            <nav className="navbar-nav">
              {!role ? (
                <>
                  <button className="btn" onClick={handleShowLogin}>Login</button>
                  <button className="btn" onClick={handleShowRegister}>Register</button>
                </>
              ) : (
                <button className="btn logout" onClick={handleLogout}>Logout</button>
              )}
            </nav>
          </div>
        </div>
      </header>
      <div className="dashboard-container">
        <aside className="sidebar">
          {role ? renderSidebar() : null}
        </aside>
        <main className="content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
export default Dashboard;
