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

// project-imports
import MainCard from 'components/MainCard';

// =============================|| USER TICKETS LIST ||============================== //

export default function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    category: ''
  });

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      console.log('📋 Fetching user tickets...');
      console.log('Token exists:', !!token);

      if (!token) {
        Swal.fire({
          icon: 'warning',
          title: 'Not Logged In',
          text: 'Please login to view your tickets.'
        });
        setLoading(false);
        return;
      }

      let url = `${apiUrl}/api/tickets/my-tickets`;
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.category) params.append('category', filter.category);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('API URL:', url);

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ Tickets fetched:', res.data.tickets?.length || 0, 'tickets');
      if (res.data.tickets && res.data.tickets.length > 0) {
        console.log('First ticket ID:', res.data.tickets[0]._id);
      }

      setTickets(res.data.tickets || []);
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      console.error('Error response:', error.response);

      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to fetch tickets.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
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
      <MainCard>
        <Stack direction="horizontal" className="justify-content-between align-items-center mb-3">
          <h5 className="mb-0">My Support Tickets</h5>
          <Link to="/calculate/helpdesk/ticket/create" className="btn btn-primary btn-sm">
            <i className="ph ph-plus align-middle me-1" />
            Create Ticket
          </Link>
        </Stack>

        <Row className="mb-3">
          <Col md={4}>
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
          <Col md={4}>
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
        </Row>
      </MainCard>

      {tickets.length === 0 ? (
        <Alert variant="info" className="mt-3">
          <i className="ph ph-info me-2" />
          No tickets found. Create your first support ticket to get started!
        </Alert>
      ) : (
        tickets.map((ticket) => (
          <MainCard key={ticket._id} className="ticket-card mt-3">
            <Row>
              <Col>
                <Stack direction="horizontal" gap={2} className="mb-2 flex-wrap">
                  <h5 className="mb-0">
                    <i className="ph ph-ticket me-2" />
                    {ticket.ticketNumber}
                  </h5>
                  <Badge bg={getStatusBadge(ticket.status)}>
                    {ticket.status}
                  </Badge>
                  <Badge bg={getPriorityBadge(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </Stack>

                <h6 className="mt-3 mb-2">{ticket.subject}</h6>

                <Stack direction="horizontal" gap={3} className="mb-3 flex-wrap text-muted">
                  <small>
                    <i className="ph ph-folder me-1" />
                    {ticket.category}
                  </small>
                  <small>
                    <i className="ph ph-calendar-blank me-1" />
                    Created {formatDate(ticket.createdAt)}
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
                    to={`/calculate/helpdesk/ticket/details/${ticket._id}`}
                  >
                    <i className="ph ph-eye align-middle me-1" />
                    View Details
                  </Link>
                </Stack>
              </Col>
            </Row>
          </MainCard>
        ))
      )}
    </>
  );
}
