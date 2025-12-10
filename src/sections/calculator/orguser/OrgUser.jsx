import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';

// project-imports
import MainCard from 'components/MainCard';

export default function OrgUser() {
  const [formData, setFormData] = useState({
    email: '',
    organisationName: '',
    numberOfEmployees: '',
    numberOfSites: '',
    contactNumber: '',
    address: '',
    password: '',
    profilePicture: '',
    link: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:8000/api/admin/orguser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Something went wrong'
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Created Successfully',
        text: 'Organisation User has been created'
      });

      // Clear the form after creation
      setFormData({
        email: '',
        organisationName: '',
        numberOfEmployees: '',
        numberOfSites: '',
        contactNumber: '',
        address: '',
        password: '',
        profilePicture: '',
        link: ''
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MainCard title="Create Organisation User">
      <Form onSubmit={handleSubmit}>
        {/* Row 1 */}
        <Row className="mb-3 g-3">
          <Col lg={2} className="col-form-label">
            <Form.Label>Organisation Name:</Form.Label>
          </Col>
          <Col lg={3}>
            <Form.Control
              type="text"
              name="organisationName"
              value={formData.organisationName}
              onChange={handleChange}
              placeholder="Enter organisation name"
            />
          </Col>

          <Col lg={2} className="col-form-label">
            <Form.Label>Email:</Form.Label>
          </Col>
          <Col lg={3}>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email" />
          </Col>
        </Row>

        {/* Row 2 */}
        <Row className="mb-3 g-3">
          <Col lg={2} className="col-form-label">
            <Form.Label>Contact Number:</Form.Label>
          </Col>
          <Col lg={3}>
            <Form.Control
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter contact number"
            />
          </Col>

          <Col lg={2} className="col-form-label">
            <Form.Label>Password:</Form.Label>
          </Col>
          <Col lg={3}>
            <InputGroup>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
              <InputGroup.Text>
                <i className="ph ph-lock-key" />
              </InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>

        {/* Row 3 */}
        <Row className="mb-3 g-3">
          <Col lg={2} className="col-form-label">
            <Form.Label>Number of Employees:</Form.Label>
          </Col>
          <Col lg={3}>
            <Form.Control
              type="number"
              name="numberOfEmployees"
              value={formData.numberOfEmployees}
              onChange={handleChange}
              placeholder="Enter employees count"
            />
          </Col>

          <Col lg={2} className="col-form-label">
            <Form.Label>Number of Sites:</Form.Label>
          </Col>
          <Col lg={3}>
            <Form.Control
              type="number"
              name="numberOfSites"
              value={formData.numberOfSites}
              onChange={handleChange}
              placeholder="Enter site count"
            />
          </Col>
        </Row>

        {/* Row 4 */}
        <Row className="mb-3 g-3">
          <Col lg={2} className="col-form-label">
            <Form.Label>Address:</Form.Label>
          </Col>
          <Col lg={8}>
            <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter address" />
          </Col>
        </Row>

        {/* Row 5 */}
        <Row className="mb-3 g-3">
          <Col lg={2} className="col-form-label">
            <Form.Label>Profile Picture URL:</Form.Label>
          </Col>
          <Col lg={3}>
            <InputGroup>
              <Form.Control
                type="text"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="Enter Image URL"
              />
              <InputGroup.Text>
                <i className="ph ph-image" />
              </InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col lg={12} className="text-end">
            <Button type="submit" variant="primary">
              Create User
            </Button>
          </Col>
        </Row>
      </Form>
    </MainCard>
  );
}
