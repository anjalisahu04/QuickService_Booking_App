import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Form, Badge, Spinner, Alert, InputGroup,
    Modal, Table
} from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, StarFill, GeoAlt, ArrowLeft, Calendar, Search, Person, Telephone, Cash, Clock, Shield, Tools, Filter } from 'react-bootstrap-icons';
import axios from 'axios';
import { bookingService } from './BookingService';
import { addressService } from './AddressService';
import './ServiceProviderList.css'; // Make sure to import the CSS file

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

function ServiceProviderList() {
    const location = useLocation();
    const navigate = useNavigate();
    const { category, userCities } = location.state || {};

    const [providers, setProviders] = useState([]);
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Admin management states
    const [showProviderModal, setShowProviderModal] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);

    // Booking modal states
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [serviceDescription, setServiceDescription] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentUser(user);
            setIsAdmin(user.role === 'ADMIN');
        }
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            loadUserAddresses();
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchServiceProviders();
    }, [category, userCities, isAdmin]);

    useEffect(() => {
        filterAndSortProviders();
    }, [providers, searchTerm, sortBy]);

    const loadUserAddresses = async () => {
        try {
            const addresses = await addressService.getAddresses();
            setUserAddresses(addresses);
            const defaultAddress = addresses.find(addr => addr.isDefault);
            if (defaultAddress) {
                setSelectedAddress(defaultAddress.id);
            } else if (addresses.length > 0) {
                setSelectedAddress(addresses[0].id);
            }
        } catch (err) {
            console.error('Error loading addresses:', err);
        }
    };

    const fetchServiceProviders = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/providers-with-addresses');
            let allProviders = response.data;

            if (!Array.isArray(allProviders)) {
                setError('No service providers available');
                setProviders([]);
                return;
            }

            if (isAdmin) {
                setProviders(allProviders);
                return;
            }

            let filteredProviders = allProviders;

            if (category) {
                const categoryMapping = {
                    'plumbing': ['plumber', 'plumbing', 'pipe', 'water', 'drain'],
                    'electrical': ['electrician', 'electrical', 'electric', 'wiring'],
                    'cleaning': ['cleaner', 'cleaning', 'clean', 'housekeeping'],
                    'painting': ['painter', 'painting', 'paint'],
                    'carpentry': ['carpenter', 'carpentry', 'woodwork', 'furniture'],
                    'appliance repair': ['appliance', 'repair', 'technician', 'service']
                };

                filteredProviders = allProviders.filter(provider => {
                    if (!provider.serviceType) return false;
                    const normalizedCategory = category.toLowerCase().trim();
                    const normalizedServiceType = provider.serviceType.toLowerCase().trim();
                    const possibleKeywords = categoryMapping[normalizedCategory] || [normalizedCategory];
                    return possibleKeywords.some(keyword => normalizedServiceType.includes(keyword));
                });
            }

            if (userCities && userCities.length > 0) {
                filteredProviders = filteredProviders.filter(provider => {
                    if (!provider.cities || !Array.isArray(provider.cities) || provider.cities.length === 0) return false;
                    return provider.cities.some(providerCity =>
                        userCities.some(userCity => 
                            userCity && providerCity && 
                            providerCity.toLowerCase().trim() === userCity.toLowerCase().trim()
                        )
                    );
                });
            }

            setProviders(filteredProviders);
            
            if (filteredProviders.length === 0) {
                if (category) {
                    setError(`No "${category}" service providers found.`);
                } else if (userCities && userCities.length > 0) {
                    setError(`No providers found in your area.`);
                } else {
                    setError(`No providers found.`);
                }
            }
            
        } catch (err) {
            console.error('Error fetching providers:', err);
            setError('Failed to load service providers.');
            setProviders([]);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortProviders = () => {
        let filtered = [...providers];

        if (searchTerm) {
            filtered = filtered.filter(provider =>
                (provider.name && provider.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (provider.serviceType && provider.serviceType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (getProviderPhone(provider) && getProviderPhone(provider).includes(searchTerm)) ||
                (isAdmin && provider.cities && provider.cities.some(city => 
                    city.toLowerCase().includes(searchTerm.toLowerCase())
                ))
            );
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'rating': return (b.rating || 0) - (a.rating || 0);
                case 'experience': return (b.experience || 0) - (a.experience || 0);
                case 'price-low': return (a.serviceCharge || 0) - (b.serviceCharge || 0);
                case 'price-high': return (b.serviceCharge || 0) - (a.serviceCharge || 0);
                default: return 0;
            }
        });

        setFilteredProviders(filtered);
    };

    const getProviderPhone = (provider) => {
        return provider.phone || provider.phoneNumber || provider.mobile || provider.contact || provider.contactNumber || null;
    };

    const renderStars = (rating) => {
        if (!rating || rating === 0) return null;
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<StarFill key={i} className="text-warning me-1" size={14} />);
            } else {
                stars.push(<Star key={i} className="text-muted me-1" size={14} />);
            }
        }
        return <div className="d-flex align-items-center">{stars}</div>;
    };

    const handleProviderAction = (provider) => {
        if (isAdmin) {
            setSelectedProvider(provider);
            setShowProviderModal(true);
        } else {
             navigate(`/provider/${provider.id}`,{        
            state: { 
                category, 
                userCities,
                provider 
            } 
});
        }
    };

    // const handleBookService = (provider) => {
    //     if (userAddresses.length === 0) {
    //         alert('Please add an address before booking.');
    //         navigate('/profile', { state: { openAddressTab: true } });
    //         return;
    //     }
    //     setSelectedProvider(provider);
    //     setShowBookingModal(true);
    //     setBookingError('');
    //     setBookingSuccess('');
    // };

    const handleManageProvider = (provider) => {
        alert(`Manage provider: ${provider.name}`);
    };

    const handleCloseProviderModal = () => {
        setShowProviderModal(false);
        setSelectedProvider(null);
    };

    const handleCloseBookingModal = () => {
        setShowBookingModal(false);
        setSelectedProvider(null);
        setBookingError('');
        setBookingSuccess('');
        setServiceDescription('');
        setBookingNotes('');
    };

    const handleSubmitBooking = async () => {
        if (!selectedAddress || !bookingDate || !bookingTime) {
            setBookingError('Please fill in all required fields.');
            return;
        }

        try {
            setBookingLoading(true);
            setBookingError('');

            const bookingData = {
                providerId: selectedProvider.id,
                addressId: selectedAddress,
                serviceType: selectedProvider.serviceType,
                description: serviceDescription,
                bookingDate: bookingDate,
                bookingTime: bookingTime,
                totalAmount: selectedProvider.serviceCharge || 0,
                userNotes: bookingNotes
            };

            await bookingService.createBooking(bookingData);
            setBookingSuccess(`Booking request sent to ${selectedProvider.name} successfully!`);

            setTimeout(() => {
                setShowBookingModal(false);
                setBookingSuccess('');
                setServiceDescription('');
                setBookingNotes('');
                setBookingDate('');
                setBookingTime('');
            }, 3000);
        } catch (err) {
            if (err.response?.status === 401) {
                setBookingError('Session expired. Please login again.');
            } else {
                setBookingError(err.response?.data?.message || 'Failed to book service.');
            }
        } finally {
            setBookingLoading(false);
        }
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return 'Not provided';
        const cleaned = phone.toString().replace(/\D/g, '');
        if (cleaned.length === 10) return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        return phone;
    };

    const getDisplayCities = (provider) => {
        if (provider.cities && Array.isArray(provider.cities) && provider.cities.length > 0) {
            return provider.cities.join(', ');
        }
        return 'Remote / Not specified';
    };

    const getStatusBadge = (provider) => {
        if (provider.isActive === false) return <Badge bg="danger">Disabled</Badge>;
        return <Badge bg="success">Active</Badge>;
    };

    const getMinDate = () => new Date().toISOString().split('T')[0];

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
            }
        }
        return slots;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
                <div className="text-center">
                    <Spinner animation="grow" variant="primary" style={{width: '3rem', height: '3rem'}} />
                    <p className="mt-3 text-muted fw-medium">Finding the best experts for you...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="service-list-page">
            {/* Attractive Header Section */}
            <div className="hero-header mb-5">
                <Container>
                    <div className="d-flex align-items-center mb-3">
                        <Button
                            variant="light"
                            className="rounded-circle p-2 back-btn shadow-sm"
                            onClick={() => navigate('/services')}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <div className="ms-3 text-white">
                            <h2 className="fw-bold mb-0">
                                {isAdmin ? 'Admin Dashboard' : (category ? `${category} Experts` : 'All Services')}
                            </h2>
                            <small className="opacity-75">
                                <GeoAlt className="me-1" size={12}/>
                                {isAdmin ? 'Global View' : (userCities && userCities.length > 0 ? userCities.join(', ') : 'All Locations')}
                            </small>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <Card className="search-card border-0 shadow-lg mt-4">
                        <Card.Body className="p-2">
                            <Row className="g-2 align-items-center">
                                <Col md={8}>
                                    <InputGroup className="modern-input-group">
                                        <InputGroup.Text className="bg-transparent border-0 ps-3">
                                            <Search className="text-muted" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            className="border-0 shadow-none bg-transparent"
                                            placeholder={isAdmin ? "Search database..." : "Search by name or service..."}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={4} className="border-start-md">
                                    <InputGroup className="modern-input-group">
                                        <InputGroup.Text className="bg-transparent border-0 ps-3">
                                            <Filter className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="border-0 shadow-none bg-transparent fw-medium text-dark"
                                            style={{cursor: 'pointer'}}
                                        >
                                            <option value="rating">Top Rated</option>
                                            <option value="experience">Most Experienced</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                        </Form.Select>
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Container>
            </div>

            <Container className="mb-5">
                {error && (
                    <Alert variant="info" className="shadow-sm border-0 rounded-3 mb-4">
                        <div className="d-flex align-items-center">
                            <Shield className="me-2 text-primary" size={20} />
                            {error}
                        </div>
                    </Alert>
                )}

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold text-dark mb-0">
                        {filteredProviders.length} <span className="text-muted fw-normal">Providers Found</span>
                    </h5>
                    {isAdmin && <Badge bg="primary" className="px-3 py-2 rounded-pill">Admin Mode</Badge>}
                </div>

                {filteredProviders.length === 0 && !loading ? (
                    <div className="text-center py-5 empty-state">
                        <div className="mb-3 display-1 opacity-25">🕵️‍♀️</div>
                        <h4 className="fw-bold text-muted">No providers match your search</h4>
                        <Button variant="outline-primary" className="mt-3 rounded-pill px-4" onClick={() => navigate('/services')}>
                            Browse All Categories
                        </Button>
                    </div>
                ) : (
                    <>
                        {isAdmin ? (
                            <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                                <Table hover responsive className="mb-0 align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="py-3 ps-4">Provider</th>
                                            <th className="py-3">Contact</th>
                                            <th className="py-3">Stats</th>
                                            <th className="py-3">Rating</th>
                                            <th className="py-3 pe-4 text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProviders.map((provider) => (
                                            <tr key={provider.id}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar-circle-sm me-3 bg-primary-subtle text-primary">
                                                            {(provider.name || 'P').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{provider.name}</div>
                                                            <small className="text-muted">{provider.serviceType}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="small text-muted">
                                                        <div className="mb-1"><Telephone size={10} className="me-1"/> {formatPhoneNumber(getProviderPhone(provider))}</div>
                                                        <div><GeoAlt size={10} className="me-1"/> {getDisplayCities(provider)}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg="light" text="dark" className="border me-1">{provider.experience} yrs</Badge>
                                                    <span className="text-success fw-bold small">₹{provider.serviceCharge}/hr</span>
                                                </td>
                                                <td>{renderStars(provider.rating)}</td>
                                                <td className="text-end pe-4">
                                                    <Button variant="light" size="sm" className="me-1" onClick={() => handleProviderAction(provider)}>View</Button>
                                                    <Button variant="primary" size="sm" onClick={() => handleManageProvider(provider)}>Manage</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card>
                        ) : (
                            /* Modern Card Grid for Users */
                            <Row className="g-4">
                                {filteredProviders.map((provider) => (
                                    <Col lg={4} md={6} key={provider.id}>
                                        <Card className="provider-card h-100 border-0 shadow-sm" onClick={() => handleProviderAction(provider)}>
                                            <Card.Body className="p-4 d-flex flex-column">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar-circle me-3">
                                                            {(provider.name || 'P').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h5 className="fw-bold mb-0 text-dark">{provider.name}</h5>
                                                            <small className="text-muted d-block">{provider.serviceType}</small>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        {provider.rating > 0 && (
                                                            <Badge bg="warning" text="dark" className="d-flex align-items-center py-1 px-2 rounded-pill">
                                                                <StarFill size={10} className="me-1" /> {provider.rating.toFixed(1)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="info-grid mb-4">
                                                    <div className="info-item">
                                                        <Clock className="text-primary me-2" />
                                                        <span>{provider.experience || 0} Years Exp.</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <GeoAlt className="text-primary me-2" />
                                                        <span className="text-truncate" style={{maxWidth: '120px'}}>{getDisplayCities(provider)}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <small className="text-muted d-block">Starts from</small>
                                                        <span className="h5 fw-bold text-primary mb-0">₹{provider.serviceCharge || '0'}</span>
                                                        <small className="text-muted">/hr</small>
                                                    </div>
                                                    <Button variant="primary" className="rounded-pill px-4 btn-book">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </>
                )}
            </Container>

            {/* Modals remain mostly functional, adding classNames for styling */}
            <Modal show={showProviderModal} onHide={handleCloseProviderModal} size="lg" centered className="modern-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Provider Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    {selectedProvider && (
                        <div className="text-center py-4">
                             <div className="avatar-circle mx-auto mb-3" style={{width: '100px', height: '100px', fontSize: '2.5rem'}}>
                                {(selectedProvider.name || 'P').charAt(0).toUpperCase()}
                            </div>
                            <h3>{selectedProvider.name}</h3>
                            <p className="text-muted">{selectedProvider.serviceType}</p>
                            
                            <Card className="bg-light border-0 mt-4 text-start">
                                <Card.Body>
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <strong className="d-block text-muted small">CONTACT</strong>
                                            {formatPhoneNumber(getProviderPhone(selectedProvider))}
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <strong className="d-block text-muted small">EXPERIENCE</strong>
                                            {selectedProvider.experience} Years
                                        </Col>
                                        <Col md={6}>
                                            <strong className="d-block text-muted small">RATE</strong>
                                            ₹{selectedProvider.serviceCharge}/hr
                                        </Col>
                                        <Col md={6}>
                                            <strong className="d-block text-muted small">LOCATION</strong>
                                            {getDisplayCities(selectedProvider)}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={handleCloseProviderModal}>Close</Button>
                    {isAdmin && <Button variant="warning" onClick={() => handleManageProvider(selectedProvider)}>Manage</Button>}
                </Modal.Footer>
            </Modal>

            {/* Booking Modal (Functional, cleaner UI) */}
            {!isAdmin && (
                <Modal show={showBookingModal} onHide={handleCloseBookingModal} size="lg" centered className="modern-modal">
                    <Modal.Header closeButton className="bg-primary text-white">
                        <Modal.Title className="fw-bold">Complete Booking</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        {selectedProvider && (
                            <>
                                <div className="d-flex align-items-center mb-4 p-3 bg-light rounded-3">
                                    <div className="avatar-circle-sm me-3 bg-white text-primary">
                                        {(selectedProvider.name || 'P').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">Booking with {selectedProvider.name}</h6>
                                        <small className="text-muted">{selectedProvider.serviceType} • ₹{selectedProvider.serviceCharge}/hr</small>
                                    </div>
                                </div>

                                {bookingSuccess && <Alert variant="success">{bookingSuccess}</Alert>}
                                {bookingError && <Alert variant="danger">{bookingError}</Alert>}

                                <Form>
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-medium small text-muted">DATE</Form.Label>
                                                <Form.Control type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={getMinDate()} className="modern-form-control" />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-medium small text-muted">TIME</Form.Label>
                                                <Form.Select value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="modern-form-control">
                                                    <option value="">Select Slot</option>
                                                    {generateTimeSlots().map(t => <option key={t} value={t}>{t}</option>)}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-medium small text-muted">ADDRESS</Form.Label>
                                                <Form.Select value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)} disabled={userAddresses.length === 0} className="modern-form-control">
                                                    <option value="">Select your address</option>
                                                    {userAddresses.map(addr => (
                                                        <option key={addr.id} value={addr.id}>{addr.name} - {addr.city}</option>
                                                    ))}
                                                </Form.Select>
                                                {userAddresses.length === 0 && <small className="text-danger">Add address in profile first.</small>}
                                            </Form.Group>
                                        </Col>
                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-medium small text-muted">ISSUE DESCRIPTION</Form.Label>
                                                <Form.Control as="textarea" rows={3} placeholder="Describe the issue..." value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} className="modern-form-control" />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Form>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="border-0 bg-light">
                        <Button variant="link" className="text-muted text-decoration-none" onClick={handleCloseBookingModal}>Cancel</Button>
                        <Button variant="primary" className="px-4 rounded-pill shadow-sm" onClick={handleSubmitBooking} disabled={bookingLoading || !selectedAddress || !bookingDate || !bookingTime}>
                            {bookingLoading ? <Spinner size="sm" /> : 'Confirm Booking'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
}

export default ServiceProviderList;