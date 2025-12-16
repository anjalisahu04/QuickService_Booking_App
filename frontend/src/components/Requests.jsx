import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Badge, Spinner, Alert,
    Tab, Tabs, Modal, ListGroup
} from 'react-bootstrap';
import { 
    Calendar, Clock, Person, CheckCircle, XCircle, ClockHistory, 
    GeoAlt, Telephone, Envelope, ExclamationTriangle, Briefcase, 
    CurrencyRupee, ArrowRight
} from 'react-bootstrap-icons';
import { bookingService } from './BookingService';
import { useNavigate } from 'react-router-dom';

function Requests() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // --- CUSTOM STYLES (Injected CSS) ---
    const customStyles = `
        .dashboard-bg {
            background-color: #f8f9fa;
            min-height: 100vh;
        }
        .header-section {
            background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
            color: white;
            padding: 40px 0;
            margin-bottom: 30px;
            border-radius: 0 0 20px 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .request-card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
            background: white;
            overflow: hidden;
            height: 100%;
        }
        .request-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }
        .card-header-custom {
            background-color: transparent;
            padding: 20px 20px 0 20px;
            border: none;
        }
        .card-body-custom {
            padding: 20px;
        }
        .info-pill {
            background-color: #f1f4f9;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.9rem;
            color: #495057;
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .status-badge-custom {
            padding: 8px 16px;
            border-radius: 30px;
            font-weight: 600;
            letter-spacing: 0.5px;
            font-size: 0.75rem;
            text-transform: uppercase;
        }
        .nav-tabs-custom {
            border-bottom: none;
            margin-bottom: 20px;
            gap: 10px;
        }
        .nav-tabs-custom .nav-link {
            border: none;
            border-radius: 30px;
            padding: 10px 20px;
            color: #6c757d;
            font-weight: 600;
            background-color: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            transition: all 0.2s;
        }
        .nav-tabs-custom .nav-link.active {
            background-color: #0d6efd;
            color: white;
            box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
        }
        .action-btn {
            border-radius: 10px;
            padding: 8px 15px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s;
        }
        .empty-state {
            background: white;
            border-radius: 20px;
            padding: 60px 20px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        }
        .price-tag {
            font-size: 1.2rem;
            font-weight: 700;
            color: #198754;
        }
    `;

    useEffect(() => {
        fetchProviderBookings();
    }, []);

    const fetchProviderBookings = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('🔄 Fetching provider bookings...');
            
            const bookingsData = await bookingService.getProviderBookings();
            console.log('✅ Provider bookings loaded:', bookingsData);
            
            // Sort bookings by creation date (newest first)
            const sortedBookings = bookingsData.sort((a, b) => 
                new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate)
            );
            
            setBookings(sortedBookings);
        } catch (err) {
            console.error('❌ Error fetching provider bookings:', err);
            const errorMessage = err.message || 'Failed to load service requests';
            setError(errorMessage);
            
            if (errorMessage.includes('Authentication failed') || errorMessage.includes('401')) {
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (bookingId, newStatus) => {
        try {
            setActionLoading(true);
            console.log(`🔄 Updating booking ${bookingId} to status: ${newStatus}`);
            
            await bookingService.updateBookingStatus(bookingId, newStatus);
            
            setBookings(prev => {
                const updated = prev.map(booking => 
                    booking.id === bookingId 
                        ? { ...booking, status: newStatus }
                        : booking
                );
                return updated.sort((a, b) => 
                    new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate)
                );
            });
            
            setSuccessMessage(`Booking ${newStatus.toLowerCase()} successfully!`);
            setTimeout(() => setSuccessMessage(''), 3000);
            
            setShowDetailModal(false);
            setSelectedBooking(null);
            
        } catch (err) {
            console.error('❌ Error updating booking status:', err);
            setError(err.message || 'Failed to update booking status');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': { bg: 'warning', text: '#856404', label: 'Pending Approval', icon: <ClockHistory /> },
            'CONFIRMED': { bg: 'success', text: '#fff', label: 'Confirmed', icon: <CheckCircle /> },
            'IN_PROGRESS': { bg: 'info', text: '#fff', label: 'In Progress', icon: <Clock /> },
            'COMPLETED': { bg: 'primary', text: '#fff', label: 'Completed', icon: <CheckCircle /> },
            'CANCELLED': { bg: 'danger', text: '#fff', label: 'Cancelled', icon: <XCircle /> },
            'REJECTED': { bg: 'secondary', text: '#fff', label: 'Rejected', icon: <XCircle /> }
        };

        const config = statusConfig[status] || { bg: 'secondary', text: '#fff', label: status, icon: null };
        
        return (
            <span className={`status-badge-custom bg-${config.bg} text-${config.bg === 'warning' ? 'dark' : 'white'} d-inline-flex align-items-center gap-2 shadow-sm`}>
                {config.icon} {config.label}
            </span>
        );
    };

    const handleRetry = () => {
        setError('');
        fetchProviderBookings();
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const pendingBookings = bookings.filter(b => b.status === 'PENDING').sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate));
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate));
    const inProgressBookings = bookings.filter(b => b.status === 'IN_PROGRESS').sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate));
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate));
    const allBookings = [...bookings].sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate));

    // --- REUSABLE COMPONENT FOR BOOKING CARD ---
    const BookingCard = ({ booking, actions }) => (
        <Col lg={6} xl={4} key={booking.id} className="mb-4">
            <div className="request-card h-100 d-flex flex-column">
                <div className="card-header-custom d-flex justify-content-between align-items-start">
                    <div>
                        <div className="text-muted small text-uppercase fw-bold mb-1">
                            {booking.serviceType}
                        </div>
                        <h5 className="fw-bold mb-0 text-dark">
                            {new Date(booking.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                            <span className="text-muted fw-normal ms-2">at {booking.bookingTime}</span>
                        </h5>
                    </div>
                    {getStatusBadge(booking.status)}
                </div>

                <div className="card-body-custom flex-grow-1">
                    <div className="info-pill">
                        <Person className="me-2 text-primary" />
                        <span className="text-truncate fw-medium">{booking.userName}</span>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="info-pill mb-0 flex-grow-1 me-2">
                            <ClockHistory className="me-2 text-muted" />
                            <small>Sent: {new Date(booking.createdAt || booking.bookingDate).toLocaleDateString()}</small>
                        </div>
                        {booking.totalAmount > 0 && (
                            <div className="price-tag">
                                ₹{booking.totalAmount}
                            </div>
                        )}
                    </div>

                    {booking.description && (
                        <p className="text-muted small mt-3 mb-0 border-top pt-2 fst-italic">
                            "{booking.description.length > 60 ? booking.description.substring(0, 60) + '...' : booking.description}"
                        </p>
                    )}
                </div>

                <div className="p-3 bg-light border-top d-flex gap-2">
                    {actions}
                    <Button 
                        variant="light" 
                        className="action-btn text-primary border-0 ms-auto"
                        onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetailModal(true);
                        }}
                    >
                        Details <ArrowRight />
                    </Button>
                </div>
            </div>
        </Col>
    );

    // --- MAIN RENDER ---
    return (
        <div className="dashboard-bg pb-5">
            <style>{customStyles}</style>

            {/* Header Section */}
            <div className="header-section">
                <Container>
                    <Row className="align-items-center">
                        <Col>
                            <h1 className="fw-bold mb-1">Service Requests</h1>
                            <p className="mb-0 opacity-75">Manage bookings and track your service history</p>
                        </Col>
                        <Col xs="auto">
                            <Button variant="light" className="rounded-pill px-4 fw-bold text-primary" onClick={handleRetry}>
                                Refresh Data
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container style={{ marginTop: '-40px' }}>
                {error && (
                    <Alert variant="danger" className="shadow-sm border-0 rounded-3 mb-4">
                        <div className="d-flex align-items-center">
                            <ExclamationTriangle className="me-2 fs-4" />
                            <div>
                                <strong>Connection Error</strong>
                                <div className="small">{error}</div>
                            </div>
                            <div className="ms-auto">
                                {error.includes('Authentication') ? (
                                    <Button variant="outline-danger" size="sm" onClick={handleLoginRedirect}>Login</Button>
                                ) : (
                                    <Button variant="outline-danger" size="sm" onClick={handleRetry}>Retry</Button>
                                )}
                            </div>
                        </div>
                    </Alert>
                )}

                {successMessage && (
                    <div className="position-fixed top-0 start-50 translate-middle-x mt-4" style={{ zIndex: 1050 }}>
                        <Alert variant="success" className="shadow-lg border-0 rounded-pill px-4 py-2 d-flex align-items-center">
                            <CheckCircle className="me-2" /> {successMessage}
                        </Alert>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="grow" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                        <p className="mt-3 text-muted fw-medium">Syncing requests...</p>
                    </div>
                ) : !error && (
                    <Tabs defaultActiveKey="pending" className="nav-tabs-custom border-0 justify-content-center justify-content-md-start">
                        
                        <Tab eventKey="pending" title={<span>Pending <Badge bg="warning" text="dark" pill className="ms-1">{pendingBookings.length}</Badge></span>}>
                            {pendingBookings.length === 0 ? (
                                <div className="empty-state">
                                    <div className="display-4 mb-3">🎉</div>
                                    <h4>All Caught Up!</h4>
                                    <p className="text-muted">No pending requests waiting for your approval.</p>
                                </div>
                            ) : (
                                <Row>
                                    {pendingBookings.map(booking => (
                                        <BookingCard 
                                            key={booking.id} 
                                            booking={booking}
                                            actions={
                                                <>
                                                    <Button variant="success" size="sm" className="action-btn flex-fill" onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')} disabled={actionLoading}>
                                                        Accept
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" className="action-btn flex-fill" onClick={() => updateBookingStatus(booking.id, 'REJECTED')} disabled={actionLoading}>
                                                        Reject
                                                    </Button>
                                                </>
                                            }
                                        />
                                    ))}
                                </Row>
                            )}
                        </Tab>

                        <Tab eventKey="confirmed" title={<span>Confirmed <Badge bg="success" pill className="ms-1">{confirmedBookings.length}</Badge></span>}>
                            {confirmedBookings.length === 0 ? (
                                <div className="empty-state">
                                    <div className="display-4 mb-3 text-muted">📅</div>
                                    <h4>No Upcoming Jobs</h4>
                                    <p className="text-muted">Accept pending requests to populate this list.</p>
                                </div>
                            ) : (
                                <Row>
                                    {confirmedBookings.map(booking => (
                                        <BookingCard 
                                            key={booking.id} 
                                            booking={booking}
                                            actions={
                                                <Button variant="info" className="action-btn text-white flex-fill" onClick={() => updateBookingStatus(booking.id, 'IN_PROGRESS')} disabled={actionLoading}>
                                                    <Clock /> Start Job
                                                </Button>
                                            }
                                        />
                                    ))}
                                </Row>
                            )}
                        </Tab>

                        <Tab eventKey="in-progress" title={<span>In Progress <Badge bg="info" pill className="ms-1">{inProgressBookings.length}</Badge></span>}>
                            {inProgressBookings.length === 0 ? (
                                <div className="empty-state">
                                    <div className="display-4 mb-3 text-muted">🛠️</div>
                                    <h4>No Active Jobs</h4>
                                    <p className="text-muted">Start a confirmed job to see it here.</p>
                                </div>
                            ) : (
                                <Row>
                                    {inProgressBookings.map(booking => (
                                        <BookingCard 
                                            key={booking.id} 
                                            booking={booking}
                                            actions={
                                                <Button variant="primary" className="action-btn flex-fill" onClick={() => updateBookingStatus(booking.id, 'COMPLETED')} disabled={actionLoading}>
                                                    <CheckCircle /> Finish
                                                </Button>
                                            }
                                        />
                                    ))}
                                </Row>
                            )}
                        </Tab>

                        <Tab eventKey="completed" title={<span>History</span>}>
                            {completedBookings.length === 0 ? (
                                <div className="empty-state">
                                    <div className="display-4 mb-3 text-muted">📜</div>
                                    <h4>Clean History</h4>
                                    <p className="text-muted">Completed jobs will appear here.</p>
                                </div>
                            ) : (
                                <Row>
                                    {completedBookings.map(booking => (
                                        <BookingCard 
                                            key={booking.id} 
                                            booking={booking}
                                            actions={
                                                <div className="text-success fw-bold small d-flex align-items-center">
                                                    <CheckCircle className="me-1" /> Job Done
                                                </div>
                                            }
                                        />
                                    ))}
                                </Row>
                            )}
                        </Tab>

                        <Tab eventKey="all" title="All Requests">
                            <Row>
                                {allBookings.map(booking => (
                                    <BookingCard 
                                        key={booking.id} 
                                        booking={booking}
                                        actions={null} // No actions on generic view
                                    />
                                ))}
                            </Row>
                        </Tab>
                    </Tabs>
                )}

                {/* --- ENHANCED DETAIL MODAL --- */}
                <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
                    {selectedBooking && (
                        <>
                            <Modal.Header closeButton className="border-0 pb-0">
                                <div>
                                    <small className="text-muted text-uppercase fw-bold">Booking ID: #{selectedBooking.id}</small>
                                    <Modal.Title className="fw-bold">{selectedBooking.serviceType}</Modal.Title>
                                </div>
                            </Modal.Header>
                            <Modal.Body className="pt-2">
                                <div className="mb-4">
                                    {getStatusBadge(selectedBooking.status)}
                                </div>

                                <Row className="g-4">
                                    <Col md={6}>
                                        <Card className="h-100 border-0 bg-light">
                                            <Card.Body>
                                                <h6 className="fw-bold text-primary mb-3"><Calendar className="me-2" />Schedule Details</h6>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Date:</span>
                                                    <span className="fw-medium">{new Date(selectedBooking.bookingDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Time:</span>
                                                    <span className="fw-medium">{selectedBooking.bookingTime}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Created:</span>
                                                    <span className="fw-medium">{new Date(selectedBooking.createdAt || selectedBooking.bookingDate).toLocaleDateString()}</span>
                                                </div>
                                                <hr />
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-bold">Total Amount:</span>
                                                    <span className="fs-5 text-success fw-bold">₹{selectedBooking.totalAmount || 0}</span>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                    <Col md={6}>
                                        <Card className="h-100 border-0 bg-light">
                                            <Card.Body>
                                                <h6 className="fw-bold text-primary mb-3"><Person className="me-2" />Customer Info</h6>
                                                <div className="mb-2">
                                                    <div className="text-muted small">Name</div>
                                                    <div className="fw-medium">{selectedBooking.userName}</div>
                                                </div>
                                                <div className="mb-2">
                                                    <div className="text-muted small">Contact</div>
                                                    <div><a href={`tel:${selectedBooking.userPhone}`} className="text-decoration-none">{selectedBooking.userPhone}</a></div>
                                                    <div className="small text-muted">{selectedBooking.userEmail}</div>
                                                </div>
                                                {selectedBooking.address && (
                                                    <div className="mt-3">
                                                        <div className="text-muted small"><GeoAlt className="me-1" />Location</div>
                                                        <div>{selectedBooking.address.address}, {selectedBooking.address.city}</div>
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                    <Col xs={12}>
                                        {(selectedBooking.description || selectedBooking.userNotes) && (
                                            <div className="p-3 border rounded-3">
                                                {selectedBooking.description && (
                                                    <div className="mb-3">
                                                        <h6 className="fw-bold mb-1">Service Description</h6>
                                                        <p className="text-muted mb-0">{selectedBooking.description}</p>
                                                    </div>
                                                )}
                                                {selectedBooking.userNotes && (
                                                    <div>
                                                        <h6 className="fw-bold mb-1">Customer Notes</h6>
                                                        <p className="text-muted fst-italic mb-0">"{selectedBooking.userNotes}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer className="border-0 bg-light rounded-bottom">
                                <div className="d-flex gap-2 w-100 justify-content-end">
                                    <Button variant="outline-secondary" onClick={() => setShowDetailModal(false)}>
                                        Close
                                    </Button>
                                    
                                    {selectedBooking.status === 'PENDING' && (
                                        <>
                                            <Button variant="outline-danger" onClick={() => updateBookingStatus(selectedBooking.id, 'REJECTED')} disabled={actionLoading}>
                                                Reject Request
                                            </Button>
                                            <Button variant="success" onClick={() => updateBookingStatus(selectedBooking.id, 'CONFIRMED')} disabled={actionLoading}>
                                                Accept Request
                                            </Button>
                                        </>
                                    )}
                                    
                                    {selectedBooking.status === 'CONFIRMED' && (
                                        <Button variant="info" className="text-white" onClick={() => updateBookingStatus(selectedBooking.id, 'IN_PROGRESS')} disabled={actionLoading}>
                                            Start Job
                                        </Button>
                                    )}
                                    
                                    {selectedBooking.status === 'IN_PROGRESS' && (
                                        <Button variant="primary" onClick={() => updateBookingStatus(selectedBooking.id, 'COMPLETED')} disabled={actionLoading}>
                                            Mark Completed
                                        </Button>
                                    )}
                                </div>
                            </Modal.Footer>
                        </>
                    )}
                </Modal>
            </Container>
        </div>
    );
}

export default Requests;