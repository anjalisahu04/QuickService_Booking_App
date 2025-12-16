// import React, { useState, useEffect } from 'react';
// import {
//     Container, Row, Col, Card, Button, Badge, Alert, Spinner,
//     Form, Modal, ProgressBar
// } from 'react-bootstrap';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { 
//     Star, StarFill, GeoAlt, Telephone, Clock, 
//     Cash, ShieldCheck, ArrowLeft, CheckCircleFill, PersonCircle, 
//     CalendarEvent, CreditCard
// } from 'react-bootstrap-icons';
// import axios from 'axios';
// import { reviewService } from './ReviewService';
// import './ServiceProviderDetails.css'; 



// const api = axios.create({
//     baseURL: 'http://localhost:8080/api',
// });

// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

// function ServiceProviderDetails() {
//     const { providerId } = useParams();
//     const navigate = useNavigate();
//     // eslint-disable-next-line no-unused-vars
//     const location = useLocation();
    
//     const [provider, setProvider] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [reviews, setReviews] = useState([]);
//     const [reviewsLoading, setReviewsLoading] = useState(false); 
//     const [showBookingModal, setShowBookingModal] = useState(false);
//     const [userAddresses, setUserAddresses] = useState([]);
//     const [selectedAddress, setSelectedAddress] = useState('');
//     const [bookingDate, setBookingDate] = useState('');
//     const [bookingTime, setBookingTime] = useState('');
//     const [serviceDescription, setServiceDescription] = useState('');
//     const [bookingNotes, setBookingNotes] = useState('');
//     const [bookingLoading, setBookingLoading] = useState(false);
//     const [bookingError, setBookingError] = useState('');
//     const [bookingSuccess, setBookingSuccess] = useState('');

//     const renderStars = (rating) => {
//         const stars = [];
//         const fullStars = Math.floor(rating);
//         for (let i = 0; i < 5; i++) {
//             if (i < fullStars) {
//                 stars.push(<StarFill key={i} className="text-warning me-1" size={14}/>);
//             } else {
//                 stars.push(<Star key={i} className="text-muted me-1 opacity-25" size={14}/>);
//             }
//         }
//         return <div className="d-flex align-items-center">{stars}</div>;
//     };

//     useEffect(() => {
//         fetchProviderDetails();
//         fetchProviderReviews();
//         loadUserAddresses();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [providerId]);

//     const fetchProviderDetails = async () => {
//         try {
//             setLoading(true);
//             const response = await api.get(`/providers/${providerId}/details`);
//             setProvider(response.data);
//         } catch (err) {
//             setError('Failed to load provider details');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchProviderReviews = async () => {
//         try {
//             setReviewsLoading(true);
//             const result = await reviewService.getProviderReviews(providerId);
//             if (result.success) {
//                 setReviews(result.data.reviews || result.data);
//             } else {
//                 setReviews([]);
//             }
//         } catch (err) {
//             console.error('Error loading reviews:', err);
//             setReviews([]);
//         } finally {
//             setReviewsLoading(false);
//         }
//     };

//     const loadUserAddresses = async () => {
//         try {
//             const response = await api.get('/addresses');
//             setUserAddresses(response.data);
//             const defaultAddress = response.data.find(addr => addr.isDefault);
//             if (defaultAddress) {
//                 setSelectedAddress(defaultAddress.id);
//             } else if (response.data.length > 0) {
//                 setSelectedAddress(response.data[0].id);
//             }
//         } catch (err) {
//             console.error('Error loading addresses:', err);
//         }
//     };

//     const handleBookService = () => {
//         if (userAddresses.length === 0) {
//             alert('Please add an address before booking a service.');
//             navigate('/profile', { state: { openAddressTab: true } });
//             return;
//         }
//         setShowBookingModal(true);
//     };

//     const handleSubmitBooking = async () => {
//         if (!selectedAddress || !bookingDate || !bookingTime) {
//             setBookingError('Please fill in all required fields: Address, Date, and Time.');
//             return;
//         }

//         try {
//             setBookingLoading(true);
//             // setBookingError('/services');

//             const bookingData = {
//                 providerId: providerId,
//                 addressId: selectedAddress,
//                 serviceType: provider.serviceType,
//                 description: serviceDescription,
//                 bookingDate: bookingDate,
//                 bookingTime: bookingTime,
//                 totalAmount: provider.serviceCharge || 0,
//                 userNotes: bookingNotes
//             };
            

//             await api.post('/bookings', bookingData);
//             setBookingSuccess(`Booking request sent to ${provider.name} successfully!`);

//             setTimeout(() => {
//                 setShowBookingModal(false);
//                 setBookingSuccess('');
//                 navigate('/serviceProvider-list');
//             }, 2000);

//         } catch (err) {
//             setBookingError(err.response?.data?.message || 'Failed to book service. Please try again.');
//         } finally {
//             setBookingLoading(false);
//         }
//     };

//     const formatPhoneNumber = (phone) => {
//         if (!phone) return 'Not provided';
//         const cleaned = phone.toString().replace(/\D/g, '');
//         if (cleaned.length === 10) {
//             return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
//         }
//         return phone;
//     };

//     const getMinDate = () => {
//         return new Date().toISOString().split('T')[0];
//     };

//     const generateTimeSlots = () => {
//         const slots = [];
//         for (let hour = 9; hour <= 18; hour++) {
//             for (let minute = 0; minute < 60; minute += 30) {
//                 const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
//                 slots.push(timeString);
//             }
//         }
//         return slots;
//     };

//     if (loading) {
//         return (
//             <div className="d-flex justify-content-center align-items-center" style={{minHeight: '80vh'}}>
//                 <div className="text-center">
//                     <Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} />
//                     <p className="mt-3 text-muted fw-bold">Loading Provider Profile...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error || !provider) {
//         return (
//             <Container className="mt-5 text-center">
//                 <Alert variant="danger" className="d-inline-block px-5 py-4 shadow-sm border-0 rounded-3">
//                     <h4 className="alert-heading fw-bold">Oops!</h4>
//                     <p>{error || 'Provider not found'}</p>
//                     <hr />
//                     <Button variant="outline-danger" className="rounded-pill px-4" onClick={() => navigate('/services')}>
//                         Return to Services
//                     </Button>
//                 </Alert>
//             </Container>
//         );
//     }

//     return (
//         <div className="provider-details-page">
//             {/* --- Hero Section --- */}
//             <div className="details-hero">
//                 <Container className="position-relative z-index-1">
//                     <Button 
//                         variant="link" 
//                         className="back-btn text-white text-decoration-none mb-4 ps-0" 
//                         onClick={() => navigate(-1)}
//                     >
//                         <ArrowLeft className="me-2" /> Back to List
//                     </Button>

//                     <Row className="align-items-end">
//                         <Col lg={8}>
//                             <div className="d-flex align-items-end profile-header-wrapper">
//                                 <div className="profile-avatar-xl shadow-lg">
//                                     {provider.name.charAt(0).toUpperCase()}
//                                 </div>
//                                 <div className="profile-info text-white ms-4 mb-2">
//                                     <h1 className="fw-bold mb-2">{provider.name}</h1>
//                                     <div className="d-flex align-items-center gap-2 flex-wrap">
//                                         <Badge bg="white" text="primary" className="px-3 py-2 rounded-pill fw-bold">
//                                             {provider.serviceType}
//                                         </Badge>
//                                         <div className="d-flex align-items-center text-white-50 ms-2">
//                                             <GeoAlt className="me-1" />
//                                             {provider.cities ? provider.cities.join(', ') : 'Location N/A'}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </Col>
//                         <Col lg={4} className="text-lg-end text-white mt-4 mt-lg-0">
//                             {provider.rating > 0 && (
//                                 <div className="hero-rating-box">
//                                     <div className="display-4 fw-bold text-warning">{provider.rating.toFixed(1)}</div>
//                                     <div className="opacity-75 small">{provider.totalRatings} Verified Reviews</div>
//                                 </div>
//                             )}
//                         </Col>
//                     </Row>
//                 </Container>
//             </div>

//             <Container className="mt-5 pb-5 content-container">
//                 <Row>
//                     {/* --- Left Column: Info & Reviews --- */}
//                     <Col lg={8}>
//                         {/* Stats Grid */}
//                         <Card className="border-0 shadow-sm rounded-4 mb-5 card-hover-effect">
//                             <Card.Body className="p-4">
//                                 <h5 className="fw-bold mb-4 text-dark">Professional Overview</h5>
//                                 <Row className="g-4">
//                                     <Col sm={6}>
//                                         <div className="d-flex p-3 rounded-3 bg-light-blue">
//                                             <div className="icon-circle bg-white text-primary me-3 shadow-sm"><Telephone /></div>
//                                             <div>
//                                                 <small className="text-muted fw-bold d-block text-uppercase" style={{fontSize: '0.7rem'}}>Contact</small>
//                                                 <span className="fw-bold text-dark">{formatPhoneNumber(provider.phone)}</span>
//                                             </div>
//                                         </div>
//                                     </Col>
//                                     <Col sm={6}>
//                                         <div className="d-flex p-3 rounded-3 bg-light-green">
//                                             <div className="icon-circle bg-white text-success me-3 shadow-sm"><Clock /></div>
//                                             <div>
//                                                 <small className="text-muted fw-bold d-block text-uppercase" style={{fontSize: '0.7rem'}}>Experience</small>
//                                                 <span className="fw-bold text-dark">{provider.experience || 0} Years</span>
//                                             </div>
//                                         </div>
//                                     </Col>
//                                     <Col sm={6}>
//                                         <div className="d-flex p-3 rounded-3 bg-light-yellow">
//                                             <div className="icon-circle bg-white text-warning me-3 shadow-sm"><Cash /></div>
//                                             <div>
//                                                 <small className="text-muted fw-bold d-block text-uppercase" style={{fontSize: '0.7rem'}}>Starting Rate</small>
//                                                 <span className="fw-bold text-dark">₹{provider.serviceCharge || 'N/A'}/hr</span>
//                                             </div>
//                                         </div>
//                                     </Col>
//                                     <Col sm={6}>
//                                         <div className="d-flex p-3 rounded-3 bg-light-purple">
//                                             <div className="icon-circle bg-white text-info me-3 shadow-sm"><ShieldCheck /></div>
//                                             <div>
//                                                 <small className="text-muted fw-bold d-block text-uppercase" style={{fontSize: '0.7rem'}}>Status</small>
//                                                 <span className="fw-bold text-dark">Verified Pro</span>
//                                             </div>
//                                         </div>
//                                     </Col>
//                                 </Row>
//                             </Card.Body>
//                         </Card>

//                         {/* Reviews */}
//                         <div className="d-flex align-items-center justify-content-between mb-4">
//                             <h4 className="fw-bold mb-0">Client Reviews</h4>
//                             {reviews.length > 0 && <Badge bg="light" text="dark" className="border">{reviews.length} Total</Badge>}
//                         </div>

//                         {reviewsLoading ? (
//                             <div className="text-center py-5"><Spinner animation="border" size="sm" /></div>
//                         ) : reviews.length === 0 ? (
//                             <div className="text-center py-5 bg-white rounded-4 shadow-sm border-dashed">
//                                 <div className="display-4 mb-2 opacity-25">💬</div>
//                                 <h6 className="text-muted">No reviews yet. Be the first!</h6>
//                             </div>
//                         ) : (
//                             <div className="review-list">
//                                 {reviews.map((review, index) => (
//                                     <Card key={index} className="border-0 shadow-sm mb-3 rounded-3 review-card">
//                                         <Card.Body className="p-4">
//                                             <div className="d-flex justify-content-between mb-2">
//                                                 <div className="d-flex align-items-center">
//                                                     <PersonCircle size={32} className="text-secondary opacity-25 me-3"/>
//                                                     <div>
//                                                         <h6 className="fw-bold mb-0 text-dark">{review.userName || 'User'}</h6>
//                                                         <small className="text-muted" style={{fontSize: '0.75rem'}}>
//                                                             {new Date(review.createdAt).toLocaleDateString()}
//                                                         </small>
//                                                     </div>
//                                                 </div>
//                                                 <div className="review-rating">{renderStars(review.rating)}</div>
//                                             </div>
//                                             <p className="text-secondary mb-0 mt-3" style={{lineHeight: '1.6'}}>{review.comment}</p>
//                                         </Card.Body>
//                                     </Card>
//                                 ))}
//                             </div>
//                         )}
//                     </Col>

//                     {/* --- Right Column: Sticky Booking --- */}
//                     <Col lg={4}>
//                         <div className="sticky-booking-card" style={{top: '100px', zIndex: 10}}>
//                             <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
//                                 <div className="bg-primary p-4 text-center text-white relative">
//                                     <div className="absolute-pattern"></div>
//                                     <h6 className="opacity-75 mb-1 text-uppercase letter-spacing-1">Service Rate</h6>
//                                     <h2 className="display-6 fw-bold mb-0">₹{provider.serviceCharge}<span className="fs-6 opacity-75">/hr</span></h2>
//                                 </div>
//                                 <Card.Body className="p-4">
//                                     <div className="mb-4">
//                                         <div className="d-flex align-items-center mb-2 small fw-bold text-dark">
//                                             <CheckCircleFill className="text-success me-2"/> Background Verified
//                                         </div>
//                                         <div className="d-flex align-items-center mb-2 small fw-bold text-dark">
//                                             <CheckCircleFill className="text-success me-2"/> Insurance Covered
//                                         </div>
//                                         <div className="d-flex align-items-center small fw-bold text-dark">
//                                             <CheckCircleFill className="text-success me-2"/> Satisfaction Guarantee
//                                         </div>
//                                     </div>
//                                     <Button 
//                                         variant="dark" 
//                                         size="lg" 
//                                         className="w-100 rounded-pill py-3 fw-bold shadow-lg btn-gradient-dark"
//                                         onClick={handleBookService}
//                                     >
//                                         Book Appointment
//                                     </Button>
//                                     <div className="text-center mt-3">
//                                         <small className="text-muted" style={{fontSize: '0.75rem'}}>
//                                             <ShieldCheck className="me-1"/> Secure booking via QuickService
//                                         </small>
//                                     </div>
//                                 </Card.Body>
//                             </Card>
//                         </div>
//                     </Col>
//                 </Row>
//             </Container>

//             {/* --- Booking Modal --- */}
//             <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} size="lg" centered className="modern-modal">
//                 <Modal.Header closeButton className="border-0 bg-light px-4 py-3">
//                     <Modal.Title className="fw-bold h5">Complete Your Booking</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body className="p-4">
//                     {bookingLoading && <ProgressBar animated now={100} className="mb-4" style={{height: '4px'}} />}
                    
//                     {bookingSuccess && <Alert variant="success" className="border-0 shadow-sm">{bookingSuccess}</Alert>}
//                     {bookingError && <Alert variant="danger" className="border-0 shadow-sm">{bookingError}</Alert>}

//                     <Form>
//                         <Row className="g-3">
//                             <Col xs={12}>
//                                 <div className="p-3 bg-light rounded-3 mb-3 d-flex align-items-center">
//                                     <div className="icon-circle bg-white text-primary me-3"><PersonCircle /></div>
//                                     <div>
//                                         <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Provider</small>
//                                         <span className="fw-bold text-dark">{provider.name}</span>
//                                     </div>
//                                     <div className="ms-auto text-end">
//                                         <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Rate</small>
//                                         <span className="fw-bold text-success">₹{provider.serviceCharge}/hr</span>
//                                     </div>
//                                 </div>
//                             </Col>

//                             <Col md={12}>
//                                 <Form.Group>
//                                     <Form.Label className="modal-label">Select Address</Form.Label>
//                                     <div className="input-group-modern">
//                                         <span className="input-icon"><GeoAlt /></span>
//                                         <Form.Select 
//                                             className="form-control-modern"
//                                             value={selectedAddress}
//                                             onChange={(e) => setSelectedAddress(e.target.value)}
//                                             disabled={userAddresses.length === 0}
//                                         >
//                                             <option value="">Choose service location...</option>
//                                             {userAddresses.map((addr) => (
//                                                 <option key={addr.id} value={addr.id}>{addr.name} - {addr.city}</option>
//                                             ))}
//                                         </Form.Select>
//                                     </div>
//                                 </Form.Group>
//                             </Col>

//                             <Col md={6}>
//                                 <Form.Group>
//                                     <Form.Label className="modal-label">Date</Form.Label>
//                                     <div className="input-group-modern">
//                                         <span className="input-icon"><CalendarEvent /></span>
//                                         <Form.Control 
//                                             type="date" 
//                                             className="form-control-modern"
//                                             value={bookingDate}
//                                             onChange={(e) => setBookingDate(e.target.value)}
//                                             min={getMinDate()}
//                                         />
//                                     </div>
//                                 </Form.Group>
//                             </Col>

//                             <Col md={6}>
//                                 <Form.Group>
//                                     <Form.Label className="modal-label">Time</Form.Label>
//                                     <div className="input-group-modern">
//                                         <span className="input-icon"><Clock /></span>
//                                         <Form.Select 
//                                             className="form-control-modern"
//                                             value={bookingTime}
//                                             onChange={(e) => setBookingTime(e.target.value)}
//                                         >
//                                             <option value="">Select slot...</option>
//                                             {generateTimeSlots().map(t => <option key={t} value={t}>{t}</option>)}
//                                         </Form.Select>
//                                     </div>
//                                 </Form.Group>
//                             </Col>

//                             <Col xs={12}>
//                                 <Form.Group>
//                                     <Form.Label className="modal-label">Description</Form.Label>
//                                     <Form.Control 
//                                         as="textarea" 
//                                         rows={3} 
//                                         className="form-control-modern"
//                                         placeholder="Describe the issue in detail..."
//                                         value={serviceDescription}
//                                         onChange={(e) => setServiceDescription(e.target.value)}
//                                     />
//                                 </Form.Group>
//                             </Col>

//                             <Col xs={12}>
//                                 <Form.Group>
//                                     <Form.Label className="modal-label">Notes (Optional)</Form.Label>
//                                     <Form.Control 
//                                         as="textarea" 
//                                         rows={2} 
//                                         className="form-control-modern"
//                                         placeholder="Gate code, parking instructions, etc."
//                                         value={bookingNotes}
//                                         onChange={(e) => setBookingNotes(e.target.value)}
//                                     />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
//                     </Form>
//                 </Modal.Body>
//                 <Modal.Footer className="border-0 bg-light px-4 py-3">
//                     <Button variant="link" className="text-muted text-decoration-none me-auto" onClick={() => setShowBookingModal(false)}>
//                         Cancel
//                     </Button>
//                     <Button 
//                         variant="primary" 
//                         className="rounded-pill px-4 shadow-sm fw-bold btn-gradient-primary"
//                         onClick={handleSubmitBooking}
//                         disabled={bookingLoading}
//                     >
//                         {bookingLoading ? 'Booking...' : 'Confirm Request'} <CreditCard className="ms-2"/>
//                     </Button>
//                 </Modal.Footer>
//             </Modal>
//         </div>
//     );
// }

// export default ServiceProviderDetails;

// import React, { useState, useEffect } from 'react';
// import {
//     Container, Row, Col, Card, Button, Badge, Alert, Spinner,
//     Form, Modal
// } from 'react-bootstrap';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { 
//     Star, StarFill, GeoAlt, Telephone, Clock, 
//     Cash, ShieldCheck, ArrowLeft, CheckCircleFill, PersonCircle, 
//     CalendarEvent, CreditCard, ArrowRight
// } from 'react-bootstrap-icons';
// import axios from 'axios';
// import { reviewService } from './ReviewService';
// import './ServiceProviderDetails.css'; 

// const api = axios.create({
//     baseURL: 'http://localhost:8080/api',
// });

// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

// function ServiceProviderDetails() {
//     const { providerId } = useParams();
//     const navigate = useNavigate();
//     const location = useLocation();
    
//     const [provider, setProvider] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [reviews, setReviews] = useState([]);
//     const [reviewsLoading, setReviewsLoading] = useState(false); 
//     const [showBookingModal, setShowBookingModal] = useState(false);
//     const [userAddresses, setUserAddresses] = useState([]);
//     const [selectedAddress, setSelectedAddress] = useState('');
//     const [bookingDate, setBookingDate] = useState('');
//     const [bookingTime, setBookingTime] = useState('');
//     const [serviceDescription, setServiceDescription] = useState('');
//     const [bookingNotes, setBookingNotes] = useState('');
//     const [bookingLoading, setBookingLoading] = useState(false);
//     const [bookingError, setBookingError] = useState('');
//     const [bookingSuccess, setBookingSuccess] = useState('');

//     const renderStars = (rating) => {
//         const stars = [];
//         const fullStars = Math.floor(rating);
//         for (let i = 0; i < 5; i++) {
//             if (i < fullStars) {
//                 stars.push(<StarFill key={i} className="text-warning me-1" size={14}/>);
//             } else {
//                 stars.push(<Star key={i} className="text-muted me-1 opacity-25" size={14}/>);
//             }
//         }
//         return <div className="d-flex align-items-center">{stars}</div>;
//     };

//     useEffect(() => {
//         fetchProviderDetails();
//         fetchProviderReviews();
//         loadUserAddresses();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [providerId]);

//     const fetchProviderDetails = async () => {
//         try {
//             setLoading(true);
//             const response = await api.get(`/providers/${providerId}/details`);
//             setProvider(response.data);
//         } catch (err) {
//             setError('Failed to load provider details');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchProviderReviews = async () => {
//         try {
//             setReviewsLoading(true);
//             const result = await reviewService.getProviderReviews(providerId);
//             if (result.success) {
//                 setReviews(result.data.reviews || result.data);
//             } else {
//                 setReviews([]);
//             }
//         } catch (err) {
//             console.error('Error loading reviews:', err);
//             setReviews([]);
//         } finally {
//             setReviewsLoading(false);
//         }
//     };

//     const loadUserAddresses = async () => {
//         try {
//             const response = await api.get('/addresses');
//             setUserAddresses(response.data);
//             const defaultAddress = response.data.find(addr => addr.isDefault);
//             if (defaultAddress) {
//                 setSelectedAddress(defaultAddress.id);
//             } else if (response.data.length > 0) {
//                 setSelectedAddress(response.data[0].id);
//             }
//         } catch (err) {
//             console.error('Error loading addresses:', err);
//         }
//     };

//     const handleBookService = () => {
//         if (userAddresses.length === 0) {
//             alert('Please add an address before booking a service.');
//             navigate('/profile', { state: { openAddressTab: true } });
//             return;
//         }
//         setShowBookingModal(true);
//     };

//     // FIXED: Handle booking submission with proper navigation
//     const handleSubmitBooking = async () => {
//         if (!selectedAddress || !bookingDate || !bookingTime) {
//             setBookingError('Please fill in all required fields: Address, Date, and Time.');
//             return;
//         }

//         try {
//             setBookingLoading(true);
//             setBookingError('');

//             const bookingData = {
//                 providerId: providerId,
//                 addressId: selectedAddress,
//                 serviceType: provider.serviceType,
//                 description: serviceDescription,
//                 bookingDate: bookingDate,
//                 bookingTime: bookingTime,
//                 totalAmount: provider.serviceCharge || 0,
//                 userNotes: bookingNotes
//             };

//             await api.post('/bookings', bookingData);
            
//             // Show success message
//             setBookingSuccess(`✅ Booking confirmed! You will be redirected to your bookings...`);

//             // Wait 2 seconds to show success message, then navigate to /books
//             setTimeout(() => {
//                 setShowBookingModal(false);
//                 setBookingSuccess('');
//                 navigate('/service',{replace : true}); // FIXED: Navigate to books page
//             }, 2000);

//         } catch (err) {
//             setBookingError(err.response?.data?.message || 'Failed to book service. Please try again.');
//         } finally {
//             setBookingLoading(false);
//         }
//     };

//     const formatPhoneNumber = (phone) => {
//         if (!phone) return 'Not provided';
//         const cleaned = phone.toString().replace(/\D/g, '');
//         if (cleaned.length === 10) {
//             return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
//         }
//         return phone;
//     };

//     const getMinDate = () => {
//         return new Date().toISOString().split('T')[0];
//     };

//     const generateTimeSlots = () => {
//         const slots = [];
//         for (let hour = 9; hour <= 18; hour++) {
//             for (let minute = 0; minute < 60; minute += 30) {
//                 const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
//                 slots.push(timeString);
//             }
//         }
//         return slots;
//     };

//     if (loading) {
//         return (
//             <div className="d-flex justify-content-center align-items-center" style={{minHeight: '80vh'}}>
//                 <div className="text-center">
//                     <Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} />
//                     <p className="mt-3 text-muted fw-bold">Loading Provider Profile...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error || !provider) {
//         return (
//             <Container className="mt-5 text-center">
//                 <Alert variant="danger" className="d-inline-block px-5 py-4 shadow-sm border-0 rounded-3">
//                     <h4 className="alert-heading fw-bold">Oops!</h4>
//                     <p>{error || 'Provider not found'}</p>
//                     <hr />
//                     <Button variant="outline-danger" className="rounded-pill px-4" onClick={() => navigate('/services')}>
//                         Return to Services
//                     </Button>
//                 </Alert>
//             </Container>
//         );
//     }

//     return (
//         <div className="provider-details-page">
//             {/* Hero Section */}
//             <div className="details-hero">
//                 <Container className="position-relative z-index-1">
//                     <Button 
//                         variant="link" 
//                         className="back-btn text-white text-decoration-none mb-4 ps-0" 
//                         onClick={() => navigate(-1)}
//                     >
//                         <ArrowLeft className="me-2" /> Back to List
//                     </Button>

//                     <Row className="align-items-end">
//                         <Col lg={8}>
//                             <div className="d-flex align-items-end profile-header-wrapper">
//                                 <div className="profile-avatar-xl shadow-lg">
//                                     {provider.name.charAt(0).toUpperCase()}
//                                 </div>
//                                 <div className="profile-info text-white ms-4 mb-2">
//                                     <h1 className="fw-bold mb-2">{provider.name}</h1>
//                                     <div className="d-flex align-items-center gap-2 flex-wrap">
//                                         <Badge bg="white" text="primary" className="px-3 py-2 rounded-pill fw-bold">
//                                             {provider.serviceType}
//                                         </Badge>
//                                         <div className="d-flex align-items-center text-white-50 ms-2">
//                                             <GeoAlt className="me-1" />
//                                             {provider.cities ? provider.cities.join(', ') : 'Location N/A'}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </Col>
//                         <Col lg={4} className="text-lg-end text-white mt-4 mt-lg-0">
//                             {provider.rating > 0 && (
//                                 <div className="hero-rating-box">
//                                     <div className="display-4 fw-bold text-warning">{provider.rating.toFixed(1)}</div>
//                                     <div className="opacity-75 small">{provider.totalRatings} Verified Reviews</div>
//                                 </div>
//                             )}
//                         </Col>
//                     </Row>
//                 </Container>
//             </div>

//             <Container className="mt-5 pb-5 content-container">
//                 <Row>
//                     <Col lg={8}>
//                         {/* Stats Grid */}
//                         <Card className="border-0 shadow-sm rounded-4 mb-5 card-hover-effect">
//                             <Card.Body className="p-4">
//                                 <h5 className="fw-bold mb-4 text-dark">Professional Overview</h5>
//                                 <Row className="g-4">
//                                     <Col sm={6}>
//                                         <div className="d-flex p-3 rounded-3 bg-light-blue">
//                                             <div className="icon-circle bg-white text-primary me-3 shadow-sm"><Telephone /></div>
//                                             <div>
//                                                 <small className="text-muted fw-bold d-block text-uppercase" style={{fontSize: '0.7rem'}}>Contact</small>
//                                                 <span className="fw-bold text-dark">{formatPhoneNumber(provider.phone)}</span>
//                                             </div>
//                                         </div>
//                                     </Col>
//                                     <Col sm={6}>
//                                         <div className="d-flex p-3 rounded-3 bg-light-green">
//                                             <div className="icon-circle bg-white text-success me-3 shadow-sm"><Clock /></div>
//                                             <div>
//                                                 <small className="text-muted fw-bold d-block text-uppercase" style={{fontSize: '0.7rem'}}>Experience</small>
//                                                 <span className="fw-bold text-dark">{provider.experience || 0} Years</span>
//                                             </div>
//                                         </div>
//                                     </Col>
//                                     <Col sm={6}>
//                                         <div className="d-flex p-3 rounded-3 bg-light-yellow">
//                                             <div className="icon-circle bg-white text-warning me-3 shadow-sm"><Cash /></div>
//                                             <div>
//                                                 <small className="text-muted fw-bold d-block text-uppercase" style={{fontSize: '0.7rem'}}>Starting Rate</small>
//                                                 <span className="fw-bold text-dark">₹{provider.serviceCharge || 'N/A'}/hr</span>
//                                             </div>
//                                         </div>
//                                     </Col>
//                                     <Col sm={6}>
//                                         <div className="d-flex p-3 rounded-3 bg-light-purple">
//                                             <div className="icon-circle bg-white text-info me-3 shadow-sm"><ShieldCheck /></div>
//                                             <div>
//                                                 <small className="text-muted fw-bold d-block text-uppercase" style={{fontSize: '0.7rem'}}>Status</small>
//                                                 <span className="fw-bold text-dark">Verified Pro</span>
//                                             </div>
//                                         </div>
//                                     </Col>
//                                 </Row>
//                             </Card.Body>
//                         </Card>

//                         {/* Reviews */}
//                         <div className="d-flex align-items-center justify-content-between mb-4">
//                             <h4 className="fw-bold mb-0">Client Reviews</h4>
//                             {reviews.length > 0 && <Badge bg="light" text="dark" className="border">{reviews.length} Total</Badge>}
//                         </div>

//                         {reviewsLoading ? (
//                             <div className="text-center py-5"><Spinner animation="border" size="sm" /></div>
//                         ) : reviews.length === 0 ? (
//                             <div className="text-center py-5 bg-white rounded-4 shadow-sm border-dashed">
//                                 <div className="display-4 mb-2 opacity-25">💬</div>
//                                 <h6 className="text-muted">No reviews yet. Be the first!</h6>
//                             </div>
//                         ) : (
//                             <div className="review-list">
//                                 {reviews.map((review, index) => (
//                                     <Card key={index} className="border-0 shadow-sm mb-3 rounded-3 review-card">
//                                         <Card.Body className="p-4">
//                                             <div className="d-flex justify-content-between mb-2">
//                                                 <div className="d-flex align-items-center">
//                                                     <PersonCircle size={32} className="text-secondary opacity-25 me-3"/>
//                                                     <div>
//                                                         <h6 className="fw-bold mb-0 text-dark">{review.userName || 'User'}</h6>
//                                                         <small className="text-muted" style={{fontSize: '0.75rem'}}>
//                                                             {new Date(review.createdAt).toLocaleDateString()}
//                                                         </small>
//                                                     </div>
//                                                 </div>
//                                                 <div className="review-rating">{renderStars(review.rating)}</div>
//                                             </div>
//                                             <p className="text-secondary mb-0 mt-3" style={{lineHeight: '1.6'}}>{review.comment}</p>
//                                         </Card.Body>
//                                     </Card>
//                                 ))}
//                             </div>
//                         )}
//                     </Col>

//                     <Col lg={4}>
//                         <div className="sticky-booking-card" style={{top: '100px', zIndex: 10}}>
//                             <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
//                                 <div className="bg-primary p-4 text-center text-white relative">
//                                     <div className="absolute-pattern"></div>
//                                     <h6 className="opacity-75 mb-1 text-uppercase letter-spacing-1">Service Rate</h6>
//                                     <h2 className="display-6 fw-bold mb-0">₹{provider.serviceCharge}<span className="fs-6 opacity-75">/hr</span></h2>
//                                 </div>
//                                 <Card.Body className="p-4">
//                                     <div className="mb-4">
//                                         <div className="d-flex align-items-center mb-2 small fw-bold text-dark">
//                                             <CheckCircleFill className="text-success me-2"/> Background Verified
//                                         </div>
//                                         <div className="d-flex align-items-center mb-2 small fw-bold text-dark">
//                                             <CheckCircleFill className="text-success me-2"/> Insurance Covered
//                                         </div>
//                                         <div className="d-flex align-items-center small fw-bold text-dark">
//                                             <CheckCircleFill className="text-success me-2"/> Satisfaction Guarantee
//                                         </div>
//                                     </div>
//                                     <Button 
//                                         variant="dark" 
//                                         size="lg" 
//                                         className="w-100 rounded-pill py-3 fw-bold shadow-lg btn-gradient-dark"
//                                         onClick={handleBookService}
//                                     >
//                                         Book Appointment
//                                     </Button>
//                                     <div className="text-center mt-3">
//                                         <small className="text-muted" style={{fontSize: '0.75rem'}}>
//                                             <ShieldCheck className="me-1"/> Secure booking via QuickService
//                                         </small>
//                                     </div>
//                                 </Card.Body>
//                             </Card>
//                         </div>
//                     </Col>
//                 </Row>
//             </Container>

//             {/* Booking Modal */}
//             <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} size="lg" centered className="modern-modal">
//                 <Modal.Header closeButton className="border-0 bg-light px-4 py-3">
//                     <Modal.Title className="fw-bold h5">Complete Your Booking</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body className="p-4">
//                     {bookingSuccess && (
//                         <Alert variant="success" className="border-0 shadow-sm">
//                             <div className="d-flex align-items-center">
//                                 <CheckCircleFill className="me-2 text-success" size={20} />
//                                 <div>
//                                     <strong>Booking Confirmed!</strong>
//                                     <p className="mb-0">You will be redirected to your bookings shortly...</p>
//                                 </div>
//                             </div>
//                         </Alert>
//                     )}
//                     {bookingError && <Alert variant="danger" className="border-0 shadow-sm">{bookingError}</Alert>}

//                     {!bookingSuccess && (
//                         <Form>
//                             <Row className="g-3">
//                                 <Col xs={12}>
//                                     <div className="p-3 bg-light rounded-3 mb-3 d-flex align-items-center">
//                                         <div className="icon-circle bg-white text-primary me-3"><PersonCircle /></div>
//                                         <div>
//                                             <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Provider</small>
//                                             <span className="fw-bold text-dark">{provider.name}</span>
//                                         </div>
//                                         <div className="ms-auto text-end">
//                                             <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Rate</small>
//                                             <span className="fw-bold text-success">₹{provider.serviceCharge}/hr</span>
//                                         </div>
//                                     </div>
//                                 </Col>

//                                 <Col md={12}>
//                                     <Form.Group>
//                                         <Form.Label className="modal-label">Select Address</Form.Label>
//                                         <div className="input-group-modern">
//                                             <span className="input-icon"><GeoAlt /></span>
//                                             <Form.Select 
//                                                 className="form-control-modern"
//                                                 value={selectedAddress}
//                                                 onChange={(e) => setSelectedAddress(e.target.value)}
//                                                 disabled={userAddresses.length === 0}
//                                             >
//                                                 <option value="">Choose service location...</option>
//                                                 {userAddresses.map((addr) => (
//                                                     <option key={addr.id} value={addr.id}>{addr.name} - {addr.city}</option>
//                                                 ))}
//                                             </Form.Select>
//                                         </div>
//                                     </Form.Group>
//                                 </Col>

//                                 <Col md={6}>
//                                     <Form.Group>
//                                         <Form.Label className="modal-label">Date</Form.Label>
//                                         <div className="input-group-modern">
//                                             <span className="input-icon"><CalendarEvent /></span>
//                                             <Form.Control 
//                                                 type="date" 
//                                                 className="form-control-modern"
//                                                 value={bookingDate}
//                                                 onChange={(e) => setBookingDate(e.target.value)}
//                                                 min={getMinDate()}
//                                             />
//                                         </div>
//                                     </Form.Group>
//                                 </Col>

//                                 <Col md={6}>
//                                     <Form.Group>
//                                         <Form.Label className="modal-label">Time</Form.Label>
//                                         <div className="input-group-modern">
//                                             <span className="input-icon"><Clock /></span>
//                                             <Form.Select 
//                                                 className="form-control-modern"
//                                                 value={bookingTime}
//                                                 onChange={(e) => setBookingTime(e.target.value)}
//                                             >
//                                                 <option value="">Select slot...</option>
//                                                 {generateTimeSlots().map(t => <option key={t} value={t}>{t}</option>)}
//                                             </Form.Select>
//                                         </div>
//                                     </Form.Group>
//                                 </Col>

//                                 <Col xs={12}>
//                                     <Form.Group>
//                                         <Form.Label className="modal-label">Description</Form.Label>
//                                         <Form.Control 
//                                             as="textarea" 
//                                             rows={3} 
//                                             className="form-control-modern"
//                                             placeholder="Describe the issue in detail..."
//                                             value={serviceDescription}
//                                             onChange={(e) => setServiceDescription(e.target.value)}
//                                         />
//                                     </Form.Group>
//                                 </Col>

//                                 <Col xs={12}>
//                                     <Form.Group>
//                                         <Form.Label className="modal-label">Notes (Optional)</Form.Label>
//                                         <Form.Control 
//                                             as="textarea" 
//                                             rows={2} 
//                                             className="form-control-modern"
//                                             placeholder="Gate code, parking instructions, etc."
//                                             value={bookingNotes}
//                                             onChange={(e) => setBookingNotes(e.target.value)}
//                                         />
//                                     </Form.Group>
//                                 </Col>
//                             </Row>
//                         </Form>
//                     )}
//                 </Modal.Body>
//                 <Modal.Footer className="border-0 bg-light px-4 py-3">
//                     {bookingSuccess ? (
//                         <Button 
//                             variant="success" 
//                             className="rounded-pill px-4 shadow-sm fw-bold"
//                             onClick={() => navigate('/books')}
//                         >
//                             View My Bookings <ArrowRight className="ms-2"/>
//                         </Button>
//                     ) : (
//                         <>
//                             <Button variant="link" className="text-muted text-decoration-none me-auto" onClick={() => setShowBookingModal(false)}>
//                                 Cancel
//                             </Button>
//                             <Button 
//                                 variant="primary" 
//                                 className="rounded-pill px-4 shadow-sm fw-bold btn-gradient-primary"
//                                 onClick={handleSubmitBooking}
//                                 disabled={bookingLoading || !selectedAddress || !bookingDate || !bookingTime}
//                             >
//                                 {bookingLoading ? 'Booking...' : 'Confirm Request'} <CreditCard className="ms-2"/>
//                             </Button>
//                         </>
//                     )}
//                 </Modal.Footer>
//             </Modal>
//         </div>
//     );
// }

// export default ServiceProviderDetails;




import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Badge, Alert, Spinner,
    Form, Modal
} from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    Star, StarFill, GeoAlt, Telephone, Clock, 
    Cash, ShieldCheck, ArrowLeft, CheckCircleFill, PersonCircle, 
    CalendarEvent, CreditCard, ArrowRight, XCircle
} from 'react-bootstrap-icons';
import axios from 'axios';
import { reviewService } from './ReviewService';
import './ServiceProviderDetails.css'; 

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

function ServiceProviderDetails() {
    const { providerId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false); 
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [serviceDescription, setServiceDescription] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<StarFill key={i} className="text-warning me-1" size={14}/>);
            } else {
                stars.push(<Star key={i} className="text-muted me-1 opacity-25" size={14}/>);
            }
        }
        return <div className="d-flex align-items-center">{stars}</div>;
    };

    useEffect(() => {
        fetchProviderDetails();
        fetchProviderReviews();
        loadUserAddresses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [providerId]);

    const fetchProviderDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/providers/${providerId}/details`);
            setProvider(response.data);
        } catch (err) {
            setError('Failed to load provider details');
        } finally {
            setLoading(false);
        }
    };

    const fetchProviderReviews = async () => {
        try {
            setReviewsLoading(true);
            const result = await reviewService.getProviderReviews(providerId);
            if (result.success) {
                setReviews(result.data.reviews || result.data);
            } else {
                setReviews([]);
            }
        } catch (err) {
            console.error('Error loading reviews:', err);
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    const loadUserAddresses = async () => {
        try {
            const response = await api.get('/addresses');
            setUserAddresses(response.data);
            const defaultAddress = response.data.find(addr => addr.isDefault);
            if (defaultAddress) {
                setSelectedAddress(defaultAddress.id);
            } else if (response.data.length > 0) {
                setSelectedAddress(response.data[0].id);
            }
        } catch (err) {
            console.error('Error loading addresses:', err);
        }
    };

    const handleBookService = () => {
        if (userAddresses.length === 0) {
            alert('Please add an address before booking a service.');
            navigate('/profile', { state: { openAddressTab: true } });
            return;
        }
        // Reset form when opening modal
        setBookingSuccess(false);
        setBookingError('');
        setBookingDate('');
        setBookingTime('');
        setServiceDescription('');
        setBookingNotes('');
        setShowBookingModal(true);
    };

    const handleSubmitBooking = async () => {
        if (!selectedAddress || !bookingDate || !bookingTime) {
            setBookingError('Please fill in all required fields: Address, Date, and Time.');
            return;
        }

        try {
            setBookingLoading(true);
            setBookingError('');

            const bookingData = {
                providerId: providerId,
                addressId: selectedAddress,
                serviceType: provider.serviceType,
                description: serviceDescription,
                bookingDate: bookingDate,
                bookingTime: bookingTime,
                totalAmount: provider.serviceCharge || 0,
                userNotes: bookingNotes
            };

            const response = await api.post('/bookings', bookingData);
            
            // Store booking details for success message
            setBookingDetails({
                id: response.data.id || 'N/A',
                date: bookingDate,
                time: bookingTime,
                providerName: provider.name
            });
            
            // Show success state
            setBookingSuccess(true);
            
            // Reset form fields
            setBookingDate('');
            setBookingTime('');
            setServiceDescription('');
            setBookingNotes('');
            
        } catch (err) {
            setBookingError(err.response?.data?.message || 'Failed to book service. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowBookingModal(false);
        setBookingSuccess(false);
        setBookingError('');
        setBookingDetails(null);
    };

    const handleViewBookings = () => {
        setShowBookingModal(false);
        navigate('/books');
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return 'Not provided';
        const cleaned = phone.toString().replace(/\D/g, '');
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
        return phone;
    };

    const getMinDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeString);
            }
        }
        return slots;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: '80vh'}}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} />
                    <p className="mt-3 text-muted fw-bold">Loading Provider Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !provider) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="danger" className="d-inline-block px-5 py-4 shadow-sm border-0 rounded-3">
                    <h4 className="alert-heading fw-bold">Oops!</h4>
                    <p>{error || 'Provider not found'}</p>
                    <hr />
                    <Button variant="outline-danger" className="rounded-pill px-4" onClick={() => navigate('/services')}>
                        Return to Services
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <div className="provider-details-page">
            {/* Hero Section */}
            <div className="details-hero">
                <Container className="position-relative z-index-1">
                    <Button 
                        variant="link" 
                        className="back-btn text-white text-decoration-none mb-4 ps-0" 
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="me-2" /> Back to List
                    </Button>

                    <Row className="align-items-end">
                        <Col lg={8}>
                            <div className="d-flex align-items-end profile-header-wrapper">
                                <div className="profile-avatar-xl shadow-lg">
                                    {provider.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="profile-info text-white ms-4 mb-2">
                                    <h1 className="fw-bold mb-2">{provider.name}</h1>
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <Badge bg="white" text="primary" className="px-3 py-2 rounded-pill fw-bold">
                                            {provider.serviceType}
                                        </Badge>
                                        <div className="d-flex align-items-center text-white-50 ms-2">
                                            <GeoAlt className="me-1" />
                                            {provider.cities ? provider.cities.join(', ') : 'Location N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col lg={4} className="text-lg-end text-white mt-4 mt-lg-0">
                            {provider.rating > 0 && (
                                <div className="hero-rating-box">
                                    <div className="display-4 fw-bold text-warning">{provider.rating.toFixed(1)}</div>
                                    <div className="opacity-75 small">{provider.totalRatings} Verified Reviews</div>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="mt-5 pb-5 content-container">
                <Row>
                    <Col lg={8}>
                        {/* Stats Grid */}
                        <Card className="border-0 shadow-sm rounded-4 mb-5 card-hover-effect">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4 text-dark">Professional Overview</h5>
                                <Row className="g-4">
                                    <Col sm={6}>
                                        <div className="d-flex p-3 rounded-3 bg-light-blue">
                                            <div className="icon-circle bg-white text-primary me-3 shadow-sm"><Telephone /></div>
                                            <div>
                                                <small className="text-muted fw-bold d-block text-uppercase" style={{fontSize: '0.7rem'}}>Contact</small>
                                                <span className="fw-bold text-dark">{formatPhoneNumber(provider.phone)}</span>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="d-flex p-3 rounded-3 bg-light-green">
                                            <div className="icon-circle bg-white text-success me-3 shadow-sm"><Clock /></div>
                                            <div>
                                                <small className="text-muted fw-bold d-block text-uppercase" style={{fontSize: '0.7rem'}}>Experience</small>
                                                <span className="fw-bold text-dark">{provider.experience || 0} Years</span>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="d-flex p-3 rounded-3 bg-light-yellow">
                                            <div className="icon-circle bg-white text-warning me-3 shadow-sm"><Cash /></div>
                                            <div>
                                                <small className="text-muted fw-bold d-block text-uppercase" style={{fontSize: '0.7rem'}}>Starting Rate</small>
                                                <span className="fw-bold text-dark">₹{provider.serviceCharge || 'N/A'}/hr</span>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="d-flex p-3 rounded-3 bg-light-purple">
                                            <div className="icon-circle bg-white text-info me-3 shadow-sm"><ShieldCheck /></div>
                                            <div>
                                                <small className="text-muted fw-bold d-block text-uppercase" style={{fontSize: '0.7rem'}}>Status</small>
                                                <span className="fw-bold text-dark">Verified Pro</span>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Reviews */}
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h4 className="fw-bold mb-0">Client Reviews</h4>
                            {reviews.length > 0 && <Badge bg="light" text="dark" className="border">{reviews.length} Total</Badge>}
                        </div>

                        {reviewsLoading ? (
                            <div className="text-center py-5"><Spinner animation="border" size="sm" /></div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-5 bg-white rounded-4 shadow-sm border-dashed">
                                <div className="display-4 mb-2 opacity-25">💬</div>
                                <h6 className="text-muted">No reviews yet. Be the first!</h6>
                            </div>
                        ) : (
                            <div className="review-list">
                                {reviews.map((review, index) => (
                                    <Card key={index} className="border-0 shadow-sm mb-3 rounded-3 review-card">
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between mb-2">
                                                <div className="d-flex align-items-center">
                                                    <PersonCircle size={32} className="text-secondary opacity-25 me-3"/>
                                                    <div>
                                                        <h6 className="fw-bold mb-0 text-dark">{review.userName || 'User'}</h6>
                                                        <small className="text-muted" style={{fontSize: '0.75rem'}}>
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </small>
                                                    </div>
                                                </div>
                                                <div className="review-rating">{renderStars(review.rating)}</div>
                                            </div>
                                            <p className="text-secondary mb-0 mt-3" style={{lineHeight: '1.6'}}>{review.comment}</p>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </Col>

                    <Col lg={4}>
                        <div className="sticky-booking-card" style={{top: '100px', zIndex: 10}}>
                            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="bg-primary p-4 text-center text-white relative">
                                    <div className="absolute-pattern"></div>
                                    <h6 className="opacity-75 mb-1 text-uppercase letter-spacing-1">Service Rate</h6>
                                    <h2 className="display-6 fw-bold mb-0">₹{provider.serviceCharge}<span className="fs-6 opacity-75">/hr</span></h2>
                                </div>
                                <Card.Body className="p-4">
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center mb-2 small fw-bold text-dark">
                                            <CheckCircleFill className="text-success me-2"/> Background Verified
                                        </div>
                                        <div className="d-flex align-items-center mb-2 small fw-bold text-dark">
                                            <CheckCircleFill className="text-success me-2"/> Insurance Covered
                                        </div>
                                        <div className="d-flex align-items-center small fw-bold text-dark">
                                            <CheckCircleFill className="text-success me-2"/> Satisfaction Guarantee
                                        </div>
                                    </div>
                                    <Button 
                                        variant="dark" 
                                        size="lg" 
                                        className="w-100 rounded-pill py-3 fw-bold shadow-lg btn-gradient-dark"
                                        onClick={handleBookService}
                                    >
                                        Book Appointment
                                    </Button>
                                    <div className="text-center mt-3">
                                        <small className="text-muted" style={{fontSize: '0.75rem'}}>
                                            <ShieldCheck className="me-1"/> Secure booking via QuickService
                                        </small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Booking Modal */}
            <Modal show={showBookingModal} onHide={handleCloseModal} size="lg" centered className="modern-modal">
                <Modal.Header closeButton className="border-0 bg-light px-4 py-3">
                    <Modal.Title className="fw-bold h5">
                        {bookingSuccess ? 'Booking Confirmed!' : 'Complete Your Booking'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {bookingSuccess ? (
                        // Success View
                        <div className="text-center py-4">
                            <div className="mb-4">
                                <div className="success-icon-circle mx-auto mb-3">
                                    <CheckCircleFill size={48} className="text-success" />
                                </div>
                                <h4 className="fw-bold text-success mb-3">Booking Request Sent!</h4>
                                
                                <Card className="bg-light border-0 mb-4">
                                    <Card.Body className="p-4">
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-2">Service Provider</h6>
                                            <div className="d-flex align-items-center justify-content-center">
                                                <div className="avatar-circle-sm me-3 bg-primary-subtle text-primary">
                                                    {provider.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-start">
                                                    <h5 className="fw-bold mb-0">{provider.name}</h5>
                                                    <small className="text-muted">{provider.serviceType}</small>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="border-top pt-3">
                                            <Row>
                                                <Col md={6} className="mb-3">
                                                    <small className="text-muted d-block">Scheduled Date</small>
                                                    <strong>{bookingDetails?.date ? formatDate(bookingDetails.date) : 'N/A'}</strong>
                                                </Col>
                                                <Col md={6} className="mb-3">
                                                    <small className="text-muted d-block">Time Slot</small>
                                                    <strong>{bookingDetails?.time || 'N/A'}</strong>
                                                </Col>
                                                <Col md={12}>
                                                    <small className="text-muted d-block">Booking ID</small>
                                                    <strong className="text-primary">{bookingDetails?.id || 'N/A'}</strong>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Card.Body>
                                </Card>
                                
                                <Alert variant="info" className="border-0 bg-info-subtle">
                                    <div className="d-flex align-items-start">
                                        <Clock className="me-2 mt-1 text-info" />
                                        <div className="text-start">
                                            <h6 className="fw-bold mb-1">Waiting for Confirmation</h6>
                                            <p className="mb-0 small">
                                                Your booking is now pending. {provider.name} will review your request 
                                                and confirm within 24 hours. You'll receive a notification once confirmed.
                                            </p>
                                        </div>
                                    </div>
                                </Alert>
                                
                                <div className="mt-4">
                                    <small className="text-muted d-block mb-2">
                                        You can track this booking in your "My Bookings" section
                                    </small>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Booking Form View
                        <>
                            {bookingError && <Alert variant="danger" className="border-0 shadow-sm">{bookingError}</Alert>}

                            <Form>
                                <Row className="g-3">
                                    <Col xs={12}>
                                        <div className="p-3 bg-light rounded-3 mb-3 d-flex align-items-center">
                                            <div className="icon-circle bg-white text-primary me-3"><PersonCircle /></div>
                                            <div>
                                                <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Provider</small>
                                                <span className="fw-bold text-dark">{provider.name}</span>
                                            </div>
                                            <div className="ms-auto text-end">
                                                <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Rate</small>
                                                <span className="fw-bold text-success">₹{provider.serviceCharge}/hr</span>
                                            </div>
                                        </div>
                                    </Col>

                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="modal-label">Select Address</Form.Label>
                                            <div className="input-group-modern">
                                                <span className="input-icon"><GeoAlt /></span>
                                                <Form.Select 
                                                    className="form-control-modern"
                                                    value={selectedAddress}
                                                    onChange={(e) => setSelectedAddress(e.target.value)}
                                                    disabled={userAddresses.length === 0}
                                                >
                                                    <option value="">Choose service location...</option>
                                                    {userAddresses.map((addr) => (
                                                        <option key={addr.id} value={addr.id}>{addr.name} - {addr.city}</option>
                                                    ))}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="modal-label">Date</Form.Label>
                                            <div className="input-group-modern">
                                                <span className="input-icon"><CalendarEvent /></span>
                                                <Form.Control 
                                                    type="date" 
                                                    className="form-control-modern"
                                                    value={bookingDate}
                                                    onChange={(e) => setBookingDate(e.target.value)}
                                                    min={getMinDate()}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="modal-label">Time</Form.Label>
                                            <div className="input-group-modern">
                                                <span className="input-icon"><Clock /></span>
                                                <Form.Select 
                                                    className="form-control-modern"
                                                    value={bookingTime}
                                                    onChange={(e) => setBookingTime(e.target.value)}
                                                >
                                                    <option value="">Select slot...</option>
                                                    {generateTimeSlots().map(t => <option key={t} value={t}>{t}</option>)}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>
                                    </Col>

                                    <Col xs={12}>
                                        <Form.Group>
                                            <Form.Label className="modal-label">Description</Form.Label>
                                            <Form.Control 
                                                as="textarea" 
                                                rows={3} 
                                                className="form-control-modern"
                                                placeholder="Describe the issue in detail..."
                                                value={serviceDescription}
                                                onChange={(e) => setServiceDescription(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col xs={12}>
                                        <Form.Group>
                                            <Form.Label className="modal-label">Notes (Optional)</Form.Label>
                                            <Form.Control 
                                                as="textarea" 
                                                rows={2} 
                                                className="form-control-modern"
                                                placeholder="Gate code, parking instructions, etc."
                                                value={bookingNotes}
                                                onChange={(e) => setBookingNotes(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 bg-light px-4 py-3">
                    {bookingSuccess ? (
                        <>
                            <Button 
                                variant="outline-secondary" 
                                className="rounded-pill px-4"
                                onClick={handleCloseModal}
                            >
                                Close
                            </Button>
                            {/* <Button 
                                variant="primary" 
                                className="rounded-pill px-4 shadow-sm fw-bold"
                                onClick={handleViewBookings}
                            >
                                View My Bookings <ArrowRight className="ms-2"/>
                            </Button> */}
                        </>
                    ) : (
                        <>
                            <Button 
                                variant="link" 
                                className="text-muted text-decoration-none me-auto" 
                                onClick={handleCloseModal}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                className="rounded-pill px-4 shadow-sm fw-bold btn-gradient-primary"
                                onClick={handleSubmitBooking}
                                disabled={bookingLoading || !selectedAddress || !bookingDate || !bookingTime}
                            >
                                {bookingLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Booking...
                                    </>
                                ) : (
                                    <>
                                        Confirm Request <CreditCard className="ms-2"/>
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ServiceProviderDetails;