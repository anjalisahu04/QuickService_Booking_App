import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card, Container, InputGroup, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const Icons = {
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Lock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Phone: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Briefcase: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Shield: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Key: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
};

const api = axios.create({
  baseURL: 'http://localhost:8080/api/auth',
});

// --- CSS Styles ---
const styles = `
  .auth-bg {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 90vh;
    padding: 40px 0;
  }
  .auth-card {
    border: none;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    overflow: hidden;
    background: rgba(255, 255, 255, 0.95);
  }
  .auth-header {
    background: #fff;
    padding: 30px 30px 0;
    text-align: center;
  }
  .brand-title {
    font-weight: 800;
    color: #0d6efd;
    margin-bottom: 20px;
    letter-spacing: -0.5px;
  }
  .toggle-container {
    background: #f1f3f5;
    border-radius: 50px;
    padding: 5px;
    display: flex;
    position: relative;
    margin-bottom: 20px;
  }
  .toggle-btn {
    flex: 1;
    border: none;
    background: transparent;
    padding: 10px;
    border-radius: 40px;
    font-weight: 600;
    color: #6c757d;
    transition: all 0.3s ease;
    z-index: 2;
  }
  .toggle-btn.active {
    background: #fff;
    color: #0d6efd;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }
  .form-control-custom {
    border-left: none;
    padding-left: 10px;
    height: 48px;
    background-color: #f8f9fa;
    border-color: #dee2e6;
  }
  .form-control-custom:focus {
    background-color: #fff;
    box-shadow: none;
    border-color: #86b7fe;
  }
  .input-group-text-custom {
    background-color: #f8f9fa;
    border-right: none;
    border-color: #dee2e6;
    color: #6c757d;
  }
  .input-group:focus-within .input-group-text-custom {
    background-color: #fff;
    border-color: #86b7fe;
    color: #0d6efd;
  }
  .btn-submit {
    height: 48px;
    font-weight: 600;
    letter-spacing: 0.5px;
    border-radius: 10px;
    background: linear-gradient(to right, #0d6efd, #0099ff);
    border: none;
    transition: transform 0.2s;
  }
  .btn-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
  }
  .role-select {
    height: 48px;
    background-color: #f8f9fa;
    cursor: pointer;
  }
`;

export default function AuthForm({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <>
      <style>{styles}</style>
      <div className="auth-bg d-flex align-items-center justify-content-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={12} lg={6} xl={5}>
              <Card className="auth-card">
                <div className="auth-header">
                  <h2 className="brand-title">QuickServe</h2>
                  <div className="toggle-container">
                    <button 
                      className={`toggle-btn ${activeTab === 'login' ? 'active' : ''}`}
                      onClick={() => setActiveTab('login')}
                    >
                      Login
                    </button>
                    <button 
                      className={`toggle-btn ${activeTab === 'signup' ? 'active' : ''}`}
                      onClick={() => setActiveTab('signup')}
                    >
                      Create Account
                    </button>
                  </div>
                </div>
                
                <Card.Body className="p-4 pt-2">
                  {activeTab === 'login' ? (
                    <div className="animate__animated animate__fadeIn">
                      <p className="text-center text-muted mb-4">Welcome back! Please login to your account.</p>
                      <LoginForm onLoginSuccess={onLogin} />
                    </div>
                  ) : (
                    <div className="animate__animated animate__fadeIn">
                      <p className="text-center text-muted mb-4">Join our community today.</p>
                      <SignupForm onSignupSuccess={() => setActiveTab('login')} />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/login', {
        email: email.trim(),
        password: password,
      });

      console.log('Login successful:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(response.data);
      }
      
      navigate('/');

    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="border-0 shadow-sm mb-4">
          <div className="d-flex align-items-center small">
            <Icons.Shield /> <span className="ms-2">{error}</span>
          </div>
        </Alert>
      )}

      <Form.Group className="mb-3" controlId="loginEmail">
        <Form.Label className="small fw-bold text-muted ms-1">Email Address</Form.Label>
        <InputGroup>
          <InputGroup.Text className="input-group-text-custom">
            <Icons.Mail />
          </InputGroup.Text>
          <Form.Control
            type="email"
            className="form-control-custom"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-4" controlId="loginPassword">
        <Form.Label className="small fw-bold text-muted ms-1">Password</Form.Label>
        <InputGroup>
          <InputGroup.Text className="input-group-text-custom">
            <Icons.Lock />
          </InputGroup.Text>
          <Form.Control
            type="password"
            className="form-control-custom"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </InputGroup>
      </Form.Group>
      
      <div className="d-grid pt-2">
        <Button variant="primary" type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Authenticating...' : 'Login'}
        </Button>
      </div>
    </Form>
  );
}

function SignupForm({ onSignupSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('USER');
  const [serviceType, setServiceType] = useState('');
  const [secretCode, setSecretCode] = useState('');
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (role === 'ADMIN' && secretCode !== '249517') {
      setError('Invalid admin secret code. Please enter the correct 6-digit code.');
      setLoading(false);
      return;
    }

    const signupData = {
      name,
      email,
      password,
      phone,
      role,
      ...(role === 'PROVIDER' && { serviceType }),
      ...(role === 'ADMIN' && { serviceType: 'ADMIN' }), // Send a placeholder for admin
    };

    try {
      const response = await api.post('/register', signupData);
      let successMessage = response.data.message || 'Registration successful! Please log in.';
      
      if (role === 'PROVIDER') {
        successMessage += ' Your account is pending verification. You will be able to login once approved by admin.';
      }
      
      setSuccess(successMessage);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRole('USER');
      setServiceType('');
      setSecretCode('');

      setTimeout(() => {
        onSignupSuccess();
      }, 2000);

    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger" className="small">{error}</Alert>}
      {success && <Alert variant="success" className="small">{success}</Alert>}

      <Form.Group className="mb-3" controlId="role">
        <Form.Label className="small fw-bold text-muted ms-1">I want to...</Form.Label>
        <Form.Select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="role-select"
        >
          <option value="USER">👤 Book a Service (User)</option>
          <option value="PROVIDER">🛠️ Offer a Service (Provider)</option>
          <option value="ADMIN">🛡️ Admin Access</option>
        </Form.Select>
      </Form.Group>

      <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="signupName">
                <InputGroup>
                <InputGroup.Text className="input-group-text-custom"><Icons.User /></InputGroup.Text>
                <Form.Control
                    type="text"
                    className="form-control-custom"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                </InputGroup>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="signupPhone">
                <InputGroup>
                <InputGroup.Text className="input-group-text-custom"><Icons.Phone /></InputGroup.Text>
                <Form.Control
                    type="tel"
                    className="form-control-custom"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
                </InputGroup>
            </Form.Group>
          </Col>
      </Row>

      <Form.Group className="mb-3" controlId="signupEmail">
        <InputGroup>
          <InputGroup.Text className="input-group-text-custom"><Icons.Mail /></InputGroup.Text>
          <Form.Control
            type="email"
            className="form-control-custom"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3" controlId="signupPassword">
        <InputGroup>
          <InputGroup.Text className="input-group-text-custom"><Icons.Lock /></InputGroup.Text>
          <Form.Control
            type="password"
            className="form-control-custom"
            placeholder="Create Password (6+ chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </InputGroup>
      </Form.Group>

      {role === 'PROVIDER' && (
        <Form.Group className="mb-3" controlId="serviceType">
            <Form.Label className="small fw-bold text-muted ms-1">Service Specialization</Form.Label>
            <InputGroup>
                <InputGroup.Text className="input-group-text-custom"><Icons.Briefcase /></InputGroup.Text>
                <Form.Control
                    type="text"
                    className="form-control-custom"
                    placeholder="e.g. Plumber, Electrician"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    required
                />
            </InputGroup>
        </Form.Group>
      )}

      {role === 'ADMIN' && (
        <div className="p-3 bg-light rounded mb-3 border border-warning">
            <Form.Group controlId="secretCode">
            <Form.Label className="small fw-bold text-danger ms-1">Admin Verification</Form.Label>
            <InputGroup>
                <InputGroup.Text className="input-group-text-custom text-danger"><Icons.Key /></InputGroup.Text>
                <Form.Control
                    type="password"
                    className="form-control-custom border-danger"
                    placeholder="Enter 6-digit Code"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    maxLength={6}
                    required
                />
            </InputGroup>
            <Form.Text className="text-muted small fst-italic">
                Restricted access. Authorized personnel only.
            </Form.Text>
            </Form.Group>
        </div>
      )}

      {role === 'PROVIDER' && (
        <Alert variant="info" className="mb-3 small">
          <div className="d-flex">
            <Icons.Shield />
            <div className="ms-2">
                <strong>Approval Required:</strong> Your account will need admin verification (24-48h) before you can log in.
            </div>
          </div>
        </Alert>
      )}

      <div className="d-grid mt-4">
        <Button variant="primary" type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </div>
    </Form>
  );
}