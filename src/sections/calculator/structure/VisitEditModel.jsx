import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

export default function VisitEditModal({ show, onClose, onSave, visit }) {
  const [formData, setFormData] = useState({
    name: '',
    siteName: '',
    companyRegNo: '',
    address: '',
    contactPerson: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (visit) {
      setFormData({
        name: visit.organisationname || '',
        siteName: visit.sitename || '',
        companyRegNo: visit.registernumber || '',
        address: visit.address || '',
        contactPerson: visit.contactperson || '',
        email: visit.email || '',
        phone: visit.phonenumber || '',
        noOfEmployees: visit.noofemployees || '',
        description: visit.description || '',
        coordinates: visit.coordinates ? visit.coordinates.join(',') : '' // convert array to string
      });
    } else {
      setFormData({
        name: '',
        siteName: '',
        companyRegNo: '',
        address: '',
        contactPerson: '',
        email: '',
        phone: '',
        noOfEmployees: '',
        description: '',
        coordinates: ''
      });
    }
  }, [visit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    console.log('handleSubmit');
    if (!formData.name.trim()) return;

    onSave({
      ...visit,
      organisationname: formData.name,
      sitename: formData.siteName,
      registernumber: formData.companyRegNo,
      address: formData.address,
      contactperson: formData.contactPerson,
      email: formData.email,
      phonenumber: formData.phone,
      noofemployees: Number(formData.noOfEmployees) || 0,
      description: formData.description || '',
      coordinates: formData.coordinates ? formData.coordinates.split(',').map(Number) : [0, 0],
      status: visit?.status || 'pending'
    });
  };

  return (
    <Modal className="modal-animate anim-sticky-up" show={show} onHide={onClose} centered>
      <Modal.Header className="bg-dark" closeButton closeVariant="white">
        <Modal.Title className="text-white">{visit ? 'Edit Visit' : 'Create Visit'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="visitName">
            <Form.Label>Visit Name</Form.Label>
            <Form.Control type="text" placeholder="Enter visit name" name="name" value={formData.name} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="siteName">
            <Form.Label>Site Name</Form.Label>
            <Form.Control type="text" placeholder="Enter site name" name="siteName" value={formData.siteName} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="companyRegNo">
            <Form.Label>Company Registration Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter registration number"
              name="companyRegNo"
              value={formData.companyRegNo}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Enter address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="contactPerson">
            <Form.Label>Contact Person</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter contact person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Enter email" name="email" value={formData.email} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="phone">
            <Form.Label>Phone</Form.Label>
            <Form.Control type="text" placeholder="Enter phone number" name="phone" value={formData.phone} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="noOfEmployees">
            <Form.Label>No of Employees</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter number of employees"
              name="noOfEmployees"
              value={formData.noOfEmployees}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Enter description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="coordinates">
            <Form.Label>Coordinates (lat,lng)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter latitude,longitude"
              name="coordinates"
              value={formData.coordinates}
              onChange={(e) => setFormData((prev) => ({ ...prev, coordinates: e.target.value }))}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {visit ? 'Update' : 'Create'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

VisitEditModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  visit: PropTypes.object
};
