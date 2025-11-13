import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

export default function VisitEditModal({ show, onClose, onSave, visit }) {
  const [formData, setFormData] = useState({
    dataTemplate: {}, // admin-defined fields
    dataValues: {}, // actual filled values
    status: 'pending'
  });

  useEffect(() => {
    if (show) {
      setFormData({
        dataTemplate: visit?.dataTemplate ? { ...visit.dataTemplate } : {},
        dataValues: visit?.dataValues ? { ...visit.dataValues } : {},
        status: visit?.status || 'pending'
      });
    }
  }, [visit, show]);

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      dataTemplate: { ...prev.dataTemplate, [key]: value } // admin stores values directly in dataTemplate
    }));
  };

  const handleAddField = () => {
    let counter = 1;
    let newKey = `field${Object.keys(formData.dataTemplate).length + counter}`;
    while (formData.dataTemplate[newKey]) {
      counter += 1;
      newKey = `field${Object.keys(formData.dataTemplate).length + counter}`;
    }
    setFormData((prev) => ({
      ...prev,
      dataTemplate: { ...prev.dataTemplate, [newKey]: '' } // <-- initially empty, admin will type
    }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, status: e.target.value }));
  };

  const handleSubmit = () => {
    const payload = {
      ...visit,
      dataTemplate: { ...formData.dataTemplate }, // only template matters for admin
      status: formData.status
    };

    console.log('Submitting visit payload:', payload);
    onSave(payload);
  };

  return (
    <Modal className="modal-animate anim-sticky-up" show={show} onHide={onClose} centered>
      <Modal.Header className="bg-dark" closeButton closeVariant="white">
        <Modal.Title className="text-white">{visit ? 'Edit Visit' : 'Create Visit'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Label>Visit Data Fields</Form.Label>

          {Object.entries(formData.dataTemplate).map(([key, value]) => (
            <Form.Group className="mb-3" key={key}>
              <Form.Label className="text-capitalize">{key}</Form.Label>
              <Form.Control
                type="text"
                placeholder={`Enter ${key}`}
                value={value} // <-- use dataTemplate directly
                onChange={(e) => handleFieldChange(key, e.target.value)}
              />
            </Form.Group>
          ))}

          <Button variant="outline-primary" size="sm" onClick={handleAddField}>
            + Add Field
          </Button>

          <Form.Group className="mt-3" controlId="visitStatus">
            <Form.Label>Status</Form.Label>
            <Form.Select value={formData.status} onChange={handleStatusChange}>
              <option value="pending">Pending</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </Form.Select>
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
