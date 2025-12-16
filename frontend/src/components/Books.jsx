// import React, { useState, useEffect } from 'react';
// import {
//     Container, Row, Col, Card, Button, Badge, Spinner, Alert,
//     Tab, Tabs, Modal, ListGroup
// } from 'react-bootstrap';
// import { 
//     Calendar, Clock, Person, CheckCircle, XCircle, ClockHistory, 
//     GeoAlt, CashStack, Envelope, Telephone, StarFill, FileText 
// } from 'react-bootstrap-icons';
// import { bookingService } from './BookingService';
// import ReviewModal from './ReviewModal';
// import axios from 'axios'; 
// import './Books.css'; 

// const api = axios.create({ baseURL: 'http://localhost:8080/api' });
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
// });

// function Books() {
//     const [bookings, setBookings] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [selectedBooking, setSelectedBooking] = useState(null);
//     const [showDetailModal, setShowDetailModal] = useState(false);
//     const [showReviewModal, setShowReviewModal] = useState(false);
//     const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

//     useEffect(() => {
//         fetchUserBookings();
//     }, []);

//     const fetchUserBookings = async () => {
//         try {
//             setLoading(true);
//             setError('');
//             const bookingsData = await bookingService.getUserBookings();
//             setBookings(bookingsData);
//         } catch (err) {
//             setError('Failed to load your bookings');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSubmitReview = async (reviewData) => {
//         try {
//             await api.post('/reviews', reviewData);
            
//             const updatedBookings = bookings.map(booking => 
//                 booking.id === reviewData.bookingId 
//                     ? { ...booking, hasReviewed: true }
//                     : booking
//             );
//             setBookings(updatedBookings);
//             alert('Thank you for your review!');
//         } catch (err) {
//             throw new Error(err.response?.data?.message || 'Failed to submit review');
//         }
//     };

//     const renderReviewButton = (booking) => {
//         if (booking.status === 'COMPLETED' && !booking.hasReviewed) {
//             return (
//                 <Button
//                     variant="outline-warning"
//                     size="sm"
//                     className="mt-2 w-100 rounded-pill fw-bold"
//                     onClick={(e) => {
//                         e.stopPropagation();
//                         setSelectedBookingForReview(booking);
//                         setShowReviewModal(true);
//                     }}
//                 >
//                     <StarFill className="me-1" /> Rate & Review
//                 </Button>
//             );
//         }
//         return null;
//     };

//     const getStatusBadge = (status) => {
//         const statusConfig = {
//             'PENDING': { variant: 'warning', text: 'Pending', icon: <ClockHistory className="me-1" /> },
//             'CONFIRMED': { variant: 'success', text: 'Confirmed', icon: <CheckCircle className="me-1" /> },
//             'IN_PROGRESS': { variant: 'info', text: 'In Progress', icon: <Clock className="me-1" /> },
//             'COMPLETED': { variant: 'primary', text: 'Completed', icon: <CheckCircle className="me-1" /> },
//             'CANCELLED': { variant: 'danger', text: 'Cancelled', icon: <XCircle className="me-1" /> },
//             'REJECTED': { variant: 'secondary', text: 'Rejected', icon: <XCircle className="me-1" /> }
//         };

//         const config = statusConfig[status] || { variant: 'secondary', text: status };
//         return (
//             <Badge bg={config.variant} className="status-badge px-3 py-2 rounded-pill fw-normal">
//                 {config.icon} {config.text}
//             </Badge>
//         );
//     };

//     const getStatusMessage = (status) => {
//         const messages = {
//             'PENDING': 'Waiting for provider confirmation.',
//             'CONFIRMED': 'Booking confirmed! Provider will contact you.',
//             'IN_PROGRESS': 'Service is currently in progress.',
//             'COMPLETED': 'Service completed successfully.',
//             'CANCELLED': 'This booking has been cancelled.',
//             'REJECTED': 'Provider could not accept this booking.'
//         };
//         return messages[status] || '';
//     };

//     const BookingCard = ({ booking }) => {
//         const dateObj = new Date(booking.bookingDate);
//         const day = dateObj.getDate();
//         const month = dateObj.toLocaleString('default', { month: 'short' });
        
//         return (
//             <Col lg={6} key={booking.id} className="mb-4">
//                 <Card 
//                     className="booking-card h-100 border-0 shadow-sm"
//                     onClick={() => {
//                         setSelectedBooking(booking);
//                         setShowDetailModal(true);
//                     }}
//                 >
//                     <Card.Body className="p-0">
//                         <div className="d-flex">
//                             {/* Date Column */}
//                             <div className="booking-date-col text-center p-3 d-flex flex-column justify-content-center">
//                                 <span className="d-block h3 mb-0 fw-bold">{day}</span>
//                                 <span className="d-block text-uppercase small fw-bold">{month}</span>
//                                 <div className="booking-time-badge mt-2">
//                                     {booking.bookingTime}
//                                 </div>
//                             </div>
                            
//                             <div className="p-3 flex-grow-1">
//                                 <div className="d-flex justify-content-between align-items-start mb-2">
//                                     <h5 className="fw-bold text-dark mb-0">{booking.serviceType}</h5>
//                                     {getStatusBadge(booking.status)}
//                                 </div>
                                
//                                 <div className="text-muted small mb-2">
//                                     <Person className="me-1" /> {booking.providerName}
//                                 </div>
                                
//                                 <div className="d-flex justify-content-between align-items-end mt-3">
//                                     <div>
//                                         {booking.totalAmount > 0 ? (
//                                             <span className="text-primary fw-bold h5">₹{booking.totalAmount}</span>
//                                         ) : (
//                                             <span className="text-muted small">Price TBD</span>
//                                         )}
//                                     </div>
//                                     <div style={{minWidth: '120px'}}>
//                                         <Button variant="light" size="sm" className="w-100 rounded-pill text-primary fw-bold">
//                                             Details
//                                         </Button>
//                                         {renderReviewButton(booking)}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </Card.Body>
//                 </Card>
//             </Col>
//         );
//     };

//     const pendingBookings = bookings.filter(b => b.status === 'PENDING');
//     const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS');
    
    
//     if (loading) {
//         return (
//             <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
//                 <div className="text-center">
//                     <Spinner animation="border" role="status" variant="primary" style={{width: '3rem', height: '3rem'}} />
//                     <p className="mt-3 text-muted fw-bold">Loading your history...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="books-page">
//             <div className="books-hero mb-5">
//                 <Container>
//                     <h1 className="display-5 fw-bold text-white mb-2">My Bookings</h1>
//                     <p className="text-white-50 lead mb-0">Track your service history and upcoming appointments</p>
//                 </Container>
//             </div>

//             <Container className="mb-5" style={{marginTop: '-40px'}}>
//                 {error && <Alert variant="danger" className="shadow-sm border-0 rounded-3">{error}</Alert>}

//                 <Card className="border-0 shadow-lg rounded-4 overflow-hidden" style={{minHeight: '500px'}}>
//                     <Card.Body className="p-4">
//                         <Tabs defaultActiveKey="all" className="modern-tabs mb-4 nav-fill">
//                             <Tab eventKey="all" title={`All Bookings (${bookings.length})`}>
//                                 {bookings.length === 0 ? (
//                                     <div className="text-center py-5">
//                                         <div className="display-1 text-muted opacity-25 mb-3">📅</div>
//                                         <h4>No Bookings Yet</h4>
//                                         <p className="text-muted">You haven't made any service requests.</p>
//                                     </div>
//                                 ) : (
//                                     <Row>{bookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}</Row>
//                                 )}
//                             </Tab>

//                             <Tab eventKey="pending" title={`Pending (${pendingBookings.length})`}>
//                                 {pendingBookings.length === 0 ? (
//                                     <div className="text-center py-5">
//                                         <div className="display-1 text-muted opacity-25 mb-3">⏳</div>
//                                         <h4>No Pending Requests</h4>
//                                         <p className="text-muted">All your requests have been processed.</p>
//                                     </div>
//                                 ) : (
//                                     <Row>{pendingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}</Row>
//                                 )}
//                             </Tab>

//                             <Tab eventKey="confirmed" title={`Upcoming (${confirmedBookings.length})`}>
//                                 {confirmedBookings.length === 0 ? (
//                                     <div className="text-center py-5">
//                                         <div className="display-1 text-muted opacity-25 mb-3">✅</div>
//                                         <h4>No Upcoming Jobs</h4>
//                                         <p className="text-muted">You have no confirmed services scheduled.</p>
//                                     </div>
//                                 ) : (
//                                     <Row>{confirmedBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}</Row>
//                                 )}
//                             </Tab>
//                         </Tabs>
//                     </Card.Body>
//                 </Card>
//             </Container>

//             {/* Detail Modal */}
//             <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered className="modern-modal">
//                 <Modal.Header closeButton className="border-0 bg-light">
//                     <Modal.Title className="fw-bold">Booking Details</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body className="p-0">
//                     {selectedBooking && (
//                         <div>
//                             {/* Status Banner */}
//                             <div className="bg-light p-4 text-center border-bottom">
//                                 <div className="mb-2">{getStatusBadge(selectedBooking.status)}</div>
//                                 <p className="text-muted mb-0">{getStatusMessage(selectedBooking.status)}</p>
//                             </div>

//                             <div className="p-4">
//                                 <Row className="g-4">
//                                     {/* Service Info */}
//                                     <Col md={6}>
//                                         <h6 className="text-uppercase text-muted small fw-bold mb-3">Service Info</h6>
//                                         <ListGroup variant="flush">
//                                             <ListGroup.Item className="d-flex align-items-center ps-0">
//                                                 <div className="icon-square bg-blue-soft text-primary me-3"><FileText /></div>
//                                                 <div>
//                                                     <small className="text-muted d-block">Type</small>
//                                                     <span className="fw-medium">{selectedBooking.serviceType}</span>
//                                                 </div>
//                                             </ListGroup.Item>
//                                             <ListGroup.Item className="d-flex align-items-center ps-0">
//                                                 <div className="icon-square bg-green-soft text-success me-3"><Calendar /></div>
//                                                 <div>
//                                                     <small className="text-muted d-block">Date & Time</small>
//                                                     <span className="fw-medium">
//                                                         {new Date(selectedBooking.bookingDate).toLocaleDateString()} at {selectedBooking.bookingTime}
//                                                     </span>
//                                                 </div>
//                                             </ListGroup.Item>
//                                             {selectedBooking.totalAmount > 0 && (
//                                                 <ListGroup.Item className="d-flex align-items-center ps-0">
//                                                     <div className="icon-square bg-yellow-soft text-warning me-3"><CashStack /></div>
//                                                     <div>
//                                                         <small className="text-muted d-block">Total Amount</small>
//                                                         <span className="fw-bold text-dark">₹{selectedBooking.totalAmount}</span>
//                                                     </div>
//                                                 </ListGroup.Item>
//                                             )}
//                                         </ListGroup>
//                                     </Col>

//                                     {/* Provider Info */}
//                                     <Col md={6}>
//                                         <h6 className="text-uppercase text-muted small fw-bold mb-3">Provider Details</h6>
//                                         <ListGroup variant="flush">
//                                             <ListGroup.Item className="d-flex align-items-center ps-0">
//                                                 <div className="icon-square bg-purple-soft text-info me-3"><Person /></div>
//                                                 <div>
//                                                     <small className="text-muted d-block">Name</small>
//                                                     <span className="fw-medium">{selectedBooking.providerName}</span>
//                                                 </div>
//                                             </ListGroup.Item>
//                                             <ListGroup.Item className="d-flex align-items-center ps-0">
//                                                 <div className="icon-square bg-light text-secondary me-3"><Telephone /></div>
//                                                 <div>
//                                                     <small className="text-muted d-block">Phone</small>
//                                                     <span className="fw-medium">{selectedBooking.providerPhone || 'N/A'}</span>
//                                                 </div>
//                                             </ListGroup.Item>
//                                             <ListGroup.Item className="d-flex align-items-center ps-0">
//                                                 <div className="icon-square bg-light text-secondary me-3"><Envelope /></div>
//                                                 <div>
//                                                     <small className="text-muted d-block">Email</small>
//                                                     <span className="fw-medium">{selectedBooking.providerEmail || 'N/A'}</span>
//                                                 </div>
//                                             </ListGroup.Item>
//                                         </ListGroup>
//                                     </Col>

//                                     {/* Full Width Sections */}
//                                     <Col md={12}>
//                                         <div className="p-3 bg-light rounded-3 mb-3">
//                                             <div className="d-flex mb-2">
//                                                 <GeoAlt className="text-primary me-2 mt-1" />
//                                                 <span className="fw-bold">Service Location</span>
//                                             </div>
//                                             {selectedBooking.address ? (
//                                                 <p className="mb-0 text-muted ms-4">
//                                                     {selectedBooking.address.name}<br/>
//                                                     {selectedBooking.address.address}, {selectedBooking.address.city} - {selectedBooking.address.pincode}
//                                                 </p>
//                                             ) : <p className="text-muted ms-4">Address not available</p>}
//                                         </div>
//                                     </Col>

//                                     {(selectedBooking.description || selectedBooking.userNotes) && (
//                                         <Col md={12}>
//                                             <h6 className="text-uppercase text-muted small fw-bold">Notes</h6>
//                                             <p className="text-muted small mb-0">
//                                                 {selectedBooking.description} <br/>
//                                                 {selectedBooking.userNotes && <em>Note: {selectedBooking.userNotes}</em>}
//                                             </p>
//                                         </Col>
//                                     )}
//                                 </Row>
//                             </div>
//                         </div>
//                     )}
//                 </Modal.Body>
//                 <Modal.Footer className="border-0">
//                     <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
//                 </Modal.Footer>
//             </Modal>

//             {/* Review Modal */}
//             <ReviewModal
//                 show={showReviewModal}
//                 onHide={() => {
//                     setShowReviewModal(false);
//                     setSelectedBookingForReview(null);
//                 }}
//                 booking={selectedBookingForReview}
//                 onSubmit={handleSubmitReview}
//             />
//         </div>
//     );
// }

// export default Books;



import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Badge, Spinner, Alert,
    Tab, Tabs, Modal, ListGroup
} from 'react-bootstrap';
import { 
    Calendar, Clock, Person, CheckCircle, XCircle, ClockHistory, 
    GeoAlt, CashStack, Envelope, Telephone, StarFill, FileText 
} from 'react-bootstrap-icons';
import { bookingService } from './BookingService';
import ReviewModal from './ReviewModal';
import axios from 'axios'; 
import './Books.css';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

function Books() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

    useEffect(() => {
        fetchUserBookings();
    }, []);

    const fetchUserBookings = async () => {
        try {
            setLoading(true);
            setError('');
            const bookingsData = await bookingService.getUserBookings();
            setBookings(bookingsData);
        } catch (err) {
            setError('Failed to load your bookings');
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            await api.post('/reviews', reviewData);
            
            const updatedBookings = bookings.map(booking => 
                booking.id === reviewData.bookingId 
                    ? { ...booking, hasReviewed: true }
                    : booking
            );
            setBookings(updatedBookings);
            alert('Thank you for your review!');
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Failed to submit review');
        }
    };

    const renderReviewButton = (booking) => {
        if (booking.status === 'COMPLETED' && !booking.hasReviewed) {
            return (
                <Button
                    variant="outline-warning"
                    size="sm"
                    className="mt-2 w-100 rounded-pill fw-bold"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBookingForReview(booking);
                        setShowReviewModal(true);
                    }}
                >
                    <StarFill className="me-1" /> Rate & Review
                </Button>
            );
        }
        return null;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': { variant: 'warning', text: 'Pending', icon: <ClockHistory className="me-1" /> },
            'CONFIRMED': { variant: 'success', text: 'Confirmed', icon: <CheckCircle className="me-1" /> },
            'IN_PROGRESS': { variant: 'info', text: 'In Progress', icon: <Clock className="me-1" /> },
            'COMPLETED': { variant: 'primary', text: 'Completed', icon: <CheckCircle className="me-1" /> },
            'CANCELLED': { variant: 'danger', text: 'Cancelled', icon: <XCircle className="me-1" /> },
            'REJECTED': { variant: 'secondary', text: 'Rejected', icon: <XCircle className="me-1" /> }
        };

        const config = statusConfig[status] || { variant: 'secondary', text: status };
        return (
            <Badge bg={config.variant} className="status-badge px-3 py-2 rounded-pill fw-normal">
                {config.icon} {config.text}
            </Badge>
        );
    };

    const getStatusMessage = (status) => {
        const messages = {
            'PENDING': 'Waiting for provider confirmation.',
            'CONFIRMED': 'Booking confirmed! Provider will contact you.',
            'IN_PROGRESS': 'Service is currently in progress.',
            'COMPLETED': 'Service completed successfully.',
            'CANCELLED': 'This booking has been cancelled.',
            'REJECTED': 'Provider could not accept this booking.'
        };
        return messages[status] || '';
    };

    const BookingCard = ({ booking }) => {
        const dateObj = new Date(booking.bookingDate);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('default', { month: 'short' });
        
        return (
            <Col lg={6} key={booking.id} className="mb-4">
                <Card 
                    className="booking-card h-100 border-0 shadow-sm"
                    onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetailModal(true);
                    }}
                >
                    <Card.Body className="p-0">
                        <div className="d-flex">
                            {/* Date Column */}
                            <div className="booking-date-col text-center p-3 d-flex flex-column justify-content-center">
                                <span className="d-block h3 mb-0 fw-bold">{day}</span>
                                <span className="d-block text-uppercase small fw-bold">{month}</span>
                                <div className="booking-time-badge mt-2">
                                    {booking.bookingTime}
                                </div>
                            </div>
                            
                            <div className="p-3 flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="fw-bold text-dark mb-0">{booking.serviceType}</h5>
                                    {getStatusBadge(booking.status)}
                                </div>
                                
                                <div className="text-muted small mb-2">
                                    <Person className="me-1" /> {booking.providerName}
                                </div>
                                
                                <div className="d-flex justify-content-between align-items-end mt-3">
                                    <div>
                                        {booking.totalAmount > 0 ? (
                                            <span className="text-primary fw-bold h5">₹{booking.totalAmount}</span>
                                        ) : (
                                            <span className="text-muted small">Price TBD</span>
                                        )}
                                    </div>
                                    <div style={{minWidth: '120px'}}>
                                        <Button variant="light" size="sm" className="w-100 rounded-pill text-primary fw-bold">
                                            Details
                                        </Button>
                                        {renderReviewButton(booking)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        );
    };

    const pendingBookings = bookings.filter(b => b.status === 'PENDING');
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS');
    
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
                <div className="text-center">
                    <Spinner animation="border" role="status" variant="primary" style={{width: '3rem', height: '3rem'}} />
                    <p className="mt-3 text-muted fw-bold">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="books-page">
            <div className="books-hero mb-5">
                <Container>
                    <h1 className="display-5 fw-bold text-white mb-2">My Bookings</h1>
                    <p className="text-white-50 lead mb-0">Track your service history and upcoming appointments</p>
                </Container>
            </div>

            <Container className="mb-5" style={{marginTop: '-40px'}}>
                {error && <Alert variant="danger" className="shadow-sm border-0 rounded-3">{error}</Alert>}

                <Card className="border-0 shadow-lg rounded-4 overflow-hidden" style={{minHeight: '500px'}}>
                    <Card.Body className="p-4">
                        <Tabs defaultActiveKey="all" className="modern-tabs mb-4 nav-fill">
                            <Tab eventKey="all" title={`All Bookings (${bookings.length})`}>
                                {bookings.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="display-1 text-muted opacity-25 mb-3">📅</div>
                                        <h4>No Bookings Yet</h4>
                                        <p className="text-muted">You haven't made any service requests.</p>
                                        <Button 
                                            variant="primary" 
                                            className="mt-3 rounded-pill px-4"
                                            onClick={() => window.location.href = '/services'}
                                        >
                                            Browse Services
                                        </Button>
                                    </div>
                                ) : (
                                    <Row>
                                        {bookings.map(booking => (
                                            <BookingCard key={booking.id} booking={booking} />
                                        ))}
                                    </Row>
                                )}
                            </Tab>

                            <Tab eventKey="pending" title={`Pending (${pendingBookings.length})`}>
                                {pendingBookings.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="display-1 text-muted opacity-25 mb-3">⏳</div>
                                        <h4>No Pending Requests</h4>
                                        <p className="text-muted">All your requests have been processed.</p>
                                    </div>
                                ) : (
                                    <Row>
                                        {pendingBookings.map(booking => (
                                            <BookingCard key={booking.id} booking={booking} />
                                        ))}
                                    </Row>
                                )}
                            </Tab>

                            <Tab eventKey="confirmed" title={`Upcoming (${confirmedBookings.length})`}>
                                {confirmedBookings.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="display-1 text-muted opacity-25 mb-3">✅</div>
                                        <h4>No Upcoming Jobs</h4>
                                        <p className="text-muted">You have no confirmed services scheduled.</p>
                                    </div>
                                ) : (
                                    <Row>
                                        {confirmedBookings.map(booking => (
                                            <BookingCard key={booking.id} booking={booking} />
                                        ))}
                                    </Row>
                                )}
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>
            </Container>

            {/* Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered className="modern-modal">
                <Modal.Header closeButton className="border-0 bg-light">
                    <Modal.Title className="fw-bold">Booking Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {selectedBooking && (
                        <div>
                            {/* Status Banner */}
                            <div className="bg-light p-4 text-center border-bottom">
                                <div className="mb-2">{getStatusBadge(selectedBooking.status)}</div>
                                <p className="text-muted mb-0">{getStatusMessage(selectedBooking.status)}</p>
                            </div>

                            <div className="p-4">
                                <Row className="g-4">
                                    {/* Service Info */}
                                    <Col md={6}>
                                        <h6 className="text-uppercase text-muted small fw-bold mb-3">Service Info</h6>
                                        <ListGroup variant="flush">
                                            <ListGroup.Item className="d-flex align-items-center ps-0">
                                                <div className="icon-square bg-blue-soft text-primary me-3"><FileText /></div>
                                                <div>
                                                    <small className="text-muted d-block">Type</small>
                                                    <span className="fw-medium">{selectedBooking.serviceType}</span>
                                                </div>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="d-flex align-items-center ps-0">
                                                <div className="icon-square bg-green-soft text-success me-3"><Calendar /></div>
                                                <div>
                                                    <small className="text-muted d-block">Date & Time</small>
                                                    <span className="fw-medium">
                                                        {new Date(selectedBooking.bookingDate).toLocaleDateString()} at {selectedBooking.bookingTime}
                                                    </span>
                                                </div>
                                            </ListGroup.Item>
                                            {selectedBooking.totalAmount > 0 && (
                                                <ListGroup.Item className="d-flex align-items-center ps-0">
                                                    <div className="icon-square bg-yellow-soft text-warning me-3"><CashStack /></div>
                                                    <div>
                                                        <small className="text-muted d-block">Total Amount</small>
                                                        <span className="fw-bold text-dark">₹{selectedBooking.totalAmount}</span>
                                                    </div>
                                                </ListGroup.Item>
                                            )}
                                        </ListGroup>
                                    </Col>

                                    {/* Provider Info */}
                                    <Col md={6}>
                                        <h6 className="text-uppercase text-muted small fw-bold mb-3">Provider Details</h6>
                                        <ListGroup variant="flush">
                                            <ListGroup.Item className="d-flex align-items-center ps-0">
                                                <div className="icon-square bg-purple-soft text-info me-3"><Person /></div>
                                                <div>
                                                    <small className="text-muted d-block">Name</small>
                                                    <span className="fw-medium">{selectedBooking.providerName}</span>
                                                </div>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="d-flex align-items-center ps-0">
                                                <div className="icon-square bg-light text-secondary me-3"><Telephone /></div>
                                                <div>
                                                    <small className="text-muted d-block">Phone</small>
                                                    <span className="fw-medium">{selectedBooking.providerPhone || 'N/A'}</span>
                                                </div>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="d-flex align-items-center ps-0">
                                                <div className="icon-square bg-light text-secondary me-3"><Envelope /></div>
                                                <div>
                                                    <small className="text-muted d-block">Email</small>
                                                    <span className="fw-medium">{selectedBooking.providerEmail || 'N/A'}</span>
                                                </div>
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </Col>

                                    {/* Full Width Sections */}
                                    <Col md={12}>
                                        <div className="p-3 bg-light rounded-3 mb-3">
                                            <div className="d-flex mb-2">
                                                <GeoAlt className="text-primary me-2 mt-1" />
                                                <span className="fw-bold">Service Location</span>
                                            </div>
                                            {selectedBooking.address ? (
                                                <p className="mb-0 text-muted ms-4">
                                                    {selectedBooking.address.name}<br/>
                                                    {selectedBooking.address.address}, {selectedBooking.address.city} - {selectedBooking.address.pincode}
                                                </p>
                                            ) : <p className="text-muted ms-4">Address not available</p>}
                                        </div>
                                    </Col>

                                    {(selectedBooking.description || selectedBooking.userNotes) && (
                                        <Col md={12}>
                                            <h6 className="text-uppercase text-muted small fw-bold">Notes</h6>
                                            <p className="text-muted small mb-0">
                                                {selectedBooking.description} <br/>
                                                {selectedBooking.userNotes && <em>Note: {selectedBooking.userNotes}</em>}
                                            </p>
                                        </Col>
                                    )}
                                </Row>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Review Modal */}
            <ReviewModal
                show={showReviewModal}
                onHide={() => {
                    setShowReviewModal(false);
                    setSelectedBookingForReview(null);
                }}
                booking={selectedBookingForReview}
                onSubmit={handleSubmitReview}
            />
        </div>
    );
}

export default Books;