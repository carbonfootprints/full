import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

export default function CategoryEditModal({ show, onClose, onSave, category }) {
  const [formData, setFormData] = useState({
    name: '',
    templateFields: {} // holds all template key-value pairs
  });

  useEffect(() => {
    if (show) {
      setFormData({
        name: category?.name || '',
        templateFields: category?.dataTemplate ? { ...category.dataTemplate } : {}
      });
    }
  }, [category, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      templateFields: { ...prev.templateFields, [key]: value }
    }));
  };

  const handleAddTemplateField = () => {
    // Generate a unique key to avoid overwriting
    let counter = 1;
    let newKey = `field${Object.keys(formData.templateFields).length + counter}`;
    while (formData.templateFields[newKey]) (counter += 1), (newKey = `field${Object.keys(formData.templateFields).length + counter}`);

    handleTemplateChange(newKey, '');
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const payload = {
      ...category,
      name: formData.name,
      dataTemplate: { ...formData.templateFields } // ensure all fields are included
    };

    console.log('Submitting payload:', payload); // debug: see what is sent
    onSave(payload);
  };

  return (
    <Modal className="modal-animate anim-sticky-up" show={show} onHide={onClose} centered>
      <Modal.Header className="bg-dark" closeButton closeVariant="white">
        <Modal.Title className="text-white">{category ? 'Edit Category' : 'Create Category'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="categoryName">
            <Form.Label>Category Name</Form.Label>
            <Form.Control type="text" placeholder="Enter category name" name="name" value={formData.name} onChange={handleChange} />
          </Form.Group>
          {category && (
            <>
              <Form.Label>Template Fields</Form.Label>
              {Object.entries(formData.templateFields).map(([key, value]) => (
                <Form.Group className="mb-2" key={key}>
                  <Form.Control
                    type="text"
                    placeholder={`Enter value for ${key}`}
                    value={value}
                    onChange={(e) => handleTemplateChange(key, e.target.value)}
                  />
                </Form.Group>
              ))}

              <Button variant="outline-primary" size="sm" onClick={handleAddTemplateField}>
                + Add Template Field
              </Button>
            </>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {category ? 'Update' : 'Create'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

CategoryEditModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  category: PropTypes.object
};
