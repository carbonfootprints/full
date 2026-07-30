import { useState } from 'react';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// react-bootstrap
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';

// project-imports
import MainCard from 'components/MainCard';
import ReactQuillDemo from 'components/third-party/ReactQuill';

// ==============================|| TICKET - CREATE ||============================== //

export default function Create() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'General Inquiry',
    priority: 'Medium'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (value) => {
    setFormData({ ...formData, description: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject || !formData.description) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields.'
      });
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const res = await axiosServices.post(
        `${apiUrl}/api/tickets/create`,
        formData
      );

      if (res.data.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Ticket created successfully!',
          timer: 2000
        });

        // Reset form
        setFormData({
          subject: '',
          description: '',
          category: 'General Inquiry',
          priority: 'Medium'
        });

        // Redirect to tickets list
        setTimeout(() => {
          navigate('/calculate/helpdesk/ticket/list');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create ticket.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      subject: '',
      description: '',
      category: 'General Inquiry',
      priority: 'Medium'
    });
  };

  return (
    <MainCard>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col sm={6}>
            <div className="mb-3">
              <Form.Label>Category <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Billing">Billing</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Account">Account</option>
                <option value="Other">Other</option>
              </Form.Select>
            </div>
          </Col>
          <Col sm={6}>
            <div className="mb-3">
              <Form.Label>Priority <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </Form.Select>
            </div>
          </Col>

          <div className="mb-3">
            <Form.Label>Subject <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <Form.Label>Description <span className="text-danger">*</span></Form.Label>
            <ReactQuillDemo defaultText={formData.description} onChange={handleChange} />
          </div>

          <div className="mt-5">
            <Stack direction="horizontal" gap={2} className="justify-content-end mt-4">
              <Button type="button" variant="outline-secondary" onClick={handleClear} disabled={loading}>
                Clear
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </Stack>
          </div>
        </Row>
      </Form>
    </MainCard>
  );
}
