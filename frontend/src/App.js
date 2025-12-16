// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AppNavbar from "./components/AppNavbar";
// import Home from "./components/Home";
// import Services from "./components/Services";
// import AuthForm from "./components/AuthForm";
// import Profile from './components/Profile';
// import ServiceProviderList from './components/ServiceProviderList';
// import Requests from './components/Requests';
// import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
// import Verifications from './components/Verifications';
// import ServiceProviderDetails from "./components/ServiceProviderDetails";





// function App() {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // Check if user is logged in on app start
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const userData = localStorage.getItem('user');

//     if (token && userData) {
//       setIsAuthenticated(true);
//       setUser(JSON.parse(userData));
//     }
//   }, []);

//   // Handle login
//   const handleLogin = (userData) => {
//     localStorage.setItem('token', userData.token);
//     localStorage.setItem('user', JSON.stringify(userData.user));
//     setIsAuthenticated(true);
//     setUser(userData.user);
//   };

//   // Handle logout
//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setIsAuthenticated(false);
//     setUser(null);
//   };

//   return (
//     <Router>
//       <AppNavbar
//         isAuthenticated={isAuthenticated}
//         user={user}
//         onLogout={handleLogout}
//       />
//       <div className="container mt-4">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/services" element={<Services />} />
//           <Route path="/login"element={<AuthForm onLogin={handleLogin} />}/>
//           <Route path="/signup"element={<AuthForm onLogin={handleLogin} />}/>
//          <Route path="/serviceProvider-List" element={<ServiceProviderList />} />
//          <Route path="/requests" element={<Requests />} />
//          <Route path="/provider/:providerId" element={<ServiceProviderDetails />} />
//          <Route 
//           path="/verifications" 
//           element={
//             <ProtectedRoute>
//               <Verifications />
//             </ProtectedRoute>
//           } 
//         />
//          {/* <Route path="/verifications" element={<Verifications />} /> */}
//           <Route path="/profile" element={<Profile />} />
//           <Route path="/my-bookings" element={<Profile />} />
//           <Route path="/my-services" element={<Profile />} />

//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import Home from "./components/Home";
import Services from "./components/Services";
import AuthForm from "./components/AuthForm";
import Profile from './components/Profile';
import ServiceProviderList from './components/ServiceProviderList';
import Requests from './components/Requests';
import ProtectedRoute from './components/ProtectedRoute';
import Verifications from './components/Verifications';
import ServiceProviderDetails from "./components/ServiceProviderDetails";
import Books from "./components/Books";

// Helper component to conditionally render Navbar
const AppLayout = ({ isAuthenticated, user, onLogout, children }) => {
  const location = useLocation();
  
  // Define paths where the Navbar should be hidden
  // Added /profile, and also /my-bookings /my-services since they render the Profile component in your code
  const hideNavbarPaths = ['/profile']; 
  
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && (
        <AppNavbar
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={onLogout}
        />
      )}
      <div className="container mt-4">
        {children}
      </div>
    </>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Handle login
  const handleLogin = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setIsAuthenticated(true);
    setUser(userData.user);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <AppLayout 
        isAuthenticated={isAuthenticated} 
        user={user} 
        onLogout={handleLogout}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<AuthForm onLogin={handleLogin} />} />
          <Route path="/signup" element={<AuthForm onLogin={handleLogin} />} />
          <Route path="/serviceProvider-List" element={<ServiceProviderList />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/books" element={<Books />} />
          <Route path="/provider/:providerId" element={<ServiceProviderDetails />} />
          
          <Route 
            path="/verifications" 
            element={
              <ProtectedRoute>
                <Verifications />
              </ProtectedRoute>
            } 
          />

          {/* Profile Routes - Navbar will be hidden for /profile */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-bookings" element={<Profile />} />
          <Route path="/my-services" element={<Profile />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;