import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Tab, Tabs, Badge, ListGroup, Modal, Spinner, InputGroup, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { addressService } from './AddressService';
import { bookingService } from './BookingService';
import Verifications from './Verifications';
import ReviewModal from './ReviewModal';
import PaymentModal from './PaymentModal';
import { 
    StarFill, ArrowLeft, GeoAlt, Telephone, Envelope, 
    CheckCircleFill, ExclamationCircle, BoxArrowRight, Person
} from 'react-bootstrap-icons';

// --- Custom Icons (Inline SVGs) ---
const Icons = {
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Person: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  GeoAlt: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  CheckCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  XCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Cash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/><path d="M8 15h.01"/><path d="M16 15h.01"/></svg>,
  Activity: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Briefcase: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
};

// --- CSS Styles ---
const customStyles = `
  :root {
    --primary-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    --card-bg: rgba(255, 255, 255, 0.9);
    --glass-border: 1px solid rgba(255, 255, 255, 0.5);
    --shadow-soft: 0 10px 40px -10px rgba(0,0,0,0.1);
  }

  body {
    background-color: #f0f2f5;
  }

  .profile-bg {
    background: radial-gradient(circle at 10% 20%, rgb(239, 246, 255) 0%, rgb(219, 228, 255) 90%);
    min-height: 100vh;
    padding-bottom: 60px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  /* Glassmorphism Card */
  .glass-card {
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: var(--glass-border);
    border-radius: 24px;
    box-shadow: var(--shadow-soft);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative; /* Important for absolute positioning of avatar */
  }

  .glass-card.hover-effect:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15);
  }

  /* Sidebar Specifics */
  .profile-cover {
    height: 150px; /* Increased height for better look */
    background: linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%);
    position: relative;
  }

  /* THE LOGO/AVATAR WRAPPER - FIXED POSITIONING */
  .profile-avatar-wrapper {
    position: absolute;
    bottom: -50px; /* Pushes it half-way out of the cover */
    left: 50%;
    transform: translateX(-50%);
    z-index: 10; /* Ensures it stays ON TOP of the card content */
  }

  .avatar-circle {
    width: 120px;
    height: 120px;
    background: white;
    padding: 6px;
    border-radius: 50%;
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #30cfd0 0%, #330867 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 3.5rem;
    font-weight: 700;
  }

  /* Custom Tabs */
  .custom-tabs .nav-link {
    border: none;
    color: #64748b;
    font-weight: 600;
    padding: 15px 25px;
    border-radius: 12px;
    transition: all 0.3s ease;
    margin-right: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .custom-tabs .nav-link:hover {
    background-color: rgba(79, 172, 254, 0.1);
    color: #00f2fe;
  }

  .custom-tabs .nav-link.active {
    background: var(--primary-gradient);
    color: white;
    box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }

  .status-badge-modern {
    padding: 6px 16px;
    border-radius: 30px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserInStorage = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="grow" variant="primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Container className="mt-5 pt-5">        
        <Alert variant="warning" className="shadow-sm border-0 rounded-4 p-4 text-center">
          <ExclamationCircle size={30} className="mb-3" />
          <h4>Authentication Required</h4>
          <p>You need to be logged in to view your profile.</p>
          <Button variant="dark" className="rounded-pill px-4" onClick={() => navigate('/login')}>
            Login Now
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="profile-bg">
      <style>{customStyles}</style>
      
      {/* Top Navigation Area */}
      <Container fluid className="p-4 d-flex justify-content-between align-items-center">
        <Button 
          variant="white" 
          className="glass-card px-4 py-2 border-0 fw-bold d-flex align-items-center gap-2 text-dark"
          onClick={() => navigate('/')}
        >
          <ArrowLeft /> Back Home
        </Button>
        <div className="text-end d-none d-md-block">
          <span className="text-muted small fw-bold text-uppercase">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </Container>

      <Container className="pb-5">
        {/* Header Greeting */}
        <div className="mb-5 animate-fade-in">
          <h1 className="display-5 fw-bold text-dark mb-1">
            {getTimeGreeting()}, <span style={{ background: 'linear-gradient(to right, #4facfe, #00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-muted lead">Manage your personal information, bookings, and settings.</p>
        </div>

        <Row className="g-4">
          {/* Left Sidebar */}
          <Col lg={4}>
             <div className="sticky-top" style={{ top: '20px', zIndex: 10 }}>
                <UserProfileCard user={user} />
                
                {/* Mini Stats Card */}
                {user.role !== 'ADMIN' && (
                  <Card className="glass-card mt-4 border-0 p-3">
                     <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary">
                          <Icons.Activity />
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">Account Status</h6>
                          <small className="text-success fw-bold"><CheckCircleFill className="me-1"/> Active & Verified</small>
                        </div>
                     </div>
                     <div className="bg-light rounded-3 p-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small className="fw-bold text-muted">Profile Strength</small>
                          <small className="fw-bold text-primary">Excellent</small>
                        </div>
                        <ProgressBar now={100} variant="info" style={{height: '6px'}} className="rounded-pill" />
                     </div>
                  </Card>
                )}
             </div>
          </Col>

          {/* Main Content Area */}
          <Col lg={8}>
            <Card className="glass-card border-0" style={{ minHeight: '600px' }}>
              <Card.Header className="bg-transparent border-0 pt-4 px-4">
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="custom-tabs border-0"
                >
                  <Tab eventKey="profile" title={<span><Icons.Person /> Profile</span>} />
                  
                  {(user.role === 'PROVIDER' || user.role === 'USER') && (
                    <Tab eventKey="bookings" title={<span><Icons.Calendar /> Bookings</span>} />
                  )}
                  
                  {user.role === 'ADMIN' && (
                     <Tab eventKey="admin" title={<span><Icons.Briefcase /> Admin</span>} />
                  )}
                  
                  {(user.role === 'PROVIDER' || user.role === 'USER') && (
                    <Tab eventKey="addresses" title={<span><GeoAlt size={14}/> Addresses</span>} />
                  )}
                </Tabs>
              </Card.Header>
              
              <Card.Body className="px-4 pb-4">
                 <div className="animate-fade-in">
                    {activeTab === 'profile' && <ProfileInfo user={user} onUserUpdate={updateUserInStorage} />}
                    {activeTab === 'bookings' && <MyBookings user={user} />}
                    {activeTab === 'admin' && <AdminPanel user={user} />}
                    {activeTab === 'addresses' && <MyAddresses user={user} />}
                 </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

// --- Sub-Components ---

function UserProfileCard({ user }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };
  
  const roleColors = {
    ADMIN: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    PROVIDER: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
    USER: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)'
  };

  return (
    <>
    <div className="glass-card pb-3">
      {/* 1. UPPER SIDE: Profile Cover & Main Logo */}
      <div className="profile-cover">
         <div className="profile-avatar-wrapper">
            <div className="avatar-circle">
              <div className="avatar-img">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
         </div>
      </div>
      
      {/* 2. Content below the header */}
      <div className="text-center px-4">
        {/* Margin top ensures text doesn't hide behind the avatar */}
        <div style={{ marginTop: '70px' }}>
          <h3 className="fw-bold mb-1">{user.name}</h3>
          <Badge className="px-3 py-2 rounded-pill border-0 text-dark mb-3 shadow-sm" style={{ background: roleColors[user.role] || '#eee' }}>
            {user.role}
          </Badge>
          
          <div className="d-flex justify-content-center gap-2 mb-4">
            {user.rating > 0 && (
                <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1 rounded-pill px-3 py-2">
                    <StarFill /> {user.rating} ({user.totalRatings || 0})
                </Badge>
            )}
             {user.serviceCharge && (
                <Badge bg="light" text="dark" className="d-flex align-items-center gap-1 rounded-pill px-3 py-2 border">
                    <Icons.Cash /> ₹{user.serviceCharge}/hr
                </Badge>
            )}
          </div>

          <div className="bg-white rounded-4 p-3 text-start shadow-sm mb-4 border">
             <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-light p-2 rounded-circle text-primary"><Envelope size={18}/></div>
                <div className="text-truncate">
                    <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Email</small>
                    <span className="fw-medium small" title={user.email}>{user.email}</span>
                </div>
             </div>
             <div className="d-flex align-items-center gap-3">
                <div className="bg-light p-2 rounded-circle text-primary"><Telephone size={18}/></div>
                <div>
                    <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Phone</small>
                    <span className="fw-medium small">{user.phone}</span>
                </div>
             </div>
          </div>

          {/* 3. LOGOUT BUTTON - Cleaned up (Fixed the broken logo issue) */}
          <Button 
            variant="outline-danger" 
            className="w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2" 
            onClick={() => setShowLogoutModal(true)}
          >
            {/* Using a standard icon instead of a broken image */}
            <BoxArrowRight size={20} /> 
            Sign Out
          </Button>
        </div>
      </div>
    </div>

    {/* Logout Confirmation Modal */}
    <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered contentClassName="border-0 rounded-4 shadow-lg overflow-hidden">
        <div style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', height: '100px' }} className="position-relative">
            <div className="position-absolute top-100 start-50 translate-middle">
                 <div className="avatar-circle shadow-sm bg-white p-1" style={{width:'80px', height:'80px'}}>
                    <div className="avatar-img text-white bg-danger" style={{fontSize:'2rem'}}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                </div>
            </div>
        </div>
        
        <Modal.Body className="pt-5 pb-4 text-center mt-3">
          <h5 className="fw-bold">Ready to leave?</h5>
          <p className="text-muted small px-4">You are currently logged in as <strong>{user.email}</strong>.</p>
        </Modal.Body>
        
        <Modal.Footer className="border-0 pt-0 pb-4 justify-content-center gap-2">
          <Button variant="light" className="px-4 rounded-pill fw-bold" onClick={() => setShowLogoutModal(false)}>Stay</Button>
          <Button variant="danger" className="px-4 rounded-pill fw-bold" onClick={handleLogout}>Logout</Button>
        </Modal.Footer>
    </Modal>
    </>
  );
}
function ProfileInfo({ user, onUserUpdate }) {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        phone: user.phone || '',
        serviceType: user.serviceType || '',
        serviceCharge: user.serviceCharge || '',
        experience: user.experience || ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const updateData = {
                name: formData.name,
                phone: formData.phone,
                ...(user.role === 'PROVIDER' && {
                  serviceType: formData.serviceType,
                  serviceCharge: formData.serviceCharge ? parseFloat(formData.serviceCharge) : null,
                  experience: formData.experience ? parseInt(formData.experience) : null
                })
            };

            await api.put('/users/profile', updateData);
            
            onUserUpdate({ ...user, ...updateData });
            setEditMode(false);
            setMessage("Profile Updated Successfully!");
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
                <div>
                    <h4 className="fw-bold mb-1">Profile Details</h4>
                    <p className="text-muted mb-0 small">View and update your personal information</p>
                </div>
                <Button variant={editMode ? "light" : "dark"} size="sm" className="rounded-pill px-3 shadow-sm" onClick={() => setEditMode(!editMode)}>
                    {editMode ? 'Cancel Edit' : 'Edit Details'}
                </Button>
            </div>

            {message && <Alert variant="success" className="rounded-pill py-2 text-center border-0 bg-success bg-opacity-25 text-success fw-bold">{message}</Alert>}
            {error && <Alert variant="danger" className="rounded-pill py-2 text-center border-0">{error}</Alert>}

            {editMode ? (
                 <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Label className="small fw-bold text-muted">Full Name</Form.Label>
                            <Form.Control type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-3 border-light bg-light py-2" required />
                        </Col>
                        <Col md={6}>
                             <Form.Label className="small fw-bold text-muted">Phone Number</Form.Label>
                             <Form.Control type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-3 border-light bg-light py-2" required />
                        </Col>
                        
                        {user.role === 'PROVIDER' && (
                             <>
                                <Col md={12}>
                                    <Form.Label className="small fw-bold text-muted">Service Type</Form.Label>
                                    <Form.Control type="text" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} className="rounded-3 border-light bg-light py-2" placeholder="e.g. Plumber" />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted">Service Charge (₹/hr)</Form.Label>
                                    <Form.Control type="number" value={formData.serviceCharge} onChange={e => setFormData({...formData, serviceCharge: e.target.value})} className="rounded-3 border-light bg-light py-2" />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted">Experience (Years)</Form.Label>
                                    <Form.Control type="number" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="rounded-3 border-light bg-light py-2" />
                                </Col>
                             </>
                        )}
                        <Col md={12} className="text-end mt-4">
                            <Button type="submit" disabled={loading} className="rounded-pill px-4" variant="primary">
                                {loading ? <Spinner size="sm" animation="border"/> : 'Save Changes'}
                            </Button>
                        </Col>
                    </Row>
                 </Form>
            ) : (
                <Row className="g-4">
                    <Col md={6}>
                        <div className="p-3 bg-light bg-opacity-50 rounded-4 h-100 border border-light">
                            <small className="text-uppercase text-muted fw-bold" style={{fontSize:'0.7rem'}}>Full Name</small>
                            <div className="fw-bold text-dark fs-5">{user.name}</div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="p-3 bg-light bg-opacity-50 rounded-4 h-100 border border-light">
                            <small className="text-uppercase text-muted fw-bold" style={{fontSize:'0.7rem'}}>Email Address</small>
                            <div className="fw-bold text-dark fs-5">{user.email}</div>
                        </div>
                    </Col>
                     <Col md={6}>
                        <div className="p-3 bg-light bg-opacity-50 rounded-4 h-100 border border-light">
                            <small className="text-uppercase text-muted fw-bold" style={{fontSize:'0.7rem'}}>Mobile</small>
                            <div className="fw-bold text-dark fs-5">{user.phone}</div>
                        </div>
                    </Col>
                    
                    {user.role === 'PROVIDER' && (
                        <Col md={6}>
                            <div className="p-3 bg-info bg-opacity-10 rounded-4 h-100 border border-info border-opacity-25">
                                <small className="text-uppercase text-info fw-bold" style={{fontSize:'0.7rem'}}>Provider Stats</small>
                                <div className="fw-bold text-dark">
                                    {user.serviceType || 'N/A'} • {user.experience ? `${user.experience} Yrs Exp.` : 'No Exp. Listed'}
                                </div>
                            </div>
                        </Col>
                    )}
                </Row>
            )}
        </div>
    );
}

function MyBookings({ user }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [showAmountModal, setShowAmountModal] = useState(false);

    useEffect(() => {
        fetchUserBookings();
    }, []);

    const fetchUserBookings = async () => {
        try {
            setLoading(true);
            const bookingsData = await bookingService.getUserBookingsWithReviews();
            
            // Sort by createdAt desc (newest first)
            const sortedBookings = [...bookingsData].sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return b.id - a.id;
            });
            
            setBookings(sortedBookings);
        } catch (err) {
            console.error("Error fetching bookings", err);
        } finally {
            setLoading(false);
        }
    };

    // Helper for badge style
    const getStatusStyle = (status) => {
        switch(status) {
            case 'CONFIRMED': return { bg: '#d1e7dd', color: '#0f5132', icon: <CheckCircleFill /> };
            case 'PENDING': return { bg: '#fff3cd', color: '#856404', icon: <Icons.Clock /> };
            case 'COMPLETED': return { bg: '#cfe2ff', color: '#084298', icon: <StarFill /> };
            case 'CANCELLED': return { bg: '#f8d7da', color: '#842029', icon: <ExclamationCircle /> };
            default: return { bg: '#e2e3e5', color: '#41464b', icon: <Icons.Activity /> };
        }
    };

    const handlePaymentClick = (booking) => {
        setSelectedBooking(booking);
        if (booking.totalAmount && booking.totalAmount > 0) {
            setPaymentAmount(booking.totalAmount);
            setShowPaymentModal(true);
        } else {
            setShowAmountModal(true);
        }
    };

    const handleAmountSubmit = () => {
        if (paymentAmount > 0) {
            setShowAmountModal(false);
            setShowPaymentModal(true);
        } else {
            alert('Please enter a valid amount');
        }
    };

    const BookingCard = ({ booking }) => {
        const style = getStatusStyle(booking.status);
        return (
            <Col md={12} className="mb-3">
                <div className="glass-card hover-effect p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', background: style.bg, color: style.color }}>
                            {style.icon}
                        </div>
                        <div>
                            <h6 className="fw-bold mb-1">{booking.serviceType}</h6>
                            <div className="small text-muted mb-1"><Icons.Person /> {booking.providerName}</div>
                            <div className="small fw-medium text-primary"><Icons.Calendar /> {new Date(booking.bookingDate).toLocaleDateString()} • {booking.bookingTime}</div>
                        </div>
                    </div>
                    
                    <div className="text-end d-flex flex-column gap-2 align-items-end">
                        <span className="status-badge-modern" style={{ background: style.bg, color: style.color }}>
                            {booking.status}
                        </span>
                        {booking.totalAmount > 0 && <span className="fw-bold fs-5 text-dark">₹{booking.totalAmount}</span>}
                    </div>
                    
                    <div className="w-100 border-top pt-2 mt-2 d-flex gap-2 justify-content-end align-items-center">
                         <Button variant="light" size="sm" className="rounded-pill px-3 fw-bold text-muted" onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}>
                            View Details
                         </Button>
                         
                         {/* Payment Button */}
                         {booking.status === 'COMPLETED' && !booking.isPaid && (
                            <Button variant="dark" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => handlePaymentClick(booking)}>
                                Pay Now
                            </Button>
                         )}
                         {booking.status === 'COMPLETED' && booking.isPaid && (
                             <span className="text-success small fw-bold d-flex align-items-center gap-1 mx-2">
                                <CheckCircleFill /> Paid
                             </span>
                         )}
                         
                         {/* Review Button & Logic */}
                         {booking.status === 'COMPLETED' && !booking.hasReviewed && (
                            <Button variant="primary" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => { setSelectedBooking(booking); setShowReviewModal(true); }}>
                                Review
                            </Button>
                         )}
                         {booking.status === 'COMPLETED' && booking.hasReviewed && (
                             <span className="text-primary small fw-bold d-flex align-items-center gap-1 mx-2">
                                <StarFill /> Reviewed
                             </span>
                         )}
                    </div>
                </div>
            </Col>
        );
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" /> Loading bookings...</div>;

    const pendingBookings = bookings.filter(b => b.status === 'PENDING');
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS');
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                 <h4 className="fw-bold m-0">My Bookings</h4>
                 <Badge bg="light" text="dark" className="border">Total: {bookings.length}</Badge>
            </div>
            
            {bookings.length === 0 ? (
                 <div className="text-center py-5 opacity-50">
                    <div className="display-1 mb-3">🎫</div>
                    <h5>No active bookings found</h5>
                    <p>When you book a service, it will appear here.</p>
                 </div>
            ) : (
                <Tabs defaultActiveKey="all" className="custom-tabs mb-4 border-bottom-0" variant="pills">
                    <Tab eventKey="all" title="All">
                        <Row>{bookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}</Row>
                    </Tab>
                    <Tab eventKey="pending" title="Pending">
                        <Row>{pendingBookings.length > 0 ? pendingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />) : <div className="text-center p-4 text-muted">No pending bookings</div>}</Row>
                    </Tab>
                    <Tab eventKey="active" title="Active">
                        <Row>{confirmedBookings.length > 0 ? confirmedBookings.map(booking => <BookingCard key={booking.id} booking={booking} />) : <div className="text-center p-4 text-muted">No active bookings</div>}</Row>
                    </Tab>
                    <Tab eventKey="completed" title="Completed">
                        <Row>{completedBookings.length > 0 ? completedBookings.map(booking => <BookingCard key={booking.id} booking={booking} />) : <div className="text-center p-4 text-muted">No completed bookings</div>}</Row>
                    </Tab>
                </Tabs>
            )}

            {/* Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
                <Modal.Header closeButton><Modal.Title className="fw-bold">Booking Details</Modal.Title></Modal.Header>
                <Modal.Body>
                    {selectedBooking && (
                        <div>
                            <div className="p-3 bg-light rounded mb-3">
                                <h6 className="fw-bold mb-1">{selectedBooking.serviceType}</h6>
                                <p className="mb-0 text-muted small">Status: {selectedBooking.status}</p>
                            </div>
                            <ListGroup variant="flush" className="small">
                                <ListGroup.Item className="d-flex justify-content-between"><span>Provider:</span> <strong>{selectedBooking.providerName}</strong></ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between"><span>Date:</span> <strong>{new Date(selectedBooking.bookingDate).toLocaleDateString()}</strong></ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between"><span>Time:</span> <strong>{selectedBooking.bookingTime}</strong></ListGroup.Item>
                                {selectedBooking.address && (
                                    <ListGroup.Item>
                                        <div className="text-muted mb-1">Location:</div>
                                        <div>{selectedBooking.address.address}, {selectedBooking.address.city}</div>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Payment & Review Modals */}
            <ReviewModal show={showReviewModal} onHide={() => setShowReviewModal(false)} booking={selectedBooking} onReviewSubmitted={fetchUserBookings} />
            <PaymentModal show={showPaymentModal} onHide={() => { setShowPaymentModal(false); setSelectedBooking(null); setPaymentAmount(0); }} booking={selectedBooking} amount={paymentAmount} onPaymentSuccess={() => { fetchUserBookings(); setShowPaymentModal(false); }} />
            
            <Modal show={showAmountModal} onHide={() => setShowAmountModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Payment Amount</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Enter agreed amount (₹)</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control type="number" placeholder="0.00" value={paymentAmount} onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)} min="1" autoFocus />
                        </InputGroup>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAmountModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAmountSubmit}>Proceed</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

function MyAddresses({ user }) {
    const [addresses, setAddresses] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editAddress, setEditAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', address: '', city: '', state: '', pincode: '', isDefault: false });
    
    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            const data = await addressService.getAddresses();
            setAddresses(data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            if (editAddress) {
                await addressService.updateAddress(editAddress.id, formData);
            } else {
                await addressService.addAddress(formData);
            }
            setShowAddModal(false);
            setEditAddress(null);
            setFormData({ name: '', address: '', city: '', state: '', pincode: '', isDefault: false });
            loadAddresses();
        } catch (e) { alert("Failed to save address"); } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Delete this address?")) {
            await addressService.deleteAddress(id);
            loadAddresses();
        }
    };

    const openEdit = (addr) => {
        setEditAddress(addr);
        setFormData({ name: addr.name, address: addr.address, city: addr.city, state: addr.state, pincode: addr.pincode, isDefault: addr.isDefault });
        setShowAddModal(true);
    };

    return (
        <div>
             <div className="d-flex justify-content-between align-items-center mb-4">
                 <h4 className="fw-bold m-0">Saved Addresses</h4>
                 <Button variant="primary" className="rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}} onClick={() => { setEditAddress(null); setFormData({name: '', address: '', city: '', state: '', pincode: '', isDefault: false}); setShowAddModal(true); }}>
                    <span className="fs-4 lh-1">+</span>
                 </Button>
            </div>
            
            {loading && addresses.length === 0 && <div className="text-center"><Spinner animation="border" size="sm"/></div>}

            <Row>
                {addresses.map(addr => (
                    <Col md={6} key={addr.id} className="mb-3">
                        <div className={`glass-card p-4 h-100 position-relative ${addr.isDefault ? 'border-primary' : ''}`} style={{borderWidth: addr.isDefault ? '2px' : '1px'}}>
                            {addr.isDefault && <Badge bg="primary" className="position-absolute top-0 end-0 m-3">Default</Badge>}
                            <h6 className="fw-bold mb-2 text-dark"><Icons.GeoAlt /> {addr.name}</h6>
                            <p className="text-muted small mb-3">
                                {addr.address}<br/>
                                {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <div className="d-flex gap-2 border-top pt-3">
                                <Button variant="outline-dark" size="sm" className="rounded-pill px-3 flex-grow-1" onClick={() => openEdit(addr)}>Edit</Button>
                                <Button variant="outline-danger" size="sm" className="rounded-pill px-3 flex-grow-1" onClick={() => handleDelete(addr.id)}>Delete</Button>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>{editAddress ? 'Edit Address' : 'New Address'}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3"><Form.Label>Label (Home/Work)</Form.Label><Form.Control type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Address Line</Form.Label><Form.Control as="textarea" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></Form.Group>
                        <Row>
                            <Col><Form.Group className="mb-3"><Form.Label>City</Form.Label><Form.Control type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></Form.Group></Col>
                            <Col><Form.Group className="mb-3"><Form.Label>State</Form.Label><Form.Control type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} /></Form.Group></Col>
                        </Row>
                        <Form.Group className="mb-3"><Form.Label>Pincode</Form.Label><Form.Control type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} /></Form.Group>
                        <Form.Check type="checkbox" label="Set as default address" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>{loading ? 'Saving...' : 'Save Address'}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

function AdminPanel({ user }) {
    const [stats, setStats] = useState({ totalUsers: 0, totalProviders: 0, totalBookings: 0, revenue: 0 });

    useEffect(() => {
        // Mock stats or fetch real ones
        api.get('/admin/stats').then(res => setStats(res.data)).catch(err => console.log("Stats error or not implemented"));
    }, []);

    return (
        <div>
            <h4 className="fw-bold mb-4">Admin Dashboard</h4>
            <Row className="g-3 mb-4">
                <Col md={3}>
                    <div className="glass-card p-3 text-center hover-effect h-100">
                        <small className="text-uppercase text-muted fw-bold" style={{fontSize:'0.7rem'}}>Total Users</small>
                        <div className="display-6 fw-bold text-primary mt-1">{stats.totalUsers}</div>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="glass-card p-3 text-center hover-effect h-100">
                        <small className="text-uppercase text-muted fw-bold" style={{fontSize:'0.7rem'}}>Providers</small>
                        <div className="display-6 fw-bold text-success mt-1">{stats.totalProviders}</div>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="glass-card p-3 text-center hover-effect h-100">
                        <small className="text-uppercase text-muted fw-bold" style={{fontSize:'0.7rem'}}>Bookings</small>
                        <div className="display-6 fw-bold text-warning mt-1">{stats.totalBookings}</div>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="glass-card p-3 text-center hover-effect h-100">
                        <small className="text-uppercase text-muted fw-bold" style={{fontSize:'0.7rem'}}>Revenue</small>
                        <div className="display-6 fw-bold text-info mt-1">₹{stats.revenue}</div>
                    </div>
                </Col>
            </Row>
            
            <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-white border-0 pt-4 px-4">
                    <h5 className="fw-bold">Pending Verifications</h5>
                </Card.Header>
                <Card.Body>
                    <Verifications />
                </Card.Body>
            </Card>
        </div>
    )
}

export default Profile;