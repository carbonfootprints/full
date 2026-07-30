import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';

// react-bootstrap
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';

// ===========================|| ORGUSER - LOGIN PAGE ||=========================== //

const OrguserLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axiosServices.post(`${API_URL}/api/orguser/login`, formData);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(response.data.orguser));
        localStorage.setItem('userType', 'orguser');

        Swal.fire({
          icon: 'success',
          title: 'Welcome back!',
          text: `Hello, ${response.data.orguser.contactPerson || response.data.orguser.email}!`,
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          navigate('/orguser/dashboard', { replace: true });
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      const isPending = message.toLowerCase().includes('not registered') || message.toLowerCase().includes('pending');

      Swal.fire({
        icon: isPending ? 'info' : 'error',
        title: isPending ? 'Account Not Activated' : 'Login Failed',
        text: isPending
          ? 'Your account is not yet activated. Please check your email for the registration link or contact your administrator.'
          : message,
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-main">
      <div className="auth-wrapper v4">
        <div className="auth-form">
          <Card className="my-5 border-0 shadow-lg">
            <Row className="g-0">
              {/* Left brand panel */}
              <Col
                md={5}
                className="d-none d-md-flex flex-column align-items-center justify-content-center p-5 text-white"
                style={{
                  background: 'linear-gradient(135deg, #145a32 0%, #1e8449 60%, #27ae60 100%)',
                  borderRadius: '0.375rem 0 0 0.375rem'
                }}
              >
                <div className="text-center">
                  <div
                    className="mb-4 d-flex align-items-center justify-content-center mx-auto"
                    style={{
                      width: 80,
                      height: 80,
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      fontSize: 36
                    }}
                  >
                    <i className="ph ph-leaf" />
                  </div>
                  <h3 className="fw-bold mb-3">Organization Portal</h3>
                  <p className="mb-4" style={{ opacity: 0.85, lineHeight: 1.6 }}>
                    Track your organization's carbon emissions, manage sites, and download sustainability reports.
                  </p>
                  <div className="d-flex flex-column gap-3 text-start">
                    {[
                      { icon: 'ph-chart-bar', text: 'View carbon footprint data' },
                      { icon: 'ph-buildings', text: 'Manage your sites' },
                      { icon: 'ph-file-text', text: 'Download reports' },
                      { icon: 'ph-headset', text: 'Get support' }
                    ].map((item, i) => (
                      <div key={i} className="d-flex align-items-center gap-2">
                        <i className={`ph ${item.icon}`} style={{ fontSize: 18, opacity: 0.9 }} />
                        <span style={{ opacity: 0.9, fontSize: '0.9rem' }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>

              {/* Right form panel */}
              <Col md={7} sm={12}>
                <Card.Body className="p-4 p-md-5">
                  <div className="text-center mb-4">
                    <div
                      className="d-inline-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: 56,
                        height: 56,
                        background: 'rgba(39, 174, 96, 0.1)',
                        borderRadius: '50%',
                        color: '#27ae60',
                        fontSize: 24
                      }}
                    >
                      <i className="ph ph-user-circle" />
                    </div>
                    <h4 className="fw-bold mb-1">Organization Login</h4>
                    <p className="text-muted small">Sign in to your organization account</p>
                  </div>

                  <Form onSubmit={handleSubmit} noValidate>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small">
                        Email Address <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0">
                          <i className="ph ph-envelope text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          value={formData.email}
                          onChange={handleChange('email')}
                          isInvalid={!!errors.email}
                          placeholder="you@organization.com"
                          autoComplete="email"
                          className="border-start-0 ps-0"
                        />
                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold small">
                        Password <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0">
                          <i className="ph ph-lock text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange('password')}
                          isInvalid={!!errors.password}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          className="border-start-0 border-end-0 ps-0"
                        />
                        <InputGroup.Text
                          onClick={() => setShowPassword((p) => !p)}
                          style={{ cursor: 'pointer' }}
                          className="bg-light"
                        >
                          <i className={`ph ${showPassword ? 'ph-eye' : 'ph-eye-slash'} text-muted`} />
                        </InputGroup.Text>
                        {errors.password && (
                          <div className="invalid-feedback d-block">{errors.password}</div>
                        )}
                      </InputGroup>
                    </Form.Group>

                    <div className="d-grid mb-3">
                      <Button
                        variant="success"
                        type="submit"
                        size="lg"
                        disabled={loading}
                        className="shadow-sm"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <i className="ph ph-sign-in me-2" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>

                  <div className="text-center mt-3 pt-3 border-top">
                    <p className="text-muted small mb-0">
                      Don&apos;t have an account?{' '}
                      <a href="mailto:support@planetcare.in" className="text-success fw-semibold">
                        Contact Administrator
                      </a>
                    </p>
                  </div>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrguserLogin;
