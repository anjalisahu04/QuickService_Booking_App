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
    ArrowRightCircle,
    CheckCircleFill
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
    
    // Categories
    const categories = [
        { 
            name: 'Plumber', 
            icon: <WrenchAdjustable size={28} />, 
            count: 'Verified Pros', 
            desc: 'Leakages, pipes, and installation',
            color: 'gradient-primary', 
        },
        { 
            name: 'Electrician', 
            icon: <LightningCharge size={28} />, 
            count: 'Certified Experts', 
            desc: 'Wiring, switch, and appliance',
            color: 'gradient-warning', 
        },
        { 
            name: 'Cleaner', 
            icon: <Stars size={28} />, 
            count: 'Top Rated', 
            desc: 'Home, kitchen, and bathroom',
            color: 'gradient-success', 
        },
        { 
            name: 'Painter', 
            icon: <Brush size={28} />, 
            count: 'Skilled Artists', 
            desc: 'Wall putty, texture, and paint',
            color: 'gradient-danger', 
        },
        { 
            name: 'Carpenter', 
            icon: <Hammer size={28} />, 
            count: 'Wood Experts', 
            desc: 'Furniture repair and assembly',
            color: 'gradient-info', 
        },
        { 
            name: 'Appliance Repair', 
            icon: <GearWideConnected size={28} />, 
            count: 'Fast Service', 
            desc: 'AC, fridge, and washing machine',
            color: 'gradient-dark', 
        },
    ];

    // --- LOGIC ---
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
        <div className="page-wrapper bg-light">
            
            {/* HERO SECTION */}
            <div className="hero-section">
                <div className="hero-bg-pattern"></div>
                <Container className="position-relative pt-4 pb-5">
                    
                    {/* Top Location Bar */}
                    <div className="d-flex justify-content-center mb-5">
                        <div className="location-pill glass-effect d-flex align-items-center px-4 py-2 rounded-pill shadow-sm animate-fade-down">
                            {loadingLocation && !isAdmin ? (
                                <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                            ) : (
                                <>
                                    <div className="bg-primary bg-opacity-10 p-1 rounded-circle me-2 text-primary">
                                        <GeoAlt size={16} />
                                    </div>
                                    <span className="small fw-bold text-dark me-3">
                                        {isAdmin ? "Global Admin View" : (userCities.length > 0 ? userCities[0] : "Select Location")}
                                    </span>
                                </>
                            )}
                            {(!isAdmin && (userCities.length === 0 || locationError)) && (
                                <Button variant="link" className="p-0 text-decoration-none fw-bold small text-primary" onClick={handleAddAddress}>
                                    + Add Address
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Hero Content */}
                    <Row className="justify-content-center text-center" >
                        <Col lg={8}>
                            <h1 className="display-4 fw-bolder mb-3 text-dark animate-fade-up">
                                {/* --- UPDATED: Light Blue Background Highlight --- */}
                                {isAdmin ? 'Admin Dashboard' : <span className="highlight-blue">Expert Services,</span>} 
                                <br />
                                {isAdmin ? '' : 'Right at Your Doorstep'}
                            </h1>
                            <p className="lead text-muted mb-5 px-lg-5 animate-fade-up delay-1">
                                {isAdmin ? 'Manage your service providers efficiently and oversee global operations.' : 'Book trusted, verified professionals for cleaning, repairs, painting and more.'}
                            </p>

                            {/* Search Bar */}
                            <div className="search-container mx-auto mb-4 animate-scale-in delay-2">
                                <InputGroup className="input-group-lg shadow-lg rounded-pill overflow-hidden bg-white border p-1">
                                    <InputGroup.Text className="bg-white border-0 ps-4 text-muted">
                                        <Search />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search for 'Electrician'..."
                                        className="border-0 shadow-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Button variant="primary" className="rounded-pill px-4 fw-bold m-1">
                                        Search
                                    </Button>
                                </InputGroup>
                            </div>

                            {/* Quick Tags */}
                            <div className="d-flex justify-content-center gap-2 flex-wrap animate-fade-up delay-3">
                                <span className="small text-muted pt-1">Trending:</span>
                                {['Plumber', 'Cleaner', 'Repair'].map(tag => (
                                    <Badge 
                                        key={tag} 
                                        bg="white" 
                                        text="dark" 
                                        className="cursor-pointer border fw-normal px-3 py-2 rounded-pill hover-shadow transition-all"
                                        onClick={() => handleQuickTag(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* MAIN CONTENT */}
            <section className="py-5">
                <Container>
                    <div className="d-flex justify-content-between align-items-end mb-4 px-2">
                        <div>
                            <h4 className="fw-bold text-dark mb-1">
                                {searchTerm ? `Results for "${searchTerm}"` : 'Explore Categories'}
                            </h4>
                            <p className="text-muted small mb-0">
                                {filteredCategories.length} professional services available
                            </p>
                        </div>
                    </div>

                    <Row className="g-4">
                        {filteredCategories.length === 0 ? (
                            <Col className="text-center py-5">
                                <div className="display-1 text-muted opacity-25 mb-3">🔍</div>
                                <h5>No matching services found</h5>
                                <p className="text-muted">Try checking your spelling or use general terms.</p>
                                <Button variant="outline-primary" onClick={() => setSearchTerm('')} className="rounded-pill px-4">Clear Search</Button>
                            </Col>
                        ) : (
                            filteredCategories.map((category, index) => (
                                <Col lg={4} md={6} key={index}>
                                    <Card 
                                        className="service-card border-0 h-100 shadow-sm hover-lift" 
                                        onClick={() => handleCategoryClick(category)}
                                    >
                                        <Card.Body className="p-4 d-flex flex-column">
                                            {/* Icon Header */}
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className={`icon-box rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm ${category.color}`} style={{width: '60px', height: '60px'}}>
                                                    {category.icon}
                                                </div>
                                                <Badge bg="light" text="dark" className="border d-flex align-items-center gap-1">
                                                    <CheckCircleFill className="text-success" size={10}/> {category.count}
                                                </Badge>
                                            </div>

                                            <div className="mt-2">
                                                <h5 className="fw-bold text-dark mb-1">{category.name}</h5>
                                                <p className="text-muted small mb-4">{category.desc}</p>
                                            </div>

                                            <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                                                <span className="text-muted small fw-bold">View Providers</span>
                                                <div className="action-btn text-primary">
                                                    <ArrowRightCircle size={24} />
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>

                    {/* Admin Alert */}
                    {isAdmin && (
                        <Alert variant="primary" className="mt-5 border-0 shadow rounded-4 d-flex align-items-center p-4 bg-white">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3 text-primary">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h6 className="fw-bold mb-1 text-dark">Admin Access Active</h6>
                                <p className="mb-0 small text-muted">You have global access to all service categories.</p>
                            </div>
                        </Alert>
                    )}
                </Container>
            </section>
        </div>
    );
}

export default Services;