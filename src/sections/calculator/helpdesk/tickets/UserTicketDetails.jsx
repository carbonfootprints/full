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

// =============================|| USER TICKET DETAILS ||============================== //

export default function UserTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      console.log('🎫 Fetching ticket details...');
      console.log('Ticket ID:', ticketId);
      console.log('API URL:', `${apiUrl}/api/tickets/${ticketId}`);
      console.log('Token exists:', !!token);

      if (!token) {
        Swal.fire({
          icon: 'warning',
          title: 'Not Logged In',
          text: 'Please login to view ticket details.',
          confirmButtonText: 'Go to Login'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login');
          }
        });
        setLoading(false);
        return;
      }

      const res = await axiosServices.get(`${apiUrl}/api/tickets/${ticketId}`);

      console.log('✅ Ticket fetched successfully:', res.data);
      setTicket(res.data.ticket);
    } catch (error) {
      console.error('❌ Error fetching ticket:', error);
      console.error('Error response:', error.response);

      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          confirmButtonText: 'Go to Login'
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            navigate('/login');
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to fetch ticket details.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ticketId) {
      console.log('❌ No ticket ID provided in URL');
      Swal.fire({
        icon: 'warning',
        title: 'No Ticket ID',
        text: 'Please select a ticket from the tickets list.',
        confirmButtonText: 'Go to Tickets List'
      }).then(() => {
        navigate('/calculate/helpdesk/ticket/list');
      });
      setLoading(false);
      return;
    }
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

      await axiosServices.post(
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Open': 'primary',
      'In Progress': 'warning',
      'Replied': 'info',
      'Closed': 'success',
      'Closed Forever': 'danger'
    };
    return variants[status] || 'secondary';
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      'Low': 'secondary',
      'Medium': 'info',
      'High': 'warning',
      'Urgent': 'danger'
    };
    return variants[priority] || 'secondary';
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
            onClick={() => navigate('/calculate/helpdesk/ticket/list')}
          >
            <i className="ph ph-arrow-left me-2" />
            Back to My Tickets
          </Button>

          <Stack direction="horizontal" gap={2} className="mb-3 flex-wrap">
            <h4 className="mb-0">{ticket.subject}</h4>
            <Badge bg={getStatusBadge(ticket.status)}>
              {ticket.status}
            </Badge>
            <Badge bg={getPriorityBadge(ticket.priority)}>
              {ticket.priority}
            </Badge>
          </Stack>

          <div className="border-bottom pb-3 mb-3">
            <h6 className="text-muted">Description:</h6>
            <div dangerouslySetInnerHTML={{ __html: ticket.description }} />
          </div>

          {/* Replies Section */}
          <h5 className="mb-3">Conversation ({ticket.replies?.length || 0} {ticket.replies?.length === 1 ? 'Reply' : 'Replies'})</h5>

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
                            <Badge bg="success" className="ms-2">
                              Support Team
                            </Badge>
                          )}
                        </h6>
                        <small className="text-muted">{formatDate(reply.createdAt)}</small>
                      </div>
                    </Stack>
                    <div className="mt-2" dangerouslySetInnerHTML={{ __html: reply.message }} />
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <Alert variant="info" className="mb-4">
              No replies yet. Waiting for support team response...
            </Alert>
          )}

          {/* Reply Form - Only show if ticket is not closed */}
          {ticket.status !== 'Closed' && ticket.status !== 'Closed Forever' && (
            <Form onSubmit={handleSubmitReply}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Add Your Reply</strong>
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
          )}

          {(ticket.status === 'Closed' || ticket.status === 'Closed Forever') && (
            <Alert variant="warning" className="mt-3">
              <i className="ph ph-info me-2" />
              This ticket is closed. If you need further assistance, please create a new ticket.
            </Alert>
          )}
        </MainCard>
      </Col>

      <Col lg={4}>
        <MainCard title="Ticket Information" bodyClassName="p-0">
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
                  <label className="mb-0 wid-100">Status</label>
                </div>
                <div className="flex-grow-1 ms-3">
                  <Badge bg={getStatusBadge(ticket.status)}>
                    {ticket.status}
                  </Badge>
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
                  <Badge bg={getPriorityBadge(ticket.priority)}>
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

            {ticket.assignedTo && (
              <ListGroup.Item>
                <Stack direction="horizontal" className="align-items-center">
                  <div className="flex-shrink-0">
                    <label className="mb-0 wid-100">Assigned To</label>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <p className="mb-0">
                      <Image src={Avatar} className="wid-20 rounded me-1" />
                      {ticket.assignedTo.name}
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
