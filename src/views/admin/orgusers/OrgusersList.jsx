import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';
import {
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Button,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input
} from 'reactstrap';
import MainCard from 'components/MainCard';

const OrgusersList = () => {
  const navigate = useNavigate();
  const [orgusers, setOrgusers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    contactPerson: '',
    contactNumber: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchOrgusers();
    fetchStats();
  }, []);

  const fetchOrgusers = async () => {
    try {
      setLoading(true);
      const response = await axiosServices.get(`${API_URL}/api/admin/orgusers`);

      setOrgusers(response.data.orgusers);
    } catch (error) {
      console.error('Error fetching orgusers:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to fetch organization users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosServices.get(`${API_URL}/api/admin/orgusers/stats`);

      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateOrguser = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosServices.post(`${API_URL}/api/admin/orgusers`, formData);

      Swal.fire('Success', response.data.message, 'success');
      setShowCreateModal(false);
      setFormData({ email: '', contactPerson: '', contactNumber: '' });
      fetchOrgusers();
      fetchStats();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to create organization user', 'error');
    }
  };

  const handleGenerateLink = async (orguserId, email) => {
    try {
      const response = await axiosServices.post(
        `${API_URL}/api/admin/orgusers/${orguserId}/generate-link`,
        {}
      );

      const { registrationLink, expiresAt } = response.data;

      Swal.fire({
        title: 'Registration Link Generated',
        html: `
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Link:</strong></p>
          <input type="text" value="${registrationLink}" readonly
            style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;" />
          <p><small>Expires: ${new Date(expiresAt).toLocaleString()}</small></p>
        `,
        confirmButtonText: 'Copy Link',
        showCancelButton: true,
        cancelButtonText: 'Close'
      }).then((result) => {
        if (result.isConfirmed) {
          navigator.clipboard.writeText(registrationLink);
          Swal.fire('Copied!', 'Registration link copied to clipboard', 'success');
        }
      });

      fetchOrgusers(); // Refresh list
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to generate link', 'error');
    }
  };

  const handleDelete = async (orguserId, email) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete organization user: ${email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axiosServices.delete(`${API_URL}/api/admin/orgusers/${orguserId}`);

        Swal.fire('Deleted!', 'Organization user has been deleted.', 'success');
        fetchOrgusers();
        fetchStats();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to delete', 'error');
      }
    }
  };

  const getStatusBadge = (orguser) => {
    if (orguser.isRegistered) {
      return <Badge color="success">Registered</Badge>;
    } else if (orguser.status === 'pending') {
      return <Badge color="warning">Pending</Badge>;
    } else if (orguser.status === 'active') {
      return <Badge color="primary">Active</Badge>;
    } else {
      return <Badge color="secondary">{orguser.status}</Badge>;
    }
  };

  return (
    <>
      <Row>
        <Col xl={12}>
          <MainCard title="Organization Users Management">
            {/* Statistics Cards */}
            {stats && (
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="bg-primary text-white">
                    <CardBody>
                      <h3 className="mb-0">{stats.total}</h3>
                      <p className="mb-0">Total Organizations</p>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-warning text-white">
                    <CardBody>
                      <h3 className="mb-0">{stats.pending}</h3>
                      <p className="mb-0">Pending Registration</p>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-success text-white">
                    <CardBody>
                      <h3 className="mb-0">{stats.registered}</h3>
                      <p className="mb-0">Registered</p>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-info text-white">
                    <CardBody>
                      <h3 className="mb-0">{stats.active}</h3>
                      <p className="mb-0">Active</p>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Create Button */}
            <div className="mb-3">
              <Button color="primary" onClick={() => setShowCreateModal(true)}>
                <i className="ti ti-plus me-2"></i>
                Create New Organization User
              </Button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Contact Person</th>
                    <th>Contact Number</th>
                    <th>Organization</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Report</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orgusers.map((orguser) => (
                    <tr key={orguser._id}>
                      <td>{orguser.email}</td>
                      <td>{orguser.contactPerson}</td>
                      <td>{orguser.contactNumber}</td>
                      <td>{orguser.organisationName || '-'}</td>
                      <td>{getStatusBadge(orguser)}</td>
                      <td>{new Date(orguser.createdAt).toLocaleDateString()}</td>
                      <td>
                        {orguser.reportVisible
                          ? <Badge color="success" pill>Released</Badge>
                          : <Badge color="light" className="text-muted" pill>Pending</Badge>
                        }
                      </td>
                      <td>
                        <Button
                          size="sm"
                          color="primary"
                          className="me-1"
                          onClick={() => navigate(`/admin-panel/carbon-reports/${orguser._id}`)}
                          title="View Carbon Data"
                        >
                          <i className="ti ti-leaf"></i>
                        </Button>
                        {!orguser.isRegistered && (
                          <Button
                            size="sm"
                            color="success"
                            className="me-1"
                            onClick={() => handleGenerateLink(orguser._id, orguser.email)}
                          >
                            <i className="ti ti-link"></i> Generate Link
                          </Button>
                        )}
                        <Button
                          size="sm"
                          color="danger"
                          onClick={() => handleDelete(orguser._id, orguser.email)}
                        >
                          <i className="ti ti-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {orgusers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No organization users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </MainCard>
        </Col>
      </Row>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} toggle={() => setShowCreateModal(false)}>
        <ModalHeader toggle={() => setShowCreateModal(false)}>Create Organization User</ModalHeader>
        <ModalBody>
          <Form onSubmit={handleCreateOrguser}>
            <FormGroup>
              <Label for="email">Email Address *</Label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="contactPerson">Contact Person *</Label>
              <Input
                type="text"
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="contactNumber">Contact Number *</Label>
              <Input
                type="tel"
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                required
              />
            </FormGroup>
            <div className="text-end">
              <Button color="secondary" onClick={() => setShowCreateModal(false)} className="me-2">
                Cancel
              </Button>
              <Button color="primary" type="submit">
                Create
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
};

export default OrgusersList;
