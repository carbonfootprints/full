import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Swal from 'sweetalert2';
import axios from 'axios';

// project-imports
import MainCard from 'components/MainCard';

export default function OrgUser() {
  const [formData, setFormData] = useState({
    email: '',
    contactPerson: '',
    contactNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.contactPerson) {
      newErrors.contactPerson = 'Contact person name is required';
    }

    if (!formData.contactNumber) {
      newErrors.contactNumber = 'Contact number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/admin/orgusers`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      Swal.fire({
        icon: 'success',
        title: 'Created Successfully',
        html: `
          <p>Organization user has been created successfully!</p>
          <p class="mt-2"><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Contact Person:</strong> ${formData.contactPerson}</p>
          <hr class="my-3" />
          <p class="text-muted"><small>Next step: Generate a registration link for this user from the "All Users" page</small></p>
        `,
        confirmButtonText: 'OK'
      });

      // Clear the form after creation
      setFormData({
        email: '',
        contactPerson: '',
        contactNumber: ''
      });
      setErrors({});
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Something went wrong. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Create Organization User">
      <Alert variant="info" className="mb-4">
        <h6 className="alert-heading">
          <i className="ph ph-info me-2" />
          Creating Organization User
        </h6>
        <p className="mb-2">
          Create a new organization user by providing basic contact information. After creation, you can generate a
          registration link that allows the organization to:
        </p>
        <ul className="mb-0">
          <li>Set their own password</li>
          <li>Complete organization details (name, employees, sites, address)</li>
          <li>Access their dashboard and enter carbon footprint data</li>
        </ul>
      </Alert>

      <Form onSubmit={handleSubmit}>
        {/* Row 1 - Email */}
        <Row className="mb-3 g-3">
          <Col lg={2} className="col-form-label">
            <Form.Label>
              Email: <span className="text-danger">*</span>
            </Form.Label>
          </Col>
          <Col lg={4}>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter organization email"
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Col>

          <Col lg={2} className="col-form-label">
            <Form.Label>
              Contact Person: <span className="text-danger">*</span>
            </Form.Label>
          </Col>
          <Col lg={4}>
            <Form.Control
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Enter contact person name"
              isInvalid={!!errors.contactPerson}
            />
            <Form.Control.Feedback type="invalid">{errors.contactPerson}</Form.Control.Feedback>
          </Col>
        </Row>

        {/* Row 2 - Contact Number */}
        <Row className="mb-3 g-3">
          <Col lg={2} className="col-form-label">
            <Form.Label>
              Contact Number: <span className="text-danger">*</span>
            </Form.Label>
          </Col>
          <Col lg={4}>
            <Form.Control
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter contact number"
              isInvalid={!!errors.contactNumber}
            />
            <Form.Control.Feedback type="invalid">{errors.contactNumber}</Form.Control.Feedback>
          </Col>
        </Row>

        <hr className="my-4" />

        <Row className="mt-4">
          <Col lg={12} className="text-end">
            <Button type="button" variant="secondary" className="me-2" onClick={() => setFormData({ email: '', contactPerson: '', contactNumber: '' })}>
              Clear Form
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating...
                </>
              ) : (
                <>
                  <i className="ph ph-user-plus me-2" />
                  Create Organization User
                </>
              )}
            </Button>
          </Col>
        </Row>
      </Form>

      <Alert variant="warning" className="mt-4">
        <h6 className="alert-heading">
          <i className="ph ph-warning me-2" />
          Important Notes
        </h6>
        <ul className="mb-0">
          <li>
            <strong>No password is set during creation</strong> - The organization will set their password when they
            complete registration via the link
          </li>
          <li>
            <strong>Registration links expire in 7 days</strong> - Make sure to send the link to the organization
            promptly
          </li>
          <li>
            <strong>One-time use</strong> - Each registration link can only be used once
          </li>
        </ul>
      </Alert>
    </MainCard>
  );
}
