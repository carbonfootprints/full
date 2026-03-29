import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Row, Col, Card, CardBody, Button, Badge, Spinner, Alert } from 'reactstrap';
import MainCard from 'components/MainCard';
import { downloadCarbonReportPDF, downloadCarbonReportExcel } from 'utils/reportGenerator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CarbonReportDownload = () => {
  const navigate = useNavigate();
  const [reportStatus, setReportStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userType = localStorage.getItem('userType');

    if (!user || userType !== 'orguser') {
      navigate('/orguser/login');
      return;
    }

    fetchReportStatus();
  }, [navigate]);

  const fetchReportStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/orguser/report-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportStatus(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/orguser/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/orguser/report-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { orguser, categories, scopeTotals } = res.data;

      const allCats = [
        ...(categories.scope1 || []),
        ...(categories.scope2 || []),
        ...(categories.scope3 || [])
      ].map((c) => ({
        ...c,
        scope: c.code.startsWith('1') ? 1 : c.code === '2' ? 2 : 3
      }));

      if (format === 'pdf') {
        downloadCarbonReportPDF(orguser, allCats, scopeTotals);
      } else {
        downloadCarbonReportExcel(orguser, allCats, scopeTotals);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to download report.';
      Swal.fire('Error', msg, 'error');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-3 text-muted">Loading report status...</p>
      </div>
    );
  }

  return (
    <>
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center gap-3">
            <Button color="outline-secondary" size="sm" onClick={() => navigate('/orguser/dashboard')}>
              <i className="ti ti-arrow-left me-1"></i>
              Back to Dashboard
            </Button>
            <div>
              <h4 className="mb-0">Carbon Footprint Report</h4>
              <p className="text-muted mb-0">
                {JSON.parse(localStorage.getItem('user'))?.organisationName || 'Your Organization'}
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <CardBody className="text-center p-5">
              {reportStatus?.reportVisible ? (
                <>
                  <div className="mb-4">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center bg-success"
                      style={{ width: 80, height: 80 }}
                    >
                      <i className="ti ti-file-check text-white" style={{ fontSize: '2.5rem' }}></i>
                    </div>
                  </div>

                  <h4 className="mb-2">Your Report is Ready!</h4>

                  {reportStatus.reportReleasedAt && (
                    <p className="text-muted mb-4">
                      Released on{' '}
                      {new Date(reportStatus.reportReleasedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  )}

                  <Alert color="success" className="text-start mb-4">
                    <i className="ti ti-info-circle me-2"></i>
                    Your carbon footprint report has been reviewed and released by the administrator. Download your
                    report in PDF or Excel format below.
                  </Alert>

                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                    <Button
                      color="danger"
                      size="lg"
                      onClick={() => handleDownload('pdf')}
                      disabled={downloading}
                      className="d-flex align-items-center justify-content-center gap-2"
                    >
                      {downloading ? (
                        <Spinner size="sm" />
                      ) : (
                        <i className="ti ti-file-type-pdf" style={{ fontSize: '1.25rem' }}></i>
                      )}
                      Download PDF Report
                    </Button>

                    <Button
                      color="success"
                      size="lg"
                      onClick={() => handleDownload('excel')}
                      disabled={downloading}
                      className="d-flex align-items-center justify-content-center gap-2"
                    >
                      {downloading ? (
                        <Spinner size="sm" />
                      ) : (
                        <i className="ti ti-file-spreadsheet" style={{ fontSize: '1.25rem' }}></i>
                      )}
                      Download Excel Report
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center bg-warning"
                      style={{ width: 80, height: 80 }}
                    >
                      <i className="ti ti-clock text-white" style={{ fontSize: '2.5rem' }}></i>
                    </div>
                  </div>

                  <h4 className="mb-2">Awaiting Admin Review</h4>

                  {reportStatus?.allDataEntered ? (
                    <>
                      <Badge color="info" className="mb-3 px-3 py-2">
                        <i className="ti ti-check me-1"></i>
                        All 15 categories submitted
                      </Badge>
                      <p className="text-muted mb-4">
                        Your carbon footprint data has been submitted successfully. The administrator is reviewing your
                        data and will release your report shortly.
                      </p>
                    </>
                  ) : (
                    <>
                      <Badge color="warning" className="mb-3 px-3 py-2">
                        {reportStatus?.dataEnteredCount || 0} / {reportStatus?.totalCategories || 15} categories entered
                      </Badge>
                      <p className="text-muted mb-4">
                        Please complete all {reportStatus?.totalCategories || 15} categories of carbon footprint data
                        before your report can be generated.
                      </p>
                      <Button color="info" onClick={() => navigate('/orguser/carbon-footprint')}>
                        <i className="ti ti-database me-1"></i>
                        Enter Carbon Data
                      </Button>
                    </>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CarbonReportDownload;
