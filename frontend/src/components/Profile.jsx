import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Tab, Tabs, Badge, ListGroup, Modal, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { addressService } from './AddressService';
import { bookingService } from './BookingService';
import Verifications from './Verifications';
import ReviewModal from './ReviewModal';
import PaymentModal from './PaymentModal';
import axios from 'axios';
import { 
    Star, StarFill, GeoAlt, Telephone, Clock, 
    Cash, ShieldCheck, ArrowLeft, CheckCircleFill, PersonCircle, 
    CalendarEvent, CreditCard
} from 'react-bootstrap-icons';


// --- Zero-Dependency Icons (Inline SVGs) ---
const Icons = {
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Person: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  GeoAlt: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  CheckCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  XCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  ClockHistory: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>,
  CreditCard: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Cash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/><path d="M8 15h.01"/><path d="M16 15h.01"/></svg>,
  StarFill: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Telephone: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Envelope: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
};

// --- Custom CSS ---
const customStyles = `
  .profile-bg {
    background-color: #f8f9fa;
    min-height: 100vh;
    padding-bottom: 40px;
  }
  .card-hover {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  }
  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  }
  .avatar-container {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 auto 15px;
    box-shadow: 0 10px 20px rgba(13, 110, 253, 0.2);
  }
  .custom-tabs .nav-link {
    border: none;
    color: #6c757d;
    font-weight: 500;
    padding: 12px 20px;
    border-radius: 8px;
    transition: all 0.2s;
  }
  .custom-tabs .nav-link.active {
    background-color: #0d6efd;
    color: white;
    box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
  }
  .custom-tabs .nav-link:hover:not(.active) {
    background-color: #e9ecef;
    color: #0d6efd;
  }
  .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .info-label {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #adb5bd;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .info-value {
    font-weight: 500;
    color: #212529;
  }
  .sidebar-sticky {
    position: sticky;
    top: 90px; 
    z-index: 100;
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
      // Fallback to localStorage if API fails
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

  if (loading) {
    return (
      <Container className="mt-5 pt-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Loading profile...</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="mt-5">        
        <Alert variant="warning" className="shadow-sm border-0">
          <Alert.Heading>Authentication Required</Alert.Heading>
          <p>You need to be logged in to view your profile.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="warning" onClick={() => navigate('/login')}>
              Login Now
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="profile-bg">
      <style>{customStyles}</style>
            {/* --- Back to Home Button --- */}
      <Button 
        variant="light" 
        className="position-absolute top-0 start-0 m-3 shadow-sm rounded-pill d-flex align-items-center fw-bold text-secondary border-0"
        onClick={() => navigate('/')}
        style={{ zIndex: 1000, fontSize: '0.9rem', padding: '8px 16px', background: 'rgba(255,255,255,0.9)' }}
      >
        <ArrowLeft className="me-2" size={18} /> Home
      </Button>

      {/* Header Background */}
      <div style={{ background: '#fff', padding: '40px 0 20px', borderBottom: '1px solid #eee', marginBottom: '30px' }}>
        <Container>
          <h1 className="fw-bold mb-1">My Account</h1>
          <p className="text-muted mb-0">Manage your personal information and activity</p>
        </Container>
      </div>

      <Container>
        <Row>
          {/* Sidebar */}
          <Col lg={4} className="mb-4">
            <div className="sidebar-sticky">
              <UserProfileCard user={user} onUserUpdate={updateUserInStorage} />
            </div>
          </Col>

          {/* Main Content */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <Card.Header className="bg-white border-bottom p-0">
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="custom-tabs border-0 p-3"
                  variant="pills"
                >
                  <Tab eventKey="profile" title="Profile Info">
                    <div className="p-4">
                      <ProfileInfo user={user} onUserUpdate={updateUserInStorage} />
                    </div>
                  </Tab>

                  {(user.role === 'PROVIDER' || user.role === 'USER') && (
                    <Tab eventKey="bookings" title="Bookings">
                      <div className="p-4 bg-light bg-opacity-25">
                        <MyBookings user={user} />
                      </div>
                    </Tab>
                  )}

                  {user.role === 'ADMIN' && (
                    <Tab eventKey="admin" title="Admin Panel">
                      <div className="p-4">
                        <AdminPanel user={user} />
                      </div>
                    </Tab>
                  )}
                  
                  {(user.role === 'PROVIDER' || user.role === 'USER') && (
                    <Tab eventKey="addresses" title="Addresses">
                      <div className="p-4">
                        <MyAddresses user={user} />
                      </div>
                    </Tab>
                  )}
                </Tabs>
              </Card.Header>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

// User Profile Card Component
function UserProfileCard({ user, onUserUpdate }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'PROVIDER': return 'info';
      default: return 'primary';
    }
  };

  // Show setup reminder for new providers without service details
  const showProviderSetupReminder = user?.role === 'PROVIDER' && 
    (!user.serviceCharge && !user.experience);

  return (
    <>
      <Card className="card-hover border-0">
        <Card.Body className="text-center p-4">
          {/* Profile Avatar */}
          <div className="avatar-container">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <h4 className="fw-bold mb-1">{user.name}</h4>
          <Badge bg={getRoleBadgeVariant(user.role)} className="mb-4 px-3 py-2 rounded-pill">
            {user.role}
          </Badge>

          {/* Setup reminder for new providers */}
          {showProviderSetupReminder && (
            <Alert variant="info" className="small py-2 mb-3 border-0 bg-info bg-opacity-10 text-info">
              <strong>Complete Profile!</strong> Add details to get bookings.
            </Alert>
          )}

          <ListGroup variant="flush" className="text-start mb-4">
            <ListGroup.Item className="border-0 px-0 py-2 d-flex align-items-center">
              <div className="bg-light rounded-circle p-2 me-3 text-primary"><Icons.Envelope /></div>
              <div>
                <div className="info-label">Email</div>
                <div className="info-value">{user.email}</div>
              </div>
            </ListGroup.Item>
            
            <ListGroup.Item className="border-0 px-0 py-2 d-flex align-items-center">
              <div className="bg-light rounded-circle p-2 me-3 text-primary"><Icons.Telephone /></div>
              <div>
                <div className="info-label">Phone</div>
                <div className="info-value">{user.phone}</div>
              </div>
            </ListGroup.Item>

            {user.serviceType && (
              <ListGroup.Item className="border-0 px-0 py-2 d-flex align-items-center">
                <div className="bg-light rounded-circle p-2 me-3 text-primary"><Icons.Person /></div>
                <div>
                  <div className="info-label">Service Type</div>
                  <div className="info-value">{user.serviceType}</div>
                </div>
              </ListGroup.Item>
            )}
            
            {user.serviceCharge && (
              <ListGroup.Item className="border-0 px-0 py-2 d-flex align-items-center">
                <div className="bg-light rounded-circle p-2 me-3 text-primary"><Icons.Cash /></div>
                <div>
                  <div className="info-label">Rate</div>
                  <div className="info-value">₹{user.serviceCharge}/hour</div>
                </div>
              </ListGroup.Item>
            )}
            
            {user.rating > 0 && (
              <ListGroup.Item className="border-0 px-0 py-2 d-flex align-items-center">
                <div className="bg-light rounded-circle p-2 me-3 text-warning"><Icons.StarFill /></div>
                <div>
                  <div className="info-label">Rating</div>
                  <div className="info-value">{user.rating} ({user.totalRatings || 0} reviews)</div>
                </div>
              </ListGroup.Item>
            )}
          </ListGroup>

          <div className="d-grid gap-2">
            <Button
              variant="outline-danger"
              className="rounded-pill py-2 border-2 fw-bold"
              onClick={() => setShowLogoutModal(true)}
            >
              Log Out
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          Are you sure you want to end your session?
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Yes, Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

// Profile Information Component
function ProfileInfo({ user, onUserUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    serviceType: user.serviceType || '',
    serviceCharge: user.serviceCharge || '',
    experience: user.experience || ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Validate provider fields
      if (user.role === 'PROVIDER') {
        if (formData.serviceCharge && parseFloat(formData.serviceCharge) < 0) {
          setError('Service charge cannot be negative.');
          setLoading(false);
          return;
        }
        if (formData.experience && parseInt(formData.experience) < 0) {
          setError('Experience cannot be negative.');
          setLoading(false);
          return;
        }
      }

      const updateData = {
        name: formData.name,
        phone: formData.phone,
        ...(user.role === 'PROVIDER' && {
          serviceType: formData.serviceType,
          serviceCharge: formData.serviceCharge ? parseFloat(formData.serviceCharge) : null,
          experience: formData.experience ? parseInt(formData.experience) : null
        })
      };

      const response = await api.put('/users/profile', updateData);
      
      setMessage('Profile updated successfully!');
      
      // Update local user data
      const updatedUser = { 
        ...user, 
        ...updateData,
        serviceCharge: updateData.serviceCharge,
        experience: updateData.experience
      };
      onUserUpdate(updatedUser);

      setEditMode(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Update error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      serviceType: user.serviceType || '',
      serviceCharge: user.serviceCharge || '',
      experience: user.experience || ''
    });
    setEditMode(false);
    setError('');
    setMessage('');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold m-0 text-primary">Personal Information</h5>
        <Button
          variant={editMode ? "light" : "outline-primary"}
          size="sm"
          className="rounded-pill px-3"
          onClick={() => setEditMode(!editMode)}
          disabled={loading}
        >
          {editMode ? 'Cancel Edit' : 'Edit Profile'}
        </Button>
      </div>

      {message && <Alert variant="success" className="border-0 shadow-sm"><Icons.CheckCircle /> {message}</Alert>}
      {error && <Alert variant="danger" className="border-0 shadow-sm"><Icons.XCircle /> {error}</Alert>}

      {editMode ? (
        <Form onSubmit={handleSubmit} className="bg-light p-4 rounded-3">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>

          {user.role === 'PROVIDER' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Service Type</Form.Label>
                <Form.Control
                  type="text"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Plumber, Electrician, Tutor"
                  disabled={loading}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Service Charge (₹/hour)</Form.Label>
                    <Form.Control
                      type="number"
                      name="serviceCharge"
                      value={formData.serviceCharge}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="e.g., 500"
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Experience (Years)</Form.Label>
                    <Form.Control
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g., 5"
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          <div className="d-flex gap-2 mt-3 justify-content-end">
            <Button variant="white" onClick={handleCancelEdit} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading} className="px-4">
              {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
            </Button>
          </div>
        </Form>
      ) : (
        <Row className="g-4">
          <Col md={6}>
            <div className="p-3 border rounded bg-white h-100">
              <div className="info-label">Name</div>
              <div className="fw-medium">{user.name}</div>
            </div>
          </Col>
          <Col md={6}>
            <div className="p-3 border rounded bg-white h-100">
              <div className="info-label">Email</div>
              <div className="fw-medium">{user.email}</div>
            </div>
          </Col>
          <Col md={6}>
            <div className="p-3 border rounded bg-white h-100">
              <div className="info-label">Phone</div>
              <div className="fw-medium">{user.phone}</div>
            </div>
          </Col>
          <Col md={6}>
            <div className="p-3 border rounded bg-white h-100">
              <div className="info-label">Role</div>
              <div>
                <Badge bg={user.role === 'ADMIN' ? 'danger' : user.role === 'PROVIDER' ? 'info' : 'primary'}>
                  {user.role}
                </Badge>
              </div>
            </div>
          </Col>
          
          {user.role === 'PROVIDER' && (
            <>
              <Col md={6}>
                <div className="p-3 border rounded bg-white h-100">
                  <div className="info-label">Service Type</div>
                  <div className="fw-medium">{user.serviceType || 'Not specified'}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="p-3 border rounded bg-white h-100">
                  <div className="info-label">Service Charge</div>
                  <div className="fw-medium text-success">
                    {user.serviceCharge ? `₹${user.serviceCharge}/hour` : <span className="text-muted fst-italic">Not set</span>}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="p-3 border rounded bg-white h-100">
                  <div className="info-label">Experience</div>
                  <div className="fw-medium">
                    {user.experience ? `${user.experience} years` : <span className="text-muted fst-italic">Not specified</span>}
                  </div>
                </div>
              </Col>
            </>
          )}
        </Row>
      )}
    </div>
  );
}

function MyBookings({ user }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
    const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [showAmountModal, setShowAmountModal] = useState(false);

    useEffect(() => {
        fetchUserBookings();
    }, []);

    const fetchUserBookings = async () => {
        try {
            setLoading(true);
            setError('');
            const bookingsData = await bookingService.getUserBookingsWithReviews();
            setBookings(bookingsData);
        } catch (err) {
            setError('Failed to load your bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmitted = () => {
        fetchUserBookings();
    };

    const handlePaymentSuccess = (paymentData) => {
        console.log('Payment successful:', paymentData);
        fetchUserBookings();
        alert('Payment completed successfully! Booking confirmed.');
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': { variant: 'warning', text: 'Pending', icon: <Icons.ClockHistory /> },
            'CONFIRMED': { variant: 'success', text: 'Confirmed', icon: <Icons.CheckCircle /> },
            'IN_PROGRESS': { variant: 'info', text: 'In Progress', icon: <Icons.Clock /> },
            'COMPLETED': { variant: 'primary', text: 'Completed', icon: <Icons.CheckCircle /> },
            'CANCELLED': { variant: 'danger', text: 'Cancelled', icon: <Icons.XCircle /> },
            'REJECTED': { variant: 'secondary', text: 'Rejected', icon: <Icons.XCircle /> },
            'PAYMENT_PENDING': { variant: 'warning', text: 'Payment Pending', icon: <Icons.CreditCard /> }
        };

        const config = statusConfig[status] || { variant: 'secondary', text: status };
        return (
            <div className={`status-badge bg-${config.variant} bg-opacity-10 text-${config.variant} border border-${config.variant}`}>
                {config.icon} {config.text}
            </div>
        );
    };

    const getStatusMessage = (status) => {
        const messages = {
            'PENDING': 'Your booking is pending confirmation from the service provider.',
            'CONFIRMED': 'Your booking has been confirmed! The service provider will contact you soon.',
            'IN_PROGRESS': 'Your service is currently in progress.',
            'COMPLETED': 'Service completed successfully. Please proceed with payment.',
            'CANCELLED': 'This booking has been cancelled.',
            'REJECTED': 'Sorry, the service provider was unable to accept your booking.',
            'PAYMENT_PENDING': 'Service completed. Please complete the payment to confirm your booking.'
        };
        return messages[status] || '';
    };

    const canReviewBooking = (booking) => {
        return booking.status === 'COMPLETED' && !booking.hasReviewed;
    };

    const canMakePayment = (booking) => {
        return booking.status === 'COMPLETED' && !booking.isPaid;
    };

    const handlePaymentClick = (booking) => {
        setSelectedBookingForPayment(booking);
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

    const renderPaymentButton = (booking) => {
        if (canMakePayment(booking)) {
            return (
                <Button variant="warning" size="sm" className="w-100 mt-2 fw-bold text-dark" onClick={() => handlePaymentClick(booking)}>
                    <Icons.CreditCard /> Pay Now
                </Button>
            );
        } else if (booking.isPaid) {
            return (
                <div className="mt-2 w-100 text-center text-success small fw-bold bg-success bg-opacity-10 py-1 rounded">
                    <Icons.CheckCircle /> Paid
                </div>
            );
        }
        return null;
    };

    const renderReviewButton = (booking) => {
        if (canReviewBooking(booking)) {
            return (
                <Button variant="success" size="sm" className="w-100 mt-2" onClick={() => {
                    setSelectedBookingForReview(booking);
                    setShowReviewModal(true);
                }}>
                    <Icons.StarFill /> Rate & Review
                </Button>
            );
        } else if (booking.status === 'COMPLETED' && booking.hasReviewed) {
            return (
                <div className="mt-2 w-100 text-center text-primary small fw-bold bg-primary bg-opacity-10 py-1 rounded">
                    <Icons.CheckCircle /> Reviewed
                </div>
            );
        }
        return null;
    };

    const pendingBookings = bookings.filter(b => b.status === 'PENDING');
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS');
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');

    const BookingCard = ({ booking }) => (
        <Col md={6} lg={6} className="mb-4">
            <Card className="card-hover h-100 border-0 shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <h6 className="fw-bold text-dark mb-0">{booking.serviceType}</h6>
                        {getStatusBadge(booking.status)}
                    </div>

                    <div className="mb-3 small">
                        <div className="d-flex align-items-center mb-2 text-muted">
                            <Icons.Person /> <span className="ms-2">{booking.providerName}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2 text-muted">
                            <Icons.Calendar /> <span className="ms-2">{new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}</span>
                        </div>
                        {booking.totalAmount > 0 && (
                            <div className="d-flex align-items-center text-success fw-bold">
                                <Icons.Cash /> <span className="ms-2">₹{booking.totalAmount}</span>
                            </div>
                        )}
                    </div>

                    <div className="d-grid gap-2">
                        <Button variant="light" size="sm" className="text-primary fw-medium" onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetailModal(true);
                        }}>
                            View Details
                        </Button>
                        {renderPaymentButton(booking)}
                        {renderReviewButton(booking)}
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );

    if (loading) return <div className="text-center py-5"><Spinner animation="border" size="sm" /> Loading...</div>;

    return (
        <div>
            {error && <Alert variant="danger">{error}</Alert>}

            {bookings.length === 0 ? (
                <div className="text-center py-5">
                    <div className="display-4 text-muted mb-3 opacity-50"><Icons.Calendar /></div>
                    <h5>No Bookings Yet</h5>
                    <p className="text-muted">You haven't made any service bookings yet.</p>
                </div>
            ) : (
                <Tabs defaultActiveKey="all" className="custom-tabs mb-4 border-bottom-0" variant="pills">
                    <Tab eventKey="all" title="All">
                        <Row>{bookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}</Row>
                    </Tab>
                    <Tab eventKey="pending" title="Pending">
                        <Row>{pendingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}</Row>
                    </Tab>
                    <Tab eventKey="confirmed" title="Active">
                        <Row>{confirmedBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}</Row>
                    </Tab>
                    <Tab eventKey="completed" title="Completed">
                        <Row>{completedBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}</Row>
                    </Tab>
                </Tabs>
            )}

            {/* Booking Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Booking Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    {selectedBooking && (
                        <>
                            <div className="mb-4 p-3 bg-light rounded">
                                <div className="d-flex justify-content-between align-items-center">
                                    {getStatusBadge(selectedBooking.status)}
                                    <span className="small text-muted">{new Date(selectedBooking.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="mt-2 mb-0 small text-muted">{getStatusMessage(selectedBooking.status)}</p>
                            </div>

                            <Row className="g-4">
                                <Col md={6}>
                                    <h6 className="fw-bold text-primary mb-3">Service Info</h6>
                                    <ListGroup variant="flush" className="small">
                                        <ListGroup.Item className="d-flex justify-content-between px-0">
                                            <span className="text-muted">Type</span>
                                            <span className="fw-medium">{selectedBooking.serviceType}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between px-0">
                                            <span className="text-muted">Date</span>
                                            <span className="fw-medium">{new Date(selectedBooking.bookingDate).toLocaleDateString()}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between px-0">
                                            <span className="text-muted">Time</span>
                                            <span className="fw-medium">{selectedBooking.bookingTime}</span>
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Col>
                                <Col md={6}>
                                    <h6 className="fw-bold text-primary mb-3">Provider Info</h6>
                                    <ListGroup variant="flush" className="small">
                                        <ListGroup.Item className="d-flex justify-content-between px-0">
                                            <span className="text-muted">Name</span>
                                            <span className="fw-medium">{selectedBooking.providerName}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between px-0">
                                            <span className="text-muted">Contact</span>
                                            <span className="fw-medium">{selectedBooking.providerPhone}</span>
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Col>
                            </Row>
                            
                            {selectedBooking.address && (
                                <div className="mt-4 p-3 border rounded bg-white">
                                    <h6 className="fw-bold mb-2 small text-uppercase text-muted"><Icons.GeoAlt /> Location</h6>
                                    <div className="small">
                                        <strong>{selectedBooking.address.name}</strong><br />
                                        {selectedBooking.address.address}<br />
                                        {selectedBooking.address.city}, {selectedBooking.address.pincode}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
                    {selectedBooking && renderPaymentButton(selectedBooking)}
                </Modal.Footer>
            </Modal>

            <ReviewModal show={showReviewModal} onHide={() => setShowReviewModal(false)} booking={selectedBookingForReview} onReviewSubmitted={handleReviewSubmitted} />
            <PaymentModal show={showPaymentModal} onHide={() => { setShowPaymentModal(false); setSelectedBookingForPayment(null); setPaymentAmount(0); }} booking={selectedBookingForPayment} amount={paymentAmount} onPaymentSuccess={handlePaymentSuccess} />
            
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    loadAddresses();
  }, [user.id]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const addressesData = await addressService.getAddresses();
      setAddresses(addressesData);
      setError('');
    } catch (err) {
      setError('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      setLoading(true);
      const newAddress = await addressService.addAddress(formData);
      setAddresses(prev => [...prev, newAddress]);
      setShowAddModal(false);
      resetForm();
      setSuccess('Address added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditAddress(address);
    setFormData({
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setShowAddModal(true);
  };

  const handleUpdateAddress = async () => {
    try {
      setLoading(true);
      const updatedAddress = await addressService.updateAddress(editAddress.id, formData);
      setAddresses(prev => prev.map(addr => 
        addr.id === editAddress.id ? updatedAddress : addr
      ));
      setShowAddModal(false);
      setEditAddress(null);
      resetForm();
      setSuccess('Address updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        setLoading(true);
        await addressService.deleteAddress(id);
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        setSuccess('Address deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete address');
      } finally {
        setLoading(false);
      }
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      setLoading(true);
      const updatedAddress = await addressService.setDefaultAddress(id);
      setAddresses(prev => prev.map(addr => 
        addr.id === id ? updatedAddress : { ...addr, isDefault: false }
      ));
      setSuccess('Default address updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set default');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditAddress(null);
    resetForm();
    setError('');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold m-0 text-primary">Saved Addresses</h5>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)} disabled={loading} className="rounded-pill px-3">
          + Add New
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {loading && addresses.length === 0 ? (
        <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-5 border rounded bg-light">
          <div className="display-4 text-muted mb-2 opacity-50"><Icons.GeoAlt /></div>
          <h6>No Addresses Found</h6>
          <p className="small text-muted">Add an address to checkout faster.</p>
        </div>
      ) : (
        <Row>
          {addresses.map((address) => (
            <Col md={6} key={address.id} className="mb-3">
              <Card className={`card-hover h-100 ${address.isDefault ? 'border-primary border-2 shadow-sm' : 'border shadow-sm'}`}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold mb-0">{address.name}</h6>
                    {address.isDefault && <Badge bg="primary">Default</Badge>}
                  </div>
                  <p className="mb-2 small text-muted" style={{ minHeight: '40px' }}>
                    {address.address}<br />
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <div className="d-flex gap-2 pt-2 border-top mt-3">
                    <Button variant="light" size="sm" className="flex-fill" onClick={() => handleEditAddress(address)}>Edit</Button>
                    {!address.isDefault && (
                        <>
                            <Button variant="light" size="sm" className="flex-fill" onClick={() => setDefaultAddress(address.id)}>Set Default</Button>
                            <Button variant="light" size="sm" className="text-danger flex-fill" onClick={() => handleDeleteAddress(address.id)}>Delete</Button>
                        </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showAddModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editAddress ? 'Edit Address' : 'Add New Address'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Label</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Home, Work" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} placeholder="Street, House No." required />
            </Form.Group>
            <Row>
              <Col><Form.Group className="mb-3"><Form.Label>City</Form.Label><Form.Control type="text" name="city" value={formData.city} onChange={handleChange} required /></Form.Group></Col>
              <Col><Form.Group className="mb-3"><Form.Label>State</Form.Label><Form.Control type="text" name="state" value={formData.state} onChange={handleChange} required /></Form.Group></Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Pincode</Form.Label>
              <Form.Control type="text" name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6} required />
            </Form.Group>
            <Form.Check type="checkbox" name="isDefault" label="Set as default address" checked={formData.isDefault} onChange={handleChange} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
          <Button variant="primary" onClick={editAddress ? handleUpdateAddress : handleAddAddress} disabled={loading}>
            {loading ? 'Saving...' : 'Save Address'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// Admin Panel Component
function AdminPanel({ user }) {
  const [key, setKey] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalProviders: 0, totalBookings: 0, revenue: 0 });

  useEffect(() => {
     const fetchStats = async () => {
       try {
         const response = await api.get('/admin/stats');
         setStats(response.data);
       } catch (error) {
         console.error("Error fetching admin stats:", error);
       } finally {
         setLoading(false);
       }
     };
     fetchStats();
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  const StatCard = ({ title, value, color, icon }) => (
      <Card className={`border-0 bg-${color} bg-gradient text-white h-100 shadow-sm`}>
          <Card.Body>
              <div className="display-6 fw-bold mb-1">{value}</div>
              <div className="opacity-75 small text-uppercase fw-bold">{title}</div>
          </Card.Body>
      </Card>
  );

  return (
    <div>
      <h5 className="fw-bold mb-4 text-primary">Admin Dashboard</h5>
      <Tabs id="admin-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="custom-tabs mb-4" variant="pills">
        <Tab eventKey="overview" title="Overview">
          <Row className="g-3 mb-4">
            <Col md={3}><StatCard title="Total Users" value={stats.totalUsers} color="primary" /></Col>
            <Col md={3}><StatCard title="Providers" value={stats.totalProviders} color="success" /></Col>
            <Col md={3}><StatCard title="Bookings" value={stats.totalBookings} color="warning" /></Col>
            <Col md={3}><StatCard title="Revenue" value={`₹${stats.revenue}`} color="info" /></Col>
          </Row>
          
          <Row>
            <Col md={6}>
                <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                        <h6 className="fw-bold mb-3">Quick Actions</h6>
                        <Button variant="outline-primary" className="w-100 mb-2" onClick={() => setKey('verifications')}>Manage Pending Verifications</Button>
                        <Button variant="outline-secondary" className="w-100" disabled>View Reports (Coming Soon)</Button>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                        <h6 className="fw-bold mb-3">System Health</h6>
                        <Alert variant="success" className="mb-0 border-0 bg-success bg-opacity-10"><Icons.CheckCircle /> System Online & Running</Alert>
                    </Card.Body>
                </Card>
            </Col>
          </Row>
        </Tab>
        <Tab eventKey="verifications" title="Pending Verifications">
           <Verifications />
        </Tab>
      </Tabs>
    </div>
  );
}

export default Profile;