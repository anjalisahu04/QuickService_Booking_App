import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Spinner, Card, Row, Col, Badge } from 'react-bootstrap';
import { CheckCircle, XCircle, CreditCard, Shield, Clock, Lock } from 'react-bootstrap-icons';
import { paymentService } from './PaymentService';
import './PaymentModal.css'; 

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

function PaymentModal({ show, onHide, booking, amount, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(''); 

  useEffect(() => {
    if (show && booking) {
      checkExistingPayment();
    }
  
  }, [show, booking]);

  const checkExistingPayment = async () => {
    try {
      const result = await paymentService.getPaymentStatus(booking.id);
      if (result.success && result.data.status === 'COMPLETED') {
        setPaymentStatus('success');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };

  const initiatePayment = async () => {
    setLoading(true);
    setError('');

    try {

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      const paymentAmount = amount || booking?.totalAmount || 0;
      
      if (!paymentAmount || paymentAmount <= 0) {
        setError('Invalid payment amount.');
        setLoading(false);
        return;
      }


      const orderResult = await paymentService.createOrder(booking.id, paymentAmount);
      if (!orderResult.success) {
        setError(orderResult.error);
        setLoading(false);
        return;
      }

      const orderData = orderResult.data;


      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'QuickServe',
        description: `Order #${orderData.orderId.slice(-6)}`,
        image: 'https://via.placeholder.com/150/0d6efd/ffffff?text=QS', 
        order_id: orderData.orderId,
        handler: async function (response) {
          setProcessing(true);
          setPaymentStatus('processing');
          
          try {
            const verifyResult = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResult.success) {
              setPaymentStatus('success');
              if (onPaymentSuccess) onPaymentSuccess(verifyResult.data);
            } else {
              setPaymentStatus('failed');
              setError(verifyResult.error || 'Payment verification failed.');
            }
          } catch (err) {
            setPaymentStatus('failed');
            setError('Network error during verification.');
          }
          setProcessing(false);
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
          contact: localStorage.getItem('userPhone') || ''
        },
        theme: {
          color: '#0d6efd'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        setPaymentStatus('failed');
        setError(response.error.description);
        setLoading(false);
      });

      razorpay.open();
      
    } catch (err) {
      setError('Failed to initiate payment.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPaymentStatus('');
    setError('');
    setLoading(false);
    setProcessing(false);
    onHide();
  };

  const displayAmount = amount || booking?.totalAmount || 0;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" className="payment-modal-custom">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center fw-bold h5">
          <Shield className="text-success me-2" size={24} />
          Secure Checkout
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 pt-2">
        {booking && (
          <div className="payment-container">
            {/* Status Banner */}
            {paymentStatus === 'success' ? (
                <div className="text-center py-5">
                    <div className="success-animation mb-3">
                        <CheckCircle size={64} className="text-success" />
                    </div>
                    <h4 className="fw-bold text-success mb-2">Payment Successful!</h4>
                    <p className="text-muted">Transaction ID: {booking.id.slice(0,8)}</p>
                </div>
            ) : paymentStatus === 'failed' ? (
                <Alert variant="danger" className="text-center border-0 shadow-sm mb-4">
                    <XCircle size={32} className="mb-2" />
                    <h5 className="alert-heading">Payment Failed</h5>
                    <p className="mb-0">{error || 'Please try again using a different method.'}</p>
                </Alert>
            ) : (
                <Row className="g-4">
                    {/* Left: Summary */}
                    <Col md={7}>
                        <div className="bg-light p-4 rounded-4 h-100">
                            <h6 className="text-uppercase text-muted fw-bold small mb-3">Order Summary</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-dark fw-medium">{booking.serviceType} Service</span>
                                <span className="text-dark fw-bold">₹{displayAmount}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">Platform Fee</span>
                                <span className="text-muted small">₹0</span>
                            </div>
                            <hr className="my-3 opacity-10"/>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold fs-5">Total to Pay</span>
                                <span className="fw-bold fs-4 text-primary">₹{displayAmount}</span>
                            </div>

                            <div className="mt-4 pt-3 border-top">
                                <h6 className="text-uppercase text-muted fw-bold small mb-2">Provider</h6>
                                <div className="d-flex align-items-center">
                                    <div className="provider-icon me-2">{booking.providerName?.charAt(0)}</div>
                                    <div>
                                        <div className="fw-bold">{booking.providerName}</div>
                                        <div className="small text-muted">{new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Right: Payment Action */}
                    <Col md={5}>
                        <div className="payment-actions h-100 d-flex flex-column">
                            {error && <Alert variant="danger" className="py-2 small mb-3">{error}</Alert>}
                            
                            <Card className="border-primary shadow-sm mb-3">
                                <Card.Body>
                                    <div className="d-flex align-items-center mb-2">
                                        <CreditCard className="text-primary me-2"/>
                                        <span className="fw-bold">Card / UPI / Netbanking</span>
                                    </div>
                                    <p className="small text-muted mb-0">
                                        You will be redirected to Razorpay's secure gateway to complete this transaction.
                                    </p>
                                </Card.Body>
                            </Card>

                            <Button
                                variant="primary"
                                size="lg"
                                className="w-100 py-3 mt-auto shadow-sm btn-pay fw-bold"
                                onClick={initiatePayment}
                                disabled={loading || processing}
                            >
                                {(loading || processing) ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Processing...
                                    </>
                                ) : (
                                    <>Pay ₹{displayAmount}</>
                                )}
                            </Button>

                            <div className="text-center mt-3 d-flex justify-content-center align-items-center text-muted small">
                                <Lock size={12} className="me-1" />
                                <span>256-bit SSL Encrypted</span>
                            </div>
                        </div>
                    </Col>
                </Row>
            )}

            {/* Test Mode Footer (Only visible if needed) */}
            {/* {paymentStatus !== 'success' && (
                <div className="mt-4 p-3 bg-blue-soft rounded-3 border border-info border-opacity-25">
                    <div className="d-flex align-items-center mb-2 text-info">
                        <Shield className="me-2" />
                        <strong className="small">TEST MODE ENABLED</strong>
                    </div>
                    <p className="mb-0 small text-muted">
                        Use <code>4111 1111 1111 1111</code> (Visa) with any future expiry date and random CVV to test a successful payment.
                    </p>
                </div>
            )} */}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default PaymentModal;
