import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import avatar1 from 'assets/images/user/avatar-1.png';
import Stack from 'react-bootstrap/Stack';
import Swal from 'sweetalert2';

function AllUser() {
  const navigate = useNavigate();
  const [Users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch users
      const usersRes = await axios.get(`${API_URL}/api/admin/orgusers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch statistics
      const statsRes = await axios.get(`${API_URL}/api/admin/orgusers/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(usersRes.data.orgusers || []);
      setStats(statsRes.data.stats || null);
    } catch (err) {
      console.error('Error fetching users:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to fetch organization users',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGenerateLink = async (user) => {
    try {
      const confirm = await Swal.fire({
        title: 'Generate Registration Link?',
        text: `Generate a registration link for ${user.email}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Generate',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d'
      });

      if (!confirm.isConfirmed) return;

      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/admin/orgusers/${user._id}/generate-link`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { registrationLink, expiresAt } = res.data;

      Swal.fire({
        title: 'Registration Link Generated',
        html: `
          <div style="margin-bottom: 15px;">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Contact Person:</strong> ${user.contactPerson}</p>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Registration Link:</label>
            <input
              id="linkInput"
              type="text"
              value="${registrationLink}"
              readonly
              style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;"
            />
            <p style="font-size: 12px; color: #666;">
              <strong>Expires:</strong> ${new Date(expiresAt).toLocaleString()}
            </p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'Copy Link',
        showCancelButton: true,
        cancelButtonText: 'Close',
        confirmButtonColor: '#28a745',
        didOpen: () => {
          const linkInput = document.getElementById('linkInput');
          linkInput.addEventListener('click', () => {
            linkInput.select();
          });
        },
        preConfirm: () => {
          navigator.clipboard.writeText(registrationLink);
          return true;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'Registration link copied to clipboard',
            timer: 2000,
            showConfirmButton: false
          });
        }
      });

      // Refresh list to update status
      fetchUsers();
    } catch (error) {
      console.error('Error generating link', error);

      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to generate link. Try again!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDelete = async (user) => {
    try {
      const confirm = await Swal.fire({
        title: 'Delete Organization User?',
        text: `Delete ${user.email}? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
      });

      if (!confirm.isConfirmed) return;

      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/admin/orgusers/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Organization user has been deleted',
        timer: 2000,
        showConfirmButton: false
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user', error);

      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete user. Try again!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const getStatusBadge = (user) => {
    if (user.isRegistered) {
      return <Badge bg="success">Registered</Badge>;
    } else if (user.status === 'pending') {
      return <Badge bg="warning">Pending</Badge>;
    } else if (user.status === 'active') {
      return <Badge bg="primary">Active</Badge>;
    } else {
      return <Badge bg="secondary">{user.status}</Badge>;
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {/* Statistics Cards */}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="bg-primary text-white">
              <Card.Body>
                <h3 className="mb-0">{stats.total}</h3>
                <p className="mb-0">Total Organizations</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="bg-warning text-white">
              <Card.Body>
                <h3 className="mb-0">{stats.pending}</h3>
                <p className="mb-0">Pending Registration</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="bg-success text-white">
              <Card.Body>
                <h3 className="mb-0">{stats.registered}</h3>
                <p className="mb-0">Registered</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="bg-info text-white">
              <Card.Body>
                <h3 className="mb-0">{stats.active}</h3>
                <p className="mb-0">Active</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Users Table */}
      <Row>
        <Col lg={12}>
          <Card className="user-profile-list">
            <Card.Body className="p-0">
              <div className="dt-responsive">
                <Table responsive hover className="nowrap">
                  <thead>
                    <tr>
                      <th>Email / Contact Person</th>
                      <th>Contact Number</th>
                      <th>Organisation Name</th>
                      <th>Employees</th>
                      <th>Sites</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Carbon Report</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Users.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
                          No organization users found. Create one to get started.
                        </td>
                      </tr>
                    ) : (
                      Users.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <Stack direction="horizontal" className="align-items-center">
                              <Image src={avatar1} roundedCircle width={40} className="me-2" />
                              <div>
                                <h6 className="mb-0">{user.email}</h6>
                                <p className="mb-0 text-muted small">{user.contactPerson}</p>
                              </div>
                            </Stack>
                          </td>
                          <td>{user.contactNumber}</td>
                          <td>{user.organisationName || '-'}</td>
                          <td>{user.numberOfEmployees || '-'}</td>
                          <td>{user.numberOfSites || '-'}</td>
                          <td>{getStatusBadge(user)}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/admin-panel/carbon-reports/${user._id}`)}
                              title="View Carbon Data"
                            >
                              <i className="ph ph-leaf me-1" />
                              View Carbon Data
                            </Button>
                          </td>
                          <td>
                            <Stack direction="horizontal" gap={2}>
                              {!user.isRegistered && (
                                <Button variant="outline-success" size="sm" onClick={() => handleGenerateLink(user)}>
                                  <i className="ph ph-link me-1" />
                                  Generate Link
                                </Button>
                              )}
                              <Button variant="outline-danger" size="sm" onClick={() => handleDelete(user)}>
                                <i className="ph ph-trash" />
                              </Button>
                            </Stack>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default AllUser;
