import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Row, Col, Card, CardBody, Button, Badge, Progress, Alert } from 'reactstrap';
import MainCard from 'components/MainCard';

const OrguserDashboard = () => {
  const navigate = useNavigate();
  const [orguser, setOrguser] = useState(null);
  const [organizationDetails, setOrganizationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportStatus, setReportStatus] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userType = localStorage.getItem('userType');

    if (!user || userType !== 'orguser') {
      Swal.fire({
        icon: 'warning',
        title: 'Unauthorized',
        text: 'Please login as an organization user.',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        navigate('/orguser/login');
      });
      return;
    }

    setOrguser(user);
    fetchOrganizationDetails();
    fetchReportStatus();
  }, [navigate]);

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/orguser/organization-details`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrganizationDetails(response.data.organizationDetails);
    } catch (error) {
      console.error('Error fetching organization details:', error);
      if (error.response?.status === 401) {
        Swal.fire('Session Expired', 'Please login again', 'warning').then(() => {
          localStorage.clear();
          navigate('/orguser/login');
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReportStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/orguser/report-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportStatus(res.data);
    } catch {
      // silently ignore
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/orguser/login');
      }
    });
  };

  const calculateProgress = () => {
    if (!organizationDetails) return 0;

    let completedSteps = 0;
    const totalSteps = 3;

    // Step 1: Organization details completed
    if (organizationDetails.isCompleted) completedSteps++;

    // Step 2: Site details filled
    const activeSites = organizationDetails.sites?.filter((site) => site.isActive) || [];
    if (activeSites.length > 0 && activeSites.every((site) => site.address && site.city)) {
      completedSteps++;
    }

    // Step 3: Carbon data entered (placeholder - you'll implement this later)
    // if (orguser?.dataEntered) completedSteps++;

    return Math.round((completedSteps / totalSteps) * 100);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-0">Welcome, {orguser?.contactPerson}!</h3>
              <p className="text-muted mb-0">{orguser?.organisationName || 'Organization Dashboard'}</p>
            </div>
            <Button color="danger" outline onClick={handleLogout}>
              <i className="ti ti-logout me-1"></i>
              Logout
            </Button>
          </div>
        </Col>
      </Row>

      {/* Quick Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="bg-primary text-white">
            <CardBody>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-white mb-1">Total Sites</h6>
                  <h3 className="text-white mb-0">{orguser?.numberOfSites || 0}</h3>
                </div>
                <div>
                  <i className="ti ti-building text-white" style={{ fontSize: '2.5rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-success text-white">
            <CardBody>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-white mb-1">Employees</h6>
                  <h3 className="text-white mb-0">{orguser?.numberOfEmployees || 0}</h3>
                </div>
                <div>
                  <i className="ti ti-users text-white" style={{ fontSize: '2.5rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={3}>
          <Card className={`${organizationDetails?.isCompleted ? 'bg-info' : 'bg-warning'} text-white`}>
            <CardBody>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-white mb-1">Org Profile</h6>
                  <h6 className="text-white mb-0">
                    {organizationDetails?.isCompleted ? (
                      <>
                        <i className="ti ti-check me-1"></i>Complete
                      </>
                    ) : (
                      <>
                        <i className="ti ti-alert-circle me-1"></i>Incomplete
                      </>
                    )}
                  </h6>
                </div>
                <div>
                  <i className="ti ti-file-text text-white" style={{ fontSize: '2.5rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-secondary text-white">
            <CardBody>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-white mb-1">Progress</h6>
                  <h3 className="text-white mb-0">{calculateProgress()}%</h3>
                </div>
                <div>
                  <i className="ti ti-chart-bar text-white" style={{ fontSize: '2.5rem', opacity: 0.5 }}></i>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Overall Progress */}
      <Row className="mb-4">
        <Col>
          <MainCard title="Setup Progress">
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span>Overall Completion</span>
                <span className="fw-bold">{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="progress-lg" />
            </div>
            <p className="text-muted mb-0">
              Complete your organization profile and carbon footprint data to generate reports.
            </p>
          </MainCard>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col md={6}>
          <MainCard>
            <div className="d-flex align-items-start">
              <div className="flex-shrink-0">
                <div className="avatar-md bg-light-primary rounded">
                  <i className="ti ti-building-community text-primary" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h5 className="mb-2">Organization Profile</h5>
                <p className="text-muted mb-3">
                  Complete your organization details including reporting period, responsible person, and industry
                  information.
                </p>
                {organizationDetails?.isCompleted ? (
                  <Badge color="success">
                    <i className="ti ti-check me-1"></i>Completed
                  </Badge>
                ) : (
                  <Link to="/orguser/organization-setup">
                    <Button color="primary" size="sm">
                      <i className="ti ti-pencil me-1"></i>
                      Complete Profile
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </MainCard>
        </Col>

        <Col md={6}>
          <MainCard>
            <div className="d-flex align-items-start">
              <div className="flex-shrink-0">
                <div className="avatar-md bg-light-success rounded">
                  <i className="ti ti-map-pins text-success" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h5 className="mb-2">Manage Sites</h5>
                <p className="text-muted mb-3">
                  View and manage your {orguser?.numberOfSites || 0} site{orguser?.numberOfSites > 1 ? 's' : ''}. Update
                  site details like address, city, state, and pincode.
                </p>
                <Link to="/orguser/sites">
                  <Button color="success" size="sm">
                    <i className="ti ti-settings me-1"></i>
                    Manage Sites
                  </Button>
                </Link>
              </div>
            </div>
          </MainCard>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <MainCard>
            <div className="d-flex align-items-start">
              <div className="flex-shrink-0">
                <div className="avatar-md bg-light-info rounded">
                  <i className="ti ti-plant-2 text-info" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h5 className="mb-2">Carbon Footprint Data Entry</h5>
                <p className="text-muted mb-3">
                  Enter carbon footprint data for each of your sites across all 15 categories. Data can be entered monthly
                  for accurate reporting.
                </p>
                <Link to="/orguser/carbon-footprint">
                  <Button color="info" size="sm">
                    <i className="ti ti-database me-1"></i>
                    Enter Carbon Data
                  </Button>
                </Link>
              </div>
            </div>
          </MainCard>
        </Col>
      </Row>

      {/* Report Status */}
      {reportStatus && (
        <Row className="mt-4">
          <Col>
            {reportStatus.reportVisible ? (
              <Alert color="success" className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-0">
                <div>
                  <i className="ti ti-file-check me-2" style={{ fontSize: '1.25rem' }}></i>
                  <strong>Your Carbon Footprint Report is ready!</strong>
                  {reportStatus.reportReleasedAt && (
                    <span className="ms-2 text-muted" style={{ fontSize: '0.875rem' }}>
                      Released on{' '}
                      {new Date(reportStatus.reportReleasedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                <Link to="/orguser/report">
                  <Button color="success" size="sm">
                    <i className="ti ti-download me-1"></i>
                    View &amp; Download Report
                  </Button>
                </Link>
              </Alert>
            ) : reportStatus.allDataEntered ? (
              <Alert color="info" className="d-flex align-items-center mb-0">
                <i className="ti ti-clock me-2" style={{ fontSize: '1.25rem' }}></i>
                <div>
                  <strong>Data submitted.</strong> Your carbon footprint data is under review. Your report will be
                  available for download once released by the administrator.
                </div>
              </Alert>
            ) : null}
          </Col>
        </Row>
      )}

      {/* Sites Summary */}
      {organizationDetails?.sites && organizationDetails.sites.length > 0 && (
        <Row className="mt-4">
          <Col>
            <MainCard title={`Your Sites (${organizationDetails.sites.length})`}>
              <Row>
                {organizationDetails.sites.map((site, index) => (
                  <Col md={4} key={site._id || index} className="mb-3">
                    <Card>
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0">{site.siteName}</h6>
                          {site.isActive ? (
                            <Badge color="success">Active</Badge>
                          ) : (
                            <Badge color="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-muted mb-1">
                          <small>Code: {site.siteCode}</small>
                        </p>
                        {site.address && (
                          <p className="text-muted mb-0">
                            <small>
                              <i className="ti ti-map-pin me-1"></i>
                              {site.address}
                              {site.city && `, ${site.city}`}
                              {site.state && `, ${site.state}`}
                            </small>
                          </p>
                        )}
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            </MainCard>
          </Col>
        </Row>
      )}
    </>
  );
};

export default OrguserDashboard;
