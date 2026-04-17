// react-bootstrap
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

// project-imports
import MainCard from 'components/MainCard';

// ==============================|| STUDENT - ADD ||============================== //

export default function StudentAdd() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <Row>
      <Col xs={12}>
        <MainCard title="Basic Information">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" placeholder="e.g., John" required />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" placeholder="e.g., Smith" required />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="email" placeholder="student@example.com" required />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Registration Date</Form.Label>
                  <Form.Control type="date" />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>ID Number</Form.Label>
                  <Form.Control type="text" placeholder="e.g., REG-2024-001" />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Course</Form.Label>
                  <Form.Select>
                    <option value="">Select course</option>
                    <option>Course 1</option>
                    <option>Course 2</option>
                  </Form.Select>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control type="tel" placeholder="10-digit mobile number" />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select>
                    <option value="">Select gender</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </Form.Select>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Parent&apos;s Name</Form.Label>
                  <Form.Control type="text" placeholder="Parent or guardian full name" />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Parent&apos;s Mobile Number</Form.Label>
                  <Form.Control type="tel" placeholder="10-digit mobile number" />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control type="date" />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Control type="text" placeholder="e.g., O+, A-, B+, AB+" />
                </div>
              </Col>
              <Col md={12}>
                <div className="mb-3">
                  <Form.Label>Shipping Address</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="Full residential address" />
                </div>
              </Col>
              <Col md={12}>
                <div className="mb-3">
                  <Form.Label>Profile Photo</Form.Label>
                  <Form.Control type="file" accept="image/*" aria-label="Upload profile photo" />
                </div>
              </Col>
              <Col md={12} className="text-end">
                <Button type="submit">Add Student</Button>
              </Col>
            </Row>
          </Form>
        </MainCard>
      </Col>
    </Row>
  );
}
