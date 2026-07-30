import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';
import { Row, Col, Nav, NavItem, NavLink, TabContent, TabPane, Badge } from 'reactstrap';
import MainCard from 'components/MainCard';

// Import the CategoryWizard
import CategoryWizard from 'sections/calculator/carbon-footprint/CategoryWizard';

const CarbonFootprintData = () => {
  const navigate = useNavigate();
  const [organizationDetails, setOrganizationDetails] = useState(null);
  const [activeSiteIndex, setActiveSiteIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Calculate active sites and selected site (must be before hooks)
  const activeSites = organizationDetails?.sites?.filter((site) => site.isActive) || [];
  const selectedSite = activeSites[activeSiteIndex];

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    fetchOrganizationDetails();
  }, []);

  // Store selected site info in localStorage whenever the active site changes
  useEffect(() => {
    if (selectedSite) {
      localStorage.setItem('currentSiteId', selectedSite._id);
      localStorage.setItem('currentSiteName', selectedSite.siteName);
      localStorage.setItem('currentSiteCode', selectedSite.siteCode);
    }
  }, [selectedSite, activeSiteIndex]);

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosServices.get(`${API_URL}/api/orguser/organization-details`);

      const details = response.data.organizationDetails;
      setOrganizationDetails(details);

      // Check if organization details are complete
      if (!details.isCompleted) {
        Swal.fire({
          icon: 'warning',
          title: 'Complete Organization Profile',
          text: 'Please complete your organization profile before entering carbon footprint data.',
          confirmButtonText: 'Go to Profile'
        }).then(() => {
          navigate('/orguser/organization-setup');
        });
        return;
      }

      // Check if sites have addresses
      const incompleteSites = details.sites?.filter((site) => !site.address || !site.city);
      if (incompleteSites && incompleteSites.length > 0) {
        Swal.fire({
          icon: 'info',
          title: 'Update Site Details',
          text: 'Some sites are missing address information. Please update site details for accurate carbon footprint calculation.',
          showCancelButton: true,
          confirmButtonText: 'Update Sites',
          cancelButtonText: 'Continue Anyway'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/orguser/organization-setup?tab=sites');
          }
        });
      }
    } catch (error) {
      console.error('Error fetching organization details:', error);
      Swal.fire('Error', 'Failed to load organization details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // CONDITIONAL RETURNS AFTER ALL HOOKS
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading sites...</p>
      </div>
    );
  }

  if (!organizationDetails || !organizationDetails.sites || organizationDetails.sites.length === 0) {
    return (
      <MainCard>
        <div className="text-center py-5">
          <i className="ti ti-alert-circle text-warning" style={{ fontSize: '3rem' }}></i>
          <h5 className="mt-3">No Sites Found</h5>
          <p className="text-muted">
            Please complete your organization setup to create sites for carbon footprint data entry.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/orguser/organization-setup')}>
            Go to Organization Setup
          </button>
        </div>
      </MainCard>
    );
  }

  return (
    <>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h3>Carbon Footprint Data Entry</h3>
          <p className="text-muted">
            Enter carbon footprint data for each site across all categories. Data is saved per site for accurate
            reporting.
          </p>
        </Col>
      </Row>

      {/* Site Selector Tabs */}
      <Row className="mb-4">
        <Col>
          <MainCard>
            <div className="mb-3">
              <h5>
                <i className="ti ti-building me-2"></i>
                Select Site
              </h5>
              <p className="text-muted mb-0">Choose a site to enter or view carbon footprint data</p>
            </div>

            <Nav tabs className="mb-0">
              {activeSites.map((site, index) => (
                <NavItem key={site._id || index}>
                  <NavLink
                    className={activeSiteIndex === index ? 'active' : ''}
                    onClick={() => setActiveSiteIndex(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center">
                      <i className="ti ti-map-pin me-2"></i>
                      <div>
                        <strong>{site.siteName}</strong>
                        {site.siteCode && (
                          <div>
                            <small className="text-muted">{site.siteCode}</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </MainCard>
        </Col>
      </Row>

      {/* Selected Site Info */}
      <Row className="mb-4">
        <Col>
          <MainCard>
            <Row className="align-items-center">
              <Col md={8}>
                <h5 className="mb-2">
                  <i className="ti ti-building-community text-primary me-2"></i>
                  {selectedSite?.siteName}
                </h5>
                {selectedSite?.address && (
                  <p className="text-muted mb-0">
                    <i className="ti ti-map-pin me-2"></i>
                    {selectedSite.address}
                    {selectedSite.city && `, ${selectedSite.city}`}
                    {selectedSite.state && `, ${selectedSite.state}`}
                    {selectedSite.pincode && ` - ${selectedSite.pincode}`}
                  </p>
                )}
              </Col>
              <Col md={4} className="text-end">
                <Badge color="primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                  Site Code: {selectedSite?.siteCode || 'N/A'}
                </Badge>
              </Col>
            </Row>
          </MainCard>
        </Col>
      </Row>

      {/* Tab Content - Category Wizard for Selected Site */}
      <TabContent activeTab={activeSiteIndex}>
        {activeSites.map((site, index) => (
          <TabPane key={site._id || index} tabId={index}>
            {activeSiteIndex === index && (
              <>
                {/* Category Wizard - Shows all categories for the selected site */}
                <CategoryWizard />

                {/* Helper Text */}
                <Row className="mt-4">
                  <Col>
                    <MainCard>
                      <div className="alert alert-info mb-0">
                        <h6 className="alert-heading">
                          <i className="ti ti-info-circle me-2"></i>
                          Data Entry Instructions
                        </h6>
                        <ul className="mb-0 mt-2">
                          <li>Click on any category card to enter monthly data for this site</li>
                          <li>Data is automatically saved per site - switch between sites using the tabs above</li>
                          <li>Complete all categories for all sites to generate comprehensive carbon footprint reports</li>
                          <li>
                            You can edit previously entered data by clicking on completed categories (marked with a green
                            badge)
                          </li>
                        </ul>
                      </div>
                    </MainCard>
                  </Col>
                </Row>
              </>
            )}
          </TabPane>
        ))}
      </TabContent>
    </>
  );
};

export default CarbonFootprintData;
