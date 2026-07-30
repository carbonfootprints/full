import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';
import { Row, Col, Card, Form, FormGroup, Label, Input, Button, Progress } from 'reactstrap';

const OrguserRegistration = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0: Verifying, 1: Password, 2: Org Details
  const [isValidToken, setIsValidToken] = useState(false);
  const [orguserInfo, setOrguserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    organisationName: '',
    numberOfEmployees: '',
    numberOfSites: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axiosServices.get(`${API_URL}/api/orguser/register/verify/${token}`);

      if (response.data.status === 200) {
        setIsValidToken(true);
        setOrguserInfo(response.data.orguser);
        setStep(1); // Move to password step
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Link',
        text: error.response?.data?.message || 'This registration link is invalid or has expired.',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        navigate('/login');
      });
    }
  };

  const validatePassword = () => {
    const newErrors = {};
    const pwd = formData.password;

    if (pwd.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/[a-z]/.test(pwd)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[A-Z]/.test(pwd)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/\d/.test(pwd)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[^a-zA-Z0-9]/.test(pwd)) {
      newErrors.password = 'Password must contain at least one special character (e.g. @, #, !, $, %)';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOrgDetails = () => {
    const newErrors = {};

    if (!formData.organisationName) newErrors.organisationName = 'Organization name is required';
    if (!formData.numberOfEmployees || formData.numberOfEmployees < 1) {
      newErrors.numberOfEmployees = 'Number of employees must be at least 1';
    }
    if (!formData.numberOfSites || formData.numberOfSites < 1) {
      newErrors.numberOfSites = 'Number of sites must be at least 1';
    }
    if (!formData.address) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validatePassword()) {
        setStep(2);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateOrgDetails()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axiosServices.post(`${API_URL}/api/orguser/register/${token}`, {
        ...formData,
        numberOfEmployees: parseInt(formData.numberOfEmployees),
        numberOfSites: parseInt(formData.numberOfSites)
      });

      // Auto-login
      const { token: accessToken, orguser } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(orguser));

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: `Welcome, ${orguser.contactPerson}! Your organization has been registered.`,
        confirmButtonText: 'Go to Dashboard'
      }).then(() => {
        navigate('/orguser/dashboard');
      });
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 0) {
    return (
      <div className="auth-main">
        <div className="auth-wrapper v1">
          <div className="auth-form">
            <Card className="my-5">
              <div className="card-body text-center">
                <div className="mb-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
                <h5>Verifying Registration Link...</h5>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-main">
      <div className="auth-wrapper v1">
        <div className="auth-form">
          <Card className="my-5">
            <div className="card-body">
              <div className="text-center mb-4">
                <h4 className="f-w-500">Complete Your Registration</h4>
                {orguserInfo && (
                  <p className="text-muted mb-0">
                    Email: <strong>{orguserInfo.email}</strong>
                  </p>
                )}
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className={step >= 1 ? 'text-primary' : 'text-muted'}>1. Password</span>
                  <span className={step >= 2 ? 'text-primary' : 'text-muted'}>2. Organization Details</span>
                </div>
                <Progress value={step === 1 ? 50 : 100} />
              </div>

              <Form onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}>
                {/* Step 1: Password */}
                {step === 1 && (
                  <>
                    <FormGroup>
                      <Label for="password">Password *</Label>
                      <Input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                        }}
                        invalid={!!errors.password}
                        required
                      />
                      {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                      <small className="text-muted">
                        Must be at least 8 characters with uppercase, lowercase, number, and a special character (e.g. @, #, !, $, %)
                      </small>
                    </FormGroup>

                    <FormGroup>
                      <Label for="confirmPassword">Confirm Password *</Label>
                      <Input
                        type="password"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, confirmPassword: e.target.value });
                          if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                        }}
                        invalid={!!errors.confirmPassword}
                        required
                      />
                      {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
                    </FormGroup>

                    <Button color="primary" block type="button" onClick={handleNextStep}>
                      Next: Organization Details
                    </Button>
                  </>
                )}

                {/* Step 2: Organization Details */}
                {step === 2 && (
                  <>
                    <FormGroup>
                      <Label for="organisationName">Organization Name *</Label>
                      <Input
                        type="text"
                        id="organisationName"
                        value={formData.organisationName}
                        onChange={(e) => setFormData({ ...formData, organisationName: e.target.value })}
                        invalid={!!errors.organisationName}
                        required
                      />
                      {errors.organisationName && <div className="invalid-feedback d-block">{errors.organisationName}</div>}
                    </FormGroup>

                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="numberOfEmployees">Number of Employees *</Label>
                          <Input
                            type="number"
                            id="numberOfEmployees"
                            value={formData.numberOfEmployees}
                            onChange={(e) => setFormData({ ...formData, numberOfEmployees: e.target.value })}
                            invalid={!!errors.numberOfEmployees}
                            min="1"
                            required
                          />
                          {errors.numberOfEmployees && (
                            <div className="invalid-feedback d-block">{errors.numberOfEmployees}</div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="numberOfSites">Number of Sites *</Label>
                          <Input
                            type="number"
                            id="numberOfSites"
                            value={formData.numberOfSites}
                            onChange={(e) => setFormData({ ...formData, numberOfSites: e.target.value })}
                            invalid={!!errors.numberOfSites}
                            min="1"
                            required
                          />
                          {errors.numberOfSites && <div className="invalid-feedback d-block">{errors.numberOfSites}</div>}
                          <small className="text-muted">Site templates will be created automatically</small>
                        </FormGroup>
                      </Col>
                    </Row>

                    <FormGroup>
                      <Label for="address">Address *</Label>
                      <Input
                        type="textarea"
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        invalid={!!errors.address}
                        rows="3"
                        required
                      />
                      {errors.address && <div className="invalid-feedback d-block">{errors.address}</div>}
                    </FormGroup>

                    <div className="d-grid gap-2">
                      <Button color="secondary" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button color="primary" type="submit" disabled={loading}>
                        {loading ? 'Completing Registration...' : 'Complete Registration'}
                      </Button>
                    </div>
                  </>
                )}
              </Form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrguserRegistration;
