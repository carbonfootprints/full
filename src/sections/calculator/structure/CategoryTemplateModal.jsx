import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export default function CategoryTemplateModal({ show, category, onClose, onSave }) {
  const [templateFields, setTemplateFields] = useState({});
  const [values, setValues] = useState(category.dataValues || {});

  useEffect(() => {
    // Initialize template fields
    if (category?.dataTemplate && Object.keys(category.dataTemplate).length > 0) {
      setTemplateFields({ ...category.dataTemplate });
    } else {
      // If no template defined, start with one field
      setTemplateFields({ field1: '' });
    }

    // Initialize values
    setValues(category?.dataValues || {});
  }, [category, show]);

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };
  const handleAddField = () => {
    const newKey = `field${Object.keys(templateFields).length + 1}`;
    setTemplateFields((prev) => ({ ...prev, [newKey]: '' }));
  };

  const handleSubmit = () => {
    const payload = { ...category, dataTemplate: values };
    console.log('Submitting template values:', payload); // <-- This will show what you’re sending
    onSave(payload);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Template Values for {category?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {Object.entries(templateFields).map(([key, label], index) => (
            <Form.Group className="mb-3" key={index}>
              <Form.Label>{label || key}</Form.Label>
              <Form.Control type="text" value={values[key] || ''} onChange={(e) => handleChange(key, e.target.value)} />
            </Form.Group>
          ))}
          <Button variant="outline-primary" size="sm" onClick={handleAddField}>
            + Add Field
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
