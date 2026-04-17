// react-bootstrap
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

// project-imports
import MainCard from 'components/MainCard';

// ==============================|| TEACHER - ADD ||============================== //

export default function TeacherAdd() {
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
                  <Form.Control type="email" placeholder="teacher@example.com" required />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Joining Date</Form.Label>
                  <Form.Control type="date" />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="password" placeholder="Minimum 8 characters" required />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="password" placeholder="Re-enter your password" required />
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
                  <Form.Label>Designation</Form.Label>
                  <Form.Control type="text" placeholder="e.g., Professor, Lecturer" />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select>
                    <option value="">Select department</option>
                    <option>Department 1</option>
                    <option>Department 2</option>
                  </Form.Select>
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
                  <Form.Label>Education</Form.Label>
                  <Form.Control type="text" placeholder="e.g., B.Tech, M.Tech, Ph.D." />
                </div>
              </Col>
              <Col md={12}>
                <div className="mb-3">
                  <Form.Label>Profile Photo</Form.Label>
                  <Form.Control type="file" accept="image/*" aria-label="Upload profile photo" />
                </div>
              </Col>
              <Col md={12} className="text-end">
                <Button type="submit">Add Teacher</Button>
              </Col>
            </Row>
          </Form>
        </MainCard>
      </Col>
    </Row>
  );
}
