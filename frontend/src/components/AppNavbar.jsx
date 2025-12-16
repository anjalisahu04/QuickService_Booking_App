
import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const IconPerson = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const IconLogOut = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const IconFileText = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const IconShieldCheck = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

const IconTools = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
);

const IconUserCircle = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="10" r="3"></circle>
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
  </svg>
);

/**
 * The main navigation bar for the QuickServe website.
 *
 * @param {object} props
 * @param {boolean} props.isAuthenticated - Whether the user is currently logged in.
 * @param {object} props.user - The user object (e.g., { name: 'Sandeep', role: 'USER' }).
 * @param {function} props.onLogout - A function to call when the logout button is clicked.
 */
function AppNavbar({ isAuthenticated, user, onLogout }) {
  const navigate = useNavigate();

  // --- CUSTOM STYLES ---
  const styles = `
    /* Main Navbar Styling */
    .qs-navbar {
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        padding: 12px 0;
        transition: all 0.3s ease;
        /* High Z-Index to stay on top of everything */
        z-index: 1050; 
        position: sticky;
        top: 0;
    }

    /* Brand Logo Styling */
    .brand-text {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        background: linear-gradient(135deg, #0d6efd 0%, #0099ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
        letter-spacing: -0.5px;
        position: relative;
    }

    /* Navigation Links */
    .nav-link-custom {
        font-weight: 600;
        color: #555 !important;
        margin: 0 5px;
        padding: 8px 16px !important;
        border-radius: 20px;
        transition: all 0.2s ease-in-out;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
    }

    .nav-link-custom:hover {
        color: #0d6efd !important;
        background-color: rgba(13, 110, 253, 0.05);
        transform: translateY(-1px);
    }
    
    .nav-icon {
        margin-right: 8px;
        display: inline-block;
        vertical-align: middle;
    }

    /* Buttons */
    .btn-login-custom {
        border-radius: 50px;
        padding: 8px 24px;
        font-weight: 600;
        border: 2px solid #0d6efd;
        color: #0d6efd;
        transition: all 0.3s;
    }
    .btn-login-custom:hover {
        background-color: #0d6efd;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
    }

    .btn-signup-custom {
        border-radius: 50px;
        padding: 8px 24px;
        font-weight: 600;
        background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
        border: none;
        box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
        transition: all 0.3s;
    }
    .btn-signup-custom:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
    }

    /* Dropdown Styling */
    .dropdown-menu {
        border: none;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        border-radius: 15px;
        padding: 10px;
        margin-top: 15px;
        animation: fadeIn 0.2s ease-out;
    }
    
    .dropdown-item {
        border-radius: 8px;
        padding: 8px 15px;
        font-weight: 500;
        color: #495057;
        display: flex;
        align-items: center;
    }
    .dropdown-item:hover {
        background-color: #f8f9fa;
        color: #0d6efd;
    }
    .dropdown-item.text-danger:hover {
        background-color: #fff5f5;
        color: #dc3545;
    }

    /* Animation */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
  `;

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
      window.location.reload();
    }
  };

  const getServiceButton = () => {
    if (!isAuthenticated) {
      return (
        <Nav.Link disabled className="nav-link-custom text-muted opacity-50">
          Services
        </Nav.Link>
      );
    }

    if (user?.role === 'PROVIDER') {
      return (
        <>
          <Nav.Link as={Link} to="/requests" className="nav-link-custom">
            <IconFileText className="nav-icon" size={18} /> Requests
          </Nav.Link>
          <Nav.Link as={Link} to="/services" className="nav-link-custom">
            <IconTools className="nav-icon" size={18} /> Services
          </Nav.Link>
        </>
      );
    } else if (user?.role === 'ADMIN') {
      return (
        <>
          <Nav.Link as={Link} to="/services" className="nav-link-custom">
            <IconTools className="nav-icon" size={18} /> Services
          </Nav.Link>
          <Nav.Link as={Link} to="/verifications" className="nav-link-custom">
            <IconShieldCheck className="nav-icon" size={18} /> Verifications
          </Nav.Link>
        </>
      );
    } else {
      return (
        <Nav.Link as={Link} to="/services" className="nav-link-custom">
          <IconTools className="nav-icon" size={18} /> Services
        </Nav.Link>
      );
    }
  };

  return (
    <>
      <style>{styles}</style>
      <Navbar expand="lg" className="qs-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fs-3 d-flex align-items-center">
            <span className="brand-text">QuickServe</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link as={Link} to="/" className="nav-link-custom">
                Home
              </Nav.Link>

              {getServiceButton()}

              <div className="d-flex ms-lg-3 mt-3 mt-lg-0 align-items-center">
                {isAuthenticated ? (
                  <NavDropdown
                    title={
                      <div className="d-inline-flex align-items-center fw-bold text-dark">
                        <div className="bg-light rounded-circle p-1 me-2 border d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
                            <IconPerson className="text-primary" size={18} />
                        </div>
                        <span>{user?.name || 'User'}</span>
                      </div>
                    }
                    id="basic-nav-dropdown"
                    align="end"
                    className="ms-2"
                  >
                    <div className="px-3 py-2 bg-light mx-2 rounded mb-2">
                        <small className="text-muted d-block text-uppercase" style={{fontSize: '0.7rem'}}>Signed in as</small>
                        <strong className="text-primary">{user?.role || 'USER'}</strong>
                    </div>
                    
                    <NavDropdown.Divider />

                    <NavDropdown.Item as={Link} to="/profile">
                      <IconUserCircle className="me-2" size={16} /> My Profile
                    </NavDropdown.Item>

                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout} className="text-danger fw-bold">
                      <IconLogOut className="me-2" size={16} /> Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                ) : (
                  <div className="d-flex gap-2">
                    <Button
                      as={Link}
                      to="/login"
                      variant="outline-primary"
                      className="btn-login-custom"
                    >
                      Login
                    </Button>
                    <Button 
                      as={Link} 
                      to="/signup" 
                      className="btn-signup-custom"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default AppNavbar;