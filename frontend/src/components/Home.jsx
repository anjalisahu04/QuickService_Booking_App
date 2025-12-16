import React, { useState, useEffect } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [userLocation, setUserLocation] = useState('Fetching location...');
  const [serviceProvidersLocation, setServiceProvidersLocation] = useState('');
  const [locationError, setLocationError] = useState('');
  const navigate = useNavigate();

  const services = [
    { name: 'Plumbing', icon: '🔧', color: 'blue' },
    { name: 'Electrical', icon: '💡', color: 'yellow' },
    { name: 'Cleaning', icon: '🧹', color: 'green' },
    { name: 'Painting', icon: '🎨', color: 'pink' },
    { name: 'AC / Appliance', icon: '❄️', color: 'cyan' },
    { name: 'Carpentry', icon: '🪚', color: 'orange' },
  ];

  const socialMedia = [
    { name: 'Facebook', icon: '📘', url: 'https://facebook.com/quickserve', color: '#1877F2' },
    { name: 'Instagram', icon: '📸', url: 'https://instagram.com/quickserve', color: '#E4405F' },
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com/quickserve', color: '#1DA1F2' },
    { name: 'LinkedIn', icon: '💼', url: 'https://linkedin.com/company/quickserve', color: '#0A66C2' },
    { name: 'YouTube', icon: '📺', url: 'https://youtube.com/quickserve', color: '#FF0000' },
  ];

  // Fetch user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Reverse geocoding to get location name
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setUserLocation(data.address?.city || data.address?.town || data.address?.village || 'Vidisha, MP');
            
            // Simulate fetching nearby service providers
            fetchServiceProviders(latitude, longitude);
          } catch (error) {
            console.error('Error fetching location details:', error);
            setUserLocation('Vidisha, MP');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to fetch location. Using default: Vidisha, MP');
          setUserLocation('Vidisha, MP');
        }
      );
    } else {
      setLocationError('Geolocation not supported');
      setUserLocation('Vidisha, MP');
    }
  }, []);

  const fetchServiceProviders = async (lat, lng) => {
    // This would be your actual API call to get nearby service providers
    // For now, we'll simulate with a mock response
    const mockProviders = [
      '15+ Plumbers within 5km',
      '12+ Electricians available',
      '20+ Cleaners nearby',
      '8+ Painters in your area'
    ];
    setServiceProvidersLocation(mockProviders.join(' • '));
  };

  const handleBookNow = () => {
    navigate('/services');
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          alert(`Your location: ${position.coords.latitude}, ${position.coords.longitude}\nService providers will be shown based on your location.`);
        },
        (error) => {
          alert('Please enable location services for better experience.');
        }
      );
    }
  };

  const handleSocialMediaClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="home-wrapper">
      
      {/* --- Modern Hero Section --- */}
      <section className="modern-hero">
        <div className="hero-blob blob-1"></div>
        <div className="hero-blob blob-2"></div>
        
        <div className="hero-content">
          <div className="hero-badge">🚀 #1 Service App in Vidisha</div>
          <h1 className="hero-headline">
            Fix your home, <br />
            <span className="text-gradient">Upgrade your life.</span>
          </h1>
          <p className="hero-sub">
            Expert professionals at your doorstep within 60 minutes. 
            Trusted by 5000+ neighbors.
          </p>
        </div>
      </section>

      {/* --- Floating Search Container --- */}
      <div className="floating-search-wrapper">
        <div className="glass-search-bar">
          <div className="search-input-group">
            <label>Your Location</label>
            <div className="input-with-icon location-input" onClick={handleLocationClick}>
              <span>📍</span>
              <input 
                type="text" 
                value={userLocation} 
                readOnly 
                className="location-display"
              />
              <span className="refresh-icon" title="Refresh location">🔄</span>
            </div>
            {locationError && (
              <div className="location-error">{locationError}</div>
            )}
          </div>
          
          <div className="search-divider"></div>

          <div className="search-input-group">
            <label>Service Needed</label>
            <div className="input-with-icon">
              <span>🔍</span>
              <input type="text" placeholder="Search 'Kitchen Cleaning'..." />
            </div>
          </div>
          
          <button className="btn-glow" onClick={handleBookNow}>Book Now</button>
        </div>
      </div>

      {/* --- Categories Section --- */}
      <section className="section-categories">
        <div className="section-header">
          <h2>Trending Services</h2>
          <a href="#" className="link-arrow" onClick={handleBookNow}>View all</a>
        </div>
        
        <div className="cards-grid"onClick = {handleBookNow}>
          {services.map((s, index) => (
            <div key={index} className={`service-card-modern ${s.color}`}>
              <div className="icon-circle" >{s.icon}</div>
              <h3>{s.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* --- Bento Grid Features --- */}
      <section className="section-features">
        <div className="bento-grid">
          <div className="bento-box large-box">
            <h3>Safe & Secure 🛡️</h3>
            <p>Every professional is background verified and follows strict safety protocols.</p>
          </div>
          <div className="bento-box small-box dark">
            <h3>4.8/5</h3>
            <p>Average User Rating</p>
          </div>
          <div className="bento-box small-box image-bg">
            <div className="glass-overlay">
              <h3>24/7 Support</h3>
            </div>
          </div>
        </div>
      </section>

      {/* --- Enhanced Footer --- */}
      <footer className="modern-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">QuickServe 🚀</h3>
            <p className="footer-tagline">Your trusted home service partner</p>
            <div className="app-badges">
            </div>
          </div>

          <div className="footer-section">
            <h4>Connect With Us</h4>
            <div className="social-media-grid">
              {socialMedia.map((platform, index) => (
                <button
                  key={index}
                  className="social-icon-btn"
                  style={{ '--bg-color': platform.color }}
                  onClick={() => handleSocialMediaClick(platform.url)}
                  title={platform.name}
                >
                  <span className="social-icon">{platform.icon}</span>
                  <span className="social-name">{platform.name}</span>
                </button>
              ))}
            </div>
            <div className="contact-info">
              <p>📧 support@quickserve.com</p>
              <p>📞 1800-123-4567</p>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/services">Services</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <p>© 2025 QuickServe. All rights reserved.</p>
            <p className="footer-note">Serving Vidisha with ❤️ since 2020</p>
          </div>
          <div className="payment-methods">
            <span>💳</span>
            <span>💰</span>
            <span>🏦</span>
            <span>💎</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;