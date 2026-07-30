import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';
import { Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import MainCard from 'components/MainCard';

const OrganizationSetup = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('organization');
  const [loading, setLoading] = useState(false);
  const [organizationDetails, setOrganizationDetails] = useState(null);
  const [numberOfSites, setNumberOfSites] = useState(0);

  const [formData, setFormData] = useState({
    reportingCompany: '',
    companyRegistrationNumber: '',
    industry: '',
    website: '',
    personResponsibleForReport: '',
    responsiblePersonEmail: '',
    responsiblePersonPhone: '',
    responsiblePersonDesignation: '',
    reportingPeriodFrom: '',
    reportingPeriodTo: '',
    reportingYear: '',
    reportingStandard: '',
    sites: []
  });

  const [errors, setErrors] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Get numberOfSites from user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setNumberOfSites(user.numberOfSites || 0);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchOrganizationDetails();
  }, []);

  const fetchOrganizationDetails = async () => {
    try {
      const response = await axiosServices.get(`${API_URL}/api/orguser/organization-details`);

      const details = response.data.organizationDetails;
      setOrganizationDetails(details);

      // Populate form with existing data
      setFormData({
        reportingCompany: details.reportingCompany || '',
        companyRegistrationNumber: details.companyRegistrationNumber || '',
        industry: details.industry || '',
        website: details.website || '',
        personResponsibleForReport: details.personResponsibleForReport || '',
        responsiblePersonEmail: details.responsiblePersonEmail || '',
        responsiblePersonPhone: details.responsiblePersonPhone || '',
        responsiblePersonDesignation: details.responsiblePersonDesignation || '',
        reportingPeriodFrom: details.reportingPeriodFrom ? details.reportingPeriodFrom.split('T')[0] : '',
        reportingPeriodTo: details.reportingPeriodTo ? details.reportingPeriodTo.split('T')[0] : '',
        reportingYear: details.reportingYear || '',
        reportingStandard: details.reportingStandard || '',
        sites: details.sites || []
      });
    } catch (error) {
      console.error('Error fetching organization details:', error);
      Swal.fire('Error', 'Failed to load organization details', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    setErrors({ ...errors, [name]: '' });
  };

  const handleSiteChange = (index, field, value) => {
    const updatedSites = [...formData.sites];
    updatedSites[index] = { ...updatedSites[index], [field]: value };
    setFormData({ ...formData, sites: updatedSites });
  };

  const validateOrganization = () => {
    const newErrors = {};

    if (!formData.reportingCompany) newErrors.reportingCompany = 'Reporting company is required';
    if (!formData.industry) newErrors.industry = 'Industry is required';
    if (!formData.personResponsibleForReport) newErrors.personResponsibleForReport = 'Person responsible is required';
    if (!formData.responsiblePersonEmail) {
      newErrors.responsiblePersonEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.responsiblePersonEmail)) {
      newErrors.responsiblePersonEmail = 'Email is invalid';
    }
    if (!formData.reportingPeriodFrom) newErrors.reportingPeriodFrom = 'Reporting period start is required';
    if (!formData.reportingPeriodTo) newErrors.reportingPeriodTo = 'Reporting period end is required';
    if (!formData.reportingStandard) newErrors.reportingStandard = 'Reporting standard is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSites = () => {
    const newErrors = {};
    let hasError = false;

    formData.sites.forEach((site, index) => {
      if (!site.siteName) {
        newErrors[`site_${index}_siteName`] = 'Site name is required';
        hasError = true;
      }
      if (!site.address) {
        newErrors[`site_${index}_address`] = 'Address is required';
        hasError = true;
      }
      if (!site.city) {
        newErrors[`site_${index}_city`] = 'City is required';
        hasError = true;
      }
      if (!site.state) {
        newErrors[`site_${index}_state`] = 'State is required';
        hasError = true;
      }
      if (!site.pincode) {
        newErrors[`site_${index}_pincode`] = 'Pincode is required';
        hasError = true;
      }
    });

    setErrors(newErrors);
    return !hasError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate based on active tab
    let isValid = false;
    if (activeTab === 'organization') {
      isValid = validateOrganization();
    } else if (activeTab === 'sites') {
      isValid = validateSites();

      // Additional validation: Check if number of sites matches the allowed count
      if (isValid && formData.sites.length !== numberOfSites) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Site Count',
          text: `You must have exactly ${numberOfSites} site${numberOfSites !== 1 ? 's' : ''}. Currently you have ${formData.sites.length}. Please contact support if you need to change the number of sites.`
        });
        setLoading(false);
        return;
      }
    }

    if (!isValid) {
      Swal.fire('Validation Error', 'Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await axiosServices.put(`${API_URL}/api/orguser/organization-details`, formData);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: response.data.message || 'Organization details updated successfully',
        confirmButtonText: 'OK'
      }).then(() => {
        // Refresh data
        fetchOrganizationDetails();

        // If all tabs completed, go to dashboard
        if (activeTab === 'sites') {
          navigate('/orguser/dashboard');
        }
      });
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to update organization details', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Row className="mb-4">
        <Col>
          <h3>Organization Setup</h3>
          <p className="text-muted">Complete your organization profile and site information</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <MainCard>
            {/* Tabs */}
            <Nav tabs className="mb-4">
              <NavItem>
                <NavLink
                  className={activeTab === 'organization' ? 'active' : ''}
                  onClick={() => setActiveTab('organization')}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="ti ti-building me-2"></i>
                  Organization Details
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === 'sites' ? 'active' : ''}
                  onClick={() => setActiveTab('sites')}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="ti ti-map-pins me-2"></i>
                  Sites Information
                </NavLink>
              </NavItem>
            </Nav>

            {/* Tab Content */}
            <TabContent activeTab={activeTab}>
              {/* Organization Details Tab */}
              <TabPane tabId="organization">
                <Form onSubmit={handleSubmit}>
                  <h5 className="mb-3">Company Information</h5>
                  <Row>
                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label for="reportingCompany">Reporting Company *</Label>
                        <Input
                          type="text"
                          id="reportingCompany"
                          name="reportingCompany"
                          value={formData.reportingCompany}
                          onChange={handleInputChange}
                          invalid={!!errors.reportingCompany}
                        />
                        {errors.reportingCompany && <div className="invalid-feedback d-block">{errors.reportingCompany}</div>}
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="companyRegistrationNumber">Company Registration Number</Label>
                        <Input
                          type="text"
                          id="companyRegistrationNumber"
                          name="companyRegistrationNumber"
                          value={formData.companyRegistrationNumber}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="industry">Industry *</Label>
                        <Input
                          type="text"
                          id="industry"
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          invalid={!!errors.industry}
                          placeholder="e.g., Manufacturing, IT, Healthcare"
                        />
                        {errors.industry && <div className="invalid-feedback d-block">{errors.industry}</div>}
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="website">Website</Label>
                        <Input
                          type="url"
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="https://example.com"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <h5 className="mb-3 mt-4">Responsible Person</h5>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="personResponsibleForReport">Person Responsible for Report *</Label>
                        <Input
                          type="text"
                          id="personResponsibleForReport"
                          name="personResponsibleForReport"
                          value={formData.personResponsibleForReport}
                          onChange={handleInputChange}
                          invalid={!!errors.personResponsibleForReport}
                        />
                        {errors.personResponsibleForReport && (
                          <div className="invalid-feedback d-block">{errors.personResponsibleForReport}</div>
                        )}
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="responsiblePersonDesignation">Designation</Label>
                        <Input
                          type="text"
                          id="responsiblePersonDesignation"
                          name="responsiblePersonDesignation"
                          value={formData.responsiblePersonDesignation}
                          onChange={handleInputChange}
                          placeholder="e.g., Sustainability Manager"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="responsiblePersonEmail">Email *</Label>
                        <Input
                          type="email"
                          id="responsiblePersonEmail"
                          name="responsiblePersonEmail"
                          value={formData.responsiblePersonEmail}
                          onChange={handleInputChange}
                          invalid={!!errors.responsiblePersonEmail}
                        />
                        {errors.responsiblePersonEmail && (
                          <div className="invalid-feedback d-block">{errors.responsiblePersonEmail}</div>
                        )}
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="responsiblePersonPhone">Phone</Label>
                        <Input
                          type="tel"
                          id="responsiblePersonPhone"
                          name="responsiblePersonPhone"
                          value={formData.responsiblePersonPhone}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <h5 className="mb-3 mt-4">Reporting Period</h5>
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label for="reportingPeriodFrom">Period From *</Label>
                        <Input
                          type="date"
                          id="reportingPeriodFrom"
                          name="reportingPeriodFrom"
                          value={formData.reportingPeriodFrom}
                          onChange={handleInputChange}
                          invalid={!!errors.reportingPeriodFrom}
                        />
                        {errors.reportingPeriodFrom && (
                          <div className="invalid-feedback d-block">{errors.reportingPeriodFrom}</div>
                        )}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for="reportingPeriodTo">Period To *</Label>
                        <Input
                          type="date"
                          id="reportingPeriodTo"
                          name="reportingPeriodTo"
                          value={formData.reportingPeriodTo}
                          onChange={handleInputChange}
                          invalid={!!errors.reportingPeriodTo}
                        />
                        {errors.reportingPeriodTo && <div className="invalid-feedback d-block">{errors.reportingPeriodTo}</div>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for="reportingYear">Reporting Year</Label>
                        <Input
                          type="text"
                          id="reportingYear"
                          name="reportingYear"
                          value={formData.reportingYear}
                          onChange={handleInputChange}
                          placeholder="e.g., 2024-2025"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="reportingStandard">Reporting Standard *</Label>
                        <Input
                          type="select"
                          id="reportingStandard"
                          name="reportingStandard"
                          value={formData.reportingStandard}
                          onChange={handleInputChange}
                          invalid={!!errors.reportingStandard}
                        >
                          <option value="">Select Standard</option>
                          <option value="GHG Protocol">GHG Protocol</option>
                          <option value="ISO 14064">ISO 14064</option>
                          <option value="CDP">CDP</option>
                          <option value="TCFD">TCFD</option>
                          <option value="Other">Other</option>
                        </Input>
                        {errors.reportingStandard && <div className="invalid-feedback d-block">{errors.reportingStandard}</div>}
                      </FormGroup>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <Button color="secondary" outline onClick={() => navigate('/orguser/dashboard')}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Organization Details'}
                    </Button>
                  </div>
                </Form>
              </TabPane>

              {/* Sites Information Tab */}
              <TabPane tabId="sites">
                <Form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>Sites Information</h5>
                        <p className="text-muted mb-0">Update details for each of your sites</p>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                          <i className="ti ti-building me-2"></i>
                          {formData.sites.length} of {numberOfSites} Sites
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Information Alert */}
                  <div className="alert alert-info mb-4">
                    <div className="d-flex align-items-start">
                      <i className="ti ti-info-circle me-2" style={{ fontSize: '1.25rem', marginTop: '0.125rem' }}></i>
                      <div>
                        <strong>Site Management Policy</strong>
                        <p className="mb-0 mt-1">
                          You specified <strong>{numberOfSites} site{numberOfSites !== 1 ? 's' : ''}</strong> during
                          registration. These sites were automatically created for you. You can update the details for each
                          site below, but you cannot add or remove sites. If you need to change the number of sites, please
                          contact support.
                        </p>
                      </div>
                    </div>
                  </div>

                  {formData.sites.map((site, index) => (
                    <Card key={site._id || index} className="mb-4">
                      <CardBody>
                        <h6 className="mb-3">
                          <i className="ti ti-map-pin me-2"></i>
                          {site.siteName} ({site.siteCode})
                        </h6>

                        <Row>
                          <Col md={6}>
                            <FormGroup>
                              <Label for={`siteName_${index}`}>Site Name *</Label>
                              <Input
                                type="text"
                                id={`siteName_${index}`}
                                value={site.siteName}
                                onChange={(e) => handleSiteChange(index, 'siteName', e.target.value)}
                                invalid={!!errors[`site_${index}_siteName`]}
                              />
                              {errors[`site_${index}_siteName`] && (
                                <div className="invalid-feedback d-block">{errors[`site_${index}_siteName`]}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md={6}>
                            <FormGroup>
                              <Label for={`siteCode_${index}`}>Site Code</Label>
                              <Input
                                type="text"
                                id={`siteCode_${index}`}
                                value={site.siteCode}
                                onChange={(e) => handleSiteChange(index, 'siteCode', e.target.value)}
                                readOnly
                              />
                            </FormGroup>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={12}>
                            <FormGroup>
                              <Label for={`address_${index}`}>Address *</Label>
                              <Input
                                type="textarea"
                                id={`address_${index}`}
                                value={site.address}
                                onChange={(e) => handleSiteChange(index, 'address', e.target.value)}
                                rows="2"
                                invalid={!!errors[`site_${index}_address`]}
                              />
                              {errors[`site_${index}_address`] && (
                                <div className="invalid-feedback d-block">{errors[`site_${index}_address`]}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={4}>
                            <FormGroup>
                              <Label for={`city_${index}`}>City *</Label>
                              <Input
                                type="text"
                                id={`city_${index}`}
                                value={site.city}
                                onChange={(e) => handleSiteChange(index, 'city', e.target.value)}
                                invalid={!!errors[`site_${index}_city`]}
                              />
                              {errors[`site_${index}_city`] && (
                                <div className="invalid-feedback d-block">{errors[`site_${index}_city`]}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md={4}>
                            <FormGroup>
                              <Label for={`state_${index}`}>State *</Label>
                              <Input
                                type="text"
                                id={`state_${index}`}
                                value={site.state}
                                onChange={(e) => handleSiteChange(index, 'state', e.target.value)}
                                invalid={!!errors[`site_${index}_state`]}
                              />
                              {errors[`site_${index}_state`] && (
                                <div className="invalid-feedback d-block">{errors[`site_${index}_state`]}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md={4}>
                            <FormGroup>
                              <Label for={`pincode_${index}`}>Pincode *</Label>
                              <Input
                                type="text"
                                id={`pincode_${index}`}
                                value={site.pincode}
                                onChange={(e) => handleSiteChange(index, 'pincode', e.target.value)}
                                invalid={!!errors[`site_${index}_pincode`]}
                              />
                              {errors[`site_${index}_pincode`] && (
                                <div className="invalid-feedback d-block">{errors[`site_${index}_pincode`]}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <FormGroup>
                              <Label for={`country_${index}`}>Country</Label>
                              <Input
                                type="text"
                                id={`country_${index}`}
                                value={site.country}
                                onChange={(e) => handleSiteChange(index, 'country', e.target.value)}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  ))}

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <Button color="secondary" outline onClick={() => navigate('/orguser/dashboard')}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Sites Information'}
                    </Button>
                  </div>
                </Form>
              </TabPane>
            </TabContent>
          </MainCard>
        </Col>
      </Row>
    </>
  );
};

export default OrganizationSetup;
