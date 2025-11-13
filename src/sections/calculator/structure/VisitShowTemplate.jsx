import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import MainCard from 'components/MainCard';
import { PencilSquare } from 'react-bootstrap-icons';

export default function VisitShowTemplate({ visit, formData, isEditing, setIsEditing, handleSubmit, handleChange }) {
  const onSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
    setIsEditing(false);
  };

  return (
    <MainCard title="Visit Information">
      {/* Edit toggle */}
      <div className="d-flex justify-content-end mb-3">
        <Button
          variant={isEditing ? 'secondary' : 'outline-primary'}
          onClick={() => setIsEditing(!isEditing)}
          className="d-flex align-items-center gap-2"
        >
          <PencilSquare size={18} />
          <span>{isEditing ? 'Cancel Edit' : 'Edit'}</span>
        </Button>
      </div>

      {/* Form Fields */}
      <Form onSubmit={onSubmit}>
        <Row className="g-3">
          {Object.entries(formData || {}).map(([label, value], idx) => (
            <Col lg={4} key={idx}>
              <Form.Group className="mb-3">
                <Form.Label className="text-capitalize">{label}:</Form.Label>
                <Form.Control
                  type="text"
                  name={label}
                  value={value ?? ''}
                  onChange={(e) => handleChange(label, e.target.value)}
                  disabled={!isEditing}
                  placeholder={`Enter ${label}`}
                />
              </Form.Group>
            </Col>
          ))}
        </Row>

        {/* Save button */}
        {isEditing && (
          <div className="d-flex justify-content-end mt-3">
            <Button type="submit" variant="success" className="px-4">
              Save & Continue
            </Button>
          </div>
        )}
      </Form>
    </MainCard>
  );
}
