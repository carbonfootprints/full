import React from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';

function CategoryShowTemplate({ category, formData, setFormData, level = 0 }) {
  const categoryKey = category._id || category.name;
  const fields = Object.entries(category.dataTemplate || {});

  const handleChange = (fieldLabel, value) => {
    setFormData((prev) => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        [fieldLabel]: value
      }
    }));
  };

  return (
    <Card className="mb-3 p-3" style={{ marginLeft: `${level * 20}px` }}>
      <h5 className="fw-bold text-success mb-3">{category.name}</h5>

      {/* Show fields only if they exist */}
      {fields.length > 0 && (
        <Row className="g-3">
          {fields.map(([key, label]) => (
            <Col lg={4} md={6} sm={12} key={key}>
              <Form.Group className="mb-2">
                <Form.Label>{label}</Form.Label>
                <Form.Control
                  type="text"
                  value={formData[categoryKey]?.[label] || ''}
                  onChange={(e) => handleChange(label, e.target.value)}
                />
              </Form.Group>
            </Col>
          ))}
        </Row>
      )}

      {/* Recursively render children */}
      {category.children && category.children.length > 0 && (
        <div className="mt-3">
          {category.children.map((child) => (
            <CategoryShowTemplate
              key={child._id || child.name}
              category={child}
              formData={formData}
              setFormData={setFormData}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export default CategoryShowTemplate;
