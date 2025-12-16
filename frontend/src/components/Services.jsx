import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Spinner, Form, InputGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
    GeoAlt, 
    Search, 
    Shield, 
    WrenchAdjustable, 
    LightningCharge, 
    Stars, 
    Brush, 
    Hammer, 
    GearWideConnected,
    ArrowRightCircle
} from 'react-bootstrap-icons';
import './Services.css';
import { addressService } from './AddressService';

function Services() {
    const navigate = useNavigate();
    const [userCities, setUserCities] = useState([]);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [locationError, setLocationError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Categories with attractive icons and descriptions (Ratings removed)
    const categories = [
        { 
            name: 'Plumber', 
            icon: <WrenchAdjustable size={32} />, 
            count: 'Plumbers', 
            desc: 'Leakages, pipes, and installation',
            color: 'icon-box-primary', 
        },
        { 
            name: 'Electrician', 
            icon: <LightningCharge size={32} />, 
            count: 'Electricians', 
            desc: 'Wiring, switch, and appliance',
            color: 'icon-box-warning', 
        },
        { 
            name: 'Cleaner', 
            icon: <Stars size={32} />, 
            count: 'Cleaners', 
            desc: 'Home, kitchen, and bathroom',
            color: 'icon-box-success', 
        },
        { 
            name: 'Painter', 
            icon: <Brush size={32} />, 
            count: 'Painters', 
            desc: 'Wall putty, texture, and paint',
            color: 'icon-box-danger', 
        },
        { 
            name: 'Carpenter', 
            icon: <Hammer size={32} />, 
            count: 'Carpenters', 
            desc: 'Furniture repair and assembly',
            color: 'icon-box-secondary', 
        },
        { 
            name: 'Appliance Repair', 
            icon: <GearWideConnected size={32} />, 
            count: 'Experts', 
            desc: 'AC, fridge, and washing machine',
            color: 'icon-box-info', 
        },
    ];

    // --- LOGIC (Unchanged) ---
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentUser(user);
            setIsAdmin(user.role === 'ADMIN');
        }
    }, []);

    useEffect(() => {
        const getUserCities = async () => {
            try {
                setLoadingLocation(true);
                if (isAdmin) {
                    setLoadingLocation(false);
                    return;
                }
                const addresses = await addressService.getAddresses();
                if (addresses && addresses.length > 0) {
                    const cities = [...new Set(addresses.map(addr => addr.city).filter(city => city))];
                    setUserCities(cities);
                } else {
                    setLocationError('Add address to find providers');
                }
            } catch (error) {
                console.error('Error:', error);
                setLocationError('Error loading location');
            } finally {
                setLoadingLocation(false);
            }
        };
        getUserCities();
    }, [isAdmin]);

    const handleCategoryClick = (category) => {
        if (!category?.name) return;
        navigate('/serviceProvider-List', { 
            state: { 
                category: category.name,
                userCities: isAdmin ? [] : userCities 
            } 
        });
    };

    const handleAddAddress = () => {
        navigate('/profile', { state: { openAddressTab: true } });
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleQuickTag = (term) => setSearchTerm(term);

    return (
        <div className="page-wrapper">
            
            {/* HERO SECTION */}
            <div className="hero-section">
                <div className="hero-overlay"></div>
                <Container className="position-relative z-index-1 pt-4 pb-5">
                    
                    {/* Top Location Bar */}
                    <div className="d-flex justify-content-between align-items-center mb-5 text-white">
                        <div className="d-flex align-items-center location-glass px-3 py-2 rounded-pill">
                            {loadingLocation && !isAdmin ? (
                                <Spinner animation="border" variant="light" size="sm" className="me-2" />
                            ) : (
                                <>
                                    <GeoAlt className="me-2" />
                                    <span className="small fw-bold">
                                        {isAdmin ? "Global Admin View" : (userCities.length > 0 ? userCities[0] : "Select Location")}
                                    </span>
                                </>
                            )}
                        </div>
                        {(!isAdmin && (userCities.length === 0 || locationError)) && (
                            <Button variant="light" size="sm" className="rounded-pill fw-bold" onClick={handleAddAddress}>
                                + Add Address
                            </Button>
                        )}
                    </div>

                    {/* Hero Content with "Expert Services, On Demand" */}
                    <Row className="justify-content-center text-center text-white">
                        <Col lg={8}>
                            <h1 className="display-4 fw-bold mb-3 animate-fade-down">
                                {isAdmin ? 'Admin Dashboard' : 'Expert Services, On Demand'}
                            </h1>
                            <p className="lead mb-4 opacity-75 animate-fade-up">
                                {isAdmin ? 'Manage your service providers efficiently.' : 'Book trusted professionals for all your home needs.'}
                            </p>

                            {/* Search Bar */}
                            <div className="search-wrapper mx-auto mb-4 animate-scale-in">
                                <InputGroup className="input-group-lg shadow-lg">
                                    <InputGroup.Text className="bg-white border-0 ps-4 text-primary">
                                        <Search />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search for 'Kitchen Cleaning'..."
                                        className="border-0 py-3"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Button variant="primary" className="px-4 fw-bold">
                                        Search
                                    </Button>
                                </InputGroup>
                            </div>

                            {/* Quick Tags */}
                            <div className="d-flex justify-content-center gap-2 flex-wrap animate-fade-up delay-1">
                                <span className="small opacity-75 me-2 pt-1">Popular:</span>
                                {['Plumber', 'Cleaner', 'Repair'].map(tag => (
                                    <Badge 
                                        key={tag} 
                                        bg="light" 
                                        text="dark" 
                                        className="cursor-pointer bg-opacity-25 text-white border border-white border-opacity-25 fw-normal px-3 py-2 rounded-pill hover-glass"
                                        onClick={() => handleQuickTag(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Container>
                
                {/* Curved Divider */}
                {/* <div className="custom-shape-divider-bottom-1680000000">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
                    </svg>
                </div> */}
            </div>

            {/* MAIN CONTENT */}
            <section className="py-5 bg-light">
                <Container>
                    <div className="d-flex justify-content-between align-items-end mb-4">
                        <div>
                            <h4 className="fw-bold text-dark mb-1">
                                {searchTerm ? 'Search Results' : 'All Categories'}
                            </h4>
                            <small className="text-muted">
                                {filteredCategories.length} services available
                            </small>
                        </div>
                    </div>

                    <Row className="g-4">
                        {filteredCategories.length === 0 ? (
                            <Col className="text-center py-5">
                                <div className="display-1 text-muted opacity-25 mb-3">😕</div>
                                <h5>No services found</h5>
                                <p className="text-muted">Try changing your search term.</p>
                                <Button variant="outline-primary" onClick={() => setSearchTerm('')}>Clear Search</Button>
                            </Col>
                        ) : (
                            filteredCategories.map((category, index) => (
                                <Col lg={4} md={6} key={index}>
                                    <Card 
                                        className="service-card border-0 h-100 overflow-hidden" 
                                        onClick={() => handleCategoryClick(category)}
                                    >
                                        <Card.Body className="p-4">
                                            {/* Header with just Icon */}
                                            <div className="mb-4">
                                                <div className={`icon-box ${category.color}`}>
                                                    {category.icon}
                                                </div>
                                            </div>

                                            <h5 className="fw-bold text-dark mb-1">{category.name}</h5>
                                            <p className="text-muted small mb-3">{category.desc}</p>
                                            
                                            <hr className="opacity-10 my-3" />

                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-primary fw-bold bg-light px-2 py-1 rounded">
                                                    {category.count} Pros
                                                </small>
                                                <div className="action-text d-flex align-items-center text-primary fw-bold small">
                                                    {isAdmin ? 'Manage' : 'Book Now'} 
                                                    <ArrowRightCircle className="ms-2" />
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>

                    {/* Admin Alert Footer */}
                    {isAdmin && (
                        <Alert variant="primary" className="mt-5 border-0 shadow-sm d-flex align-items-center">
                            <Shield className="display-6 me-3" />
                            <div>
                                <h6 className="fw-bold mb-1">Admin Mode Active</h6>
                                <p className="mb-0 small">You are viewing all categories globally. Click any card to manage providers.</p>
                            </div>
                        </Alert>
                    )}
                </Container>
            </section>
        </div>
    );
}

export default Services;