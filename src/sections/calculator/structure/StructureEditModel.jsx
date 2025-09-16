import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

export default function StructureEditModal({ show, onClose, onSave, structure }) {
  const [name, setName] = useState('');

  // preload name if editing
  useEffect(() => {
    if (structure) {
      setName(structure.name);
    } else {
      setName('');
    }
  }, [structure]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ ...structure, name });
  };

  return (
    <Modal className="modal-animate anim-sticky-up" show={show} onHide={onClose} centered>
      <Modal.Header className="bg-dark" closeButton closeVariant="white">
        <Modal.Title className="text-white">{structure ? 'Edit Structure' : 'Create Structure'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="structureName">
            <Form.Label>Structure Name</Form.Label>
            <Form.Control type="text" placeholder="Enter structure name" value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {structure ? 'Update' : 'Create'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

StructureEditModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  structure: PropTypes.object // null for create, object for edit
};
