import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Alert, 
  Spinner, 
  Table, 
  Button, 
  Modal, 
  Form,
  Badge,
  Row,
  Col
} from 'react-bootstrap';
import Api from './Api'; 

// --- Zero-Dependency Icons ---
const Icons = {
  CheckCircle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  XCircle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Person: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Envelope: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Shield: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted opacity-50"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
};

// --- Custom CSS ---
const customStyles = `
  .verification-card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    background: white;
    overflow: hidden;
  }
  .table-custom th {
    background-color: #f8f9fa;
    border-bottom: 2px solid #e9ecef;
    color: #6c757d;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
    padding: 16px;
  }
  .table-custom td {
    padding: 16px;
    vertical-align: middle;
    border-bottom: 1px solid #f1f3f5;
    color: #495057;
  }
  .table-custom tr:last-child td {
    border-bottom: none;
  }
  .table-custom tr:hover td {
    background-color: #f8f9fa;
  }
  .avatar-initial {
    width: 36px;
    height: 36px;
    background: #e9ecef;
    color: #495057;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 12px;
  }
  .action-btn {
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .action-btn:hover {
    transform: translateY(-1px);
  }
`;

export default function Verifications() {
  const [pendingProviders, setPendingProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the rejection modal
  const [showModal, setShowModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Function to fetch data
  const fetchPendingProviders = async () => {
    setLoading(true);
    try {
      const response = await Api.get('/admin/pending-providers');
      setPendingProviders(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending providers:", err);
      setError(err.response?.data?.message || "Failed to fetch pending providers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProviders();
  }, []);

  // --- Event Handlers ---

  const handleApprove = async (providerId) => {
    try {
      await Api.post(`/admin/verify-provider/${providerId}`);
      // Show cleaner native alert or toast (using generic alert for now as per instructions)
      alert("Provider approved successfully!");
      setPendingProviders(prev => prev.filter(p => p.id !== providerId));
    } catch (err) {
      console.error("Error approving provider:", err);
      alert("Failed to approve provider: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  const openRejectModal = (providerId) => {
    setSelectedProviderId(providerId);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedProviderId(null);
    setRejectionReason("");
  };

  const handleSubmitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      await Api.post(`/admin/reject-provider/${selectedProviderId}`, { 
        reason: rejectionReason 
      });
      alert("Provider rejected successfully!");
      setPendingProviders(prev => prev.filter(p => p.id !== selectedProviderId));
      handleModalClose();
    } catch (err) {
      console.error("Error rejecting provider:", err);
      alert("Failed to reject provider: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  // --- Rendering ---

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading pending requests...</p>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <style>{customStyles}</style>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Provider Verifications</h4>
          <p className="text-muted mb-0 small">Review and approve new service provider accounts.</p>
        </div>
        <Badge bg="primary" pill className="px-3 py-2">
          {pendingProviders.length} Pending
        </Badge>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm mb-4">{error}</Alert>}
      
      <Card className="verification-card">
        {pendingProviders.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3"><Icons.Shield /></div>
            <h6 className="text-dark">All caught up!</h6>
            <p className="text-muted small mb-0">No pending provider verifications at the moment.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table className="table-custom mb-0" hover>
              <thead>
                <tr>
                  <th>Provider Details</th>
                  <th>Contact Info</th>
                  <th>Service Type</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingProviders.map(provider => (
                  <tr key={provider.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-initial">
                          {provider.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{provider.name}</div>
                          <div className="small text-muted">ID: #{provider.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column small">
                        <div className="mb-1 d-flex align-items-center text-muted">
                          <span className="me-2"><Icons.Envelope /></span> {provider.email}
                        </div>
                        <div className="d-flex align-items-center text-muted">
                          <span className="me-2"><Icons.Phone /></span> {provider.phone}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg="light" text="dark" className="border">
                        {provider.serviceType}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="action-btn me-2"
                        onClick={() => handleApprove(provider.id)}
                      >
                        <Icons.CheckCircle /> Approve
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="action-btn"
                        onClick={() => openRejectModal(provider.id)}
                      >
                        <Icons.XCircle /> Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* --- Rejection Modal --- */}
      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold h5">Reject Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="rejectionReason">
              <Form.Label className="small text-muted fw-bold">REASON FOR REJECTION</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Incomplete documentation, invalid certification..."
                className="bg-light border-0"
                autoFocus
              />
              <Form.Text className="text-muted">
                This reason will be sent to the provider via email.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmitRejection}>
            Confirm Rejection
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}