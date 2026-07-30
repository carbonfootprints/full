import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';

// react-bootstrap
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';
import Spinner from 'react-bootstrap/Spinner';
import Image from 'react-bootstrap/Image';

// project-imports
import MainCard from 'components/MainCard';
import ReactQuillDemo from 'components/third-party/ReactQuill';

// assets
import Avatar from 'assets/images/user/avatar-1.png';

// =============================|| ADMIN TICKET DETAILS ||============================== //

export default function AdminTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchTicket = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const res = await axiosServices.get(`${apiUrl}/api/tickets/${ticketId}`);

      setTicket(res.data.ticket);
      setSelectedStatus(res.data.ticket.status);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch ticket details.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();

    if (!replyMessage.trim()) {
      Swal.fire('Error', 'Please enter a reply message.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const res = await axiosServices.post(
        `${apiUrl}/api/tickets/${ticketId}/reply`,
        { message: replyMessage }
      );

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Reply sent successfully!',
        timer: 1500
      });

      setReplyMessage('');
      fetchTicket(); // Refresh ticket data
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to send reply.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      await axiosServices.put(
        `${apiUrl}/api/tickets/${ticketId}/status`,
        { status: newStatus }
      );

      setSelectedStatus(newStatus);
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Ticket status updated successfully!',
        timer: 1500
      });

      fetchTicket();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update status.'
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading ticket details...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <Alert variant="danger">
        Ticket not found.
      </Alert>
    );
  }

  return (
    <Row>
      <Col lg={8}>
        <MainCard>
          <Button
            variant="outline-secondary"
            size="sm"
            className="mb-3"
            onClick={() => navigate('/admin-panel/helpdesk/ticket/list')}
          >
            <i className="ph ph-arrow-left me-2" />
            Back to List
          </Button>

          <Stack direction="horizontal" gap={2} className="mb-3 flex-wrap">
            <h4 className="mb-0">{ticket.subject}</h4>
            <Badge bg={ticket.status === 'Open' ? 'primary' : ticket.status === 'Closed' ? 'success' : 'info'}>
              {ticket.status}
            </Badge>
          </Stack>

          <div className="border-bottom pb-3 mb-3">
            <div dangerouslySetInnerHTML={{ __html: ticket.description }} />
          </div>

          {/* Replies Section */}
          <h5 className="mb-3">Replies ({ticket.replies?.length || 0})</h5>

          {ticket.replies && ticket.replies.length > 0 ? (
            <div className="replies-list mb-4">
              {ticket.replies.map((reply, index) => (
                <Card key={reply._id || index} className="mb-3">
                  <Card.Body>
                    <Stack direction="horizontal" className="align-items-center justify-content-between mb-2">
                      <div>
                        <h6 className="mb-0">
                          <Image src={Avatar} className="wid-20 rounded me-2" />
                          {reply.user?.name || reply.user?.contactPerson || 'Unknown User'}
                          {reply.isAdminReply && (
                            <Badge bg="light-success" className="ms-2">
                              Admin
                            </Badge>
                          )}
                        </h6>
                        <small className="text-muted">{formatDate(reply.createdAt)}</small>
                      </div>
                    </Stack>
                    <div dangerouslySetInnerHTML={{ __html: reply.message }} />
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <Alert variant="info" className="mb-4">
              No replies yet. Be the first to respond!
            </Alert>
          )}

          {/* Reply Form */}
          <Form onSubmit={handleSubmitReply}>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Add Reply</strong>
              </Form.Label>
              <ReactQuillDemo defaultText={replyMessage} onChange={setReplyMessage} />
            </Form.Group>

            <Stack direction="horizontal" gap={2}>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="ph ph-paper-plane-tilt me-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </Stack>
          </Form>
        </MainCard>
      </Col>

      <Col lg={4}>
        <MainCard title="Ticket Details" bodyClassName="p-0">
          <div className="select-block p-3">
            <div className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Replied">Replied</option>
                <option value="Closed">Closed</option>
                <option value="Closed Forever">Closed Forever</option>
              </Form.Select>
            </div>
          </div>

          <ListGroup variant="flush">
            <ListGroup.Item>
              <Stack direction="horizontal" className="align-items-center">
                <div className="flex-shrink-0">
                  <label className="mb-0 wid-100">Ticket #</label>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="mb-0">
                    <strong>{ticket.ticketNumber}</strong>
                  </p>
                </div>
              </Stack>
            </ListGroup.Item>

            <ListGroup.Item>
              <Stack direction="horizontal" className="align-items-center">
                <div className="flex-shrink-0">
                  <label className="mb-0 wid-100">Customer</label>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="mb-0">
                    <Image src={Avatar} alt="" className="wid-20 rounded me-1" />
                    {ticket.user?.contactPerson || ticket.user?.name}
                  </p>
                </div>
              </Stack>
            </ListGroup.Item>

            <ListGroup.Item>
              <Stack direction="horizontal" className="align-items-center">
                <div className="flex-shrink-0">
                  <label className="mb-0 wid-100">Contact</label>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="mb-0">
                    <i className="ph ph-envelope-simple me-1 align-middle" />
                    {ticket.user?.email}
                  </p>
                </div>
              </Stack>
            </ListGroup.Item>

            <ListGroup.Item>
              <Stack direction="horizontal" className="align-items-center">
                <div className="flex-shrink-0">
                  <label className="mb-0 wid-100">Category</label>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="mb-0">
                    <i className="ph ph-folder me-1" />
                    {ticket.category}
                  </p>
                </div>
              </Stack>
            </ListGroup.Item>

            <ListGroup.Item>
              <Stack direction="horizontal" className="align-items-center">
                <div className="flex-shrink-0">
                  <label className="mb-0 wid-100">Priority</label>
                </div>
                <div className="flex-grow-1 ms-3">
                  <Badge bg={ticket.priority === 'Urgent' ? 'danger' : ticket.priority === 'High' ? 'warning' : 'info'}>
                    {ticket.priority}
                  </Badge>
                </div>
              </Stack>
            </ListGroup.Item>

            <ListGroup.Item>
              <Stack direction="horizontal" className="align-items-center">
                <div className="flex-shrink-0">
                  <label className="mb-0 wid-100">Created</label>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="mb-0">
                    <i className="ph ph-calendar-blank align-middle me-1" />
                    <small>{formatDate(ticket.createdAt)}</small>
                  </p>
                </div>
              </Stack>
            </ListGroup.Item>

            {ticket.lastReplyAt && (
              <ListGroup.Item>
                <Stack direction="horizontal" className="align-items-center">
                  <div className="flex-shrink-0">
                    <label className="mb-0 wid-100">Last Reply</label>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <p className="mb-0">
                      <i className="ph ph-clock align-middle me-1" />
                      <small>{formatDate(ticket.lastReplyAt)}</small>
                    </p>
                  </div>
                </Stack>
              </ListGroup.Item>
            )}
          </ListGroup>
        </MainCard>
      </Col>
    </Row>
  );
}
