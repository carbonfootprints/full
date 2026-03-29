import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

// react-bootstrap
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';
import Spinner from 'react-bootstrap/Spinner';
import Image from 'react-bootstrap/Image';

// project-imports
import MainCard from 'components/MainCard';

// assets
import Avatar from 'assets/images/user/avatar-1.png';

// =============================|| ADMIN TICKETS LIST ||============================== //

export default function AdminTicketsList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({
    status: '',
    category: '',
    priority: ''
  });

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      let url = `${apiUrl}/api/tickets/admin/all`;
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.category) params.append('category', filter.category);
      if (filter.priority) params.append('priority', filter.priority);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTickets(res.data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch tickets.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const res = await axios.get(`${apiUrl}/api/tickets/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStats(res.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [filter]);

  const handleDeleteTicket = async (ticketId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This ticket will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

        await axios.delete(`${apiUrl}/api/tickets/${ticketId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        Swal.fire('Deleted!', 'Ticket has been deleted.', 'success');
        fetchTickets();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete ticket.', 'error');
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Open': 'light-primary',
      'In Progress': 'light-warning',
      'Replied': 'light-info',
      'Closed': 'light-success',
      'Closed Forever': 'light-danger'
    };
    return variants[status] || 'light-secondary';
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      'Low': 'light-secondary',
      'Medium': 'light-info',
      'High': 'light-warning',
      'Urgent': 'light-danger'
    };
    return variants[priority] || 'light-secondary';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading tickets...</p>
      </div>
    );
  }

  return (
    <>
      {stats && (
        <Row className="mb-3">
          <Col md={6} lg={3}>
            <MainCard>
              <h6 className="text-muted">Total Tickets</h6>
              <h3>{stats.total}</h3>
            </MainCard>
          </Col>
          <Col md={6} lg={3}>
            <MainCard>
              <h6 className="text-muted">Open</h6>
              <h3 className="text-primary">{stats.open}</h3>
            </MainCard>
          </Col>
          <Col md={6} lg={3}>
            <MainCard>
              <h6 className="text-muted">In Progress</h6>
              <h3 className="text-warning">{stats.inProgress}</h3>
            </MainCard>
          </Col>
          <Col md={6} lg={3}>
            <MainCard>
              <h6 className="text-muted">Closed</h6>
              <h3 className="text-success">{stats.closed}</h3>
            </MainCard>
          </Col>
        </Row>
      )}

      <MainCard>
        <Stack direction="horizontal" className="justify-content-between align-items-center mb-3">
          <h5 className="mb-0">All Support Tickets</h5>
        </Stack>

        <Row className="mb-3">
          <Col md={3}>
            <Form.Select
              size="sm"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Replied">Replied</option>
              <option value="Closed">Closed</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              size="sm"
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Billing">Billing</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Account">Account</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              size="sm"
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </Form.Select>
          </Col>
        </Row>
      </MainCard>

      {tickets.length === 0 ? (
        <Alert variant="info" className="mt-3">
          <i className="ph ph-info me-2" />
          No tickets found.
        </Alert>
      ) : (
        tickets.map((ticket) => (
          <MainCard key={ticket._id} className="ticket-card mt-3">
            <Row>
              <Col sm="auto" className="mb-3 md-sm-0">
                <Image src={Avatar} className="wid-60 img-radius" />
              </Col>

              <Col>
                <Stack direction="horizontal" gap={2} className="mb-2 flex-wrap align-items-center">
                  <h6 className="mb-0">{ticket.user?.contactPerson || ticket.user?.name || 'Unknown User'}</h6>
                  <Badge bg={getStatusBadge(ticket.status)}>{ticket.status}</Badge>
                  <Badge bg={getPriorityBadge(ticket.priority)}>{ticket.priority}</Badge>
                  {ticket.isPrivate && (
                    <Badge bg="light-warning">Private</Badge>
                  )}
                </Stack>

                <small className="text-muted d-block mb-2">
                  <i className="ph ph-envelope me-1" />
                  {ticket.user?.email}
                </small>

                <h5 className="mt-2 mb-2">
                  <i className="ph ph-ticket me-2" />
                  {ticket.ticketNumber}: {ticket.subject}
                </h5>

                <Stack direction="horizontal" gap={3} className="mb-3 flex-wrap text-muted">
                  <small>
                    <i className="ph ph-folder me-1" />
                    {ticket.category}
                  </small>
                  <small>
                    <i className="ph ph-calendar-blank me-1" />
                    Updated {formatDate(ticket.updatedAt)}
                  </small>
                  {ticket.replies && ticket.replies.length > 0 && (
                    <small>
                      <i className="ph ph-chat-dots me-1" />
                      {ticket.replies.length} {ticket.replies.length === 1 ? 'Reply' : 'Replies'}
                    </small>
                  )}
                  {ticket.assignedTo && (
                    <small>
                      <i className="ph ph-user me-1" />
                      Assigned to {ticket.assignedTo.name}
                    </small>
                  )}
                </Stack>

                <Stack direction="horizontal" gap={2}>
                  <Link
                    className="btn btn-sm btn-light-primary"
                    to={`/admin-panel/helpdesk/ticket/details/${ticket._id}`}
                  >
                    <i className="ph ph-eye align-middle me-1" />
                    View & Reply
                  </Link>
                  <Button
                    size="sm"
                    variant="light-danger"
                    onClick={() => handleDeleteTicket(ticket._id)}
                  >
                    <i className="ph ph-trash align-middle me-1" />
                    Delete
                  </Button>
                </Stack>
              </Col>
            </Row>
          </MainCard>
        ))
      )}
    </>
  );
}
