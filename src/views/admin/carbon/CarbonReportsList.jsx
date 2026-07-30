import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosServices from 'utils/axios';
import { Row, Col, Card, CardBody, Table, Badge, Button, Spinner } from 'reactstrap';
import MainCard from 'components/MainCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function CarbonReportsList() {
  const navigate = useNavigate();
  const [orgusers, setOrgusers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarbonStatus();
  }, []);

  const fetchCarbonStatus = async () => {
    try {
      setLoading(true);
      const res = await axiosServices.get(`${API_URL}/api/admin/carbon-reports`);
      setOrgusers(res.data.orgusers || []);
    } catch (err) {
      console.error('Error fetching carbon reports list:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDataStatusBadge = (org) => {
    if (org.allDataEntered) return <Badge color="success">All 15 Entered</Badge>;
    if (org.dataEnteredCount > 0) return <Badge color="warning">{org.dataEnteredCount}/15 Entered</Badge>;
    return <Badge color="secondary">No Data</Badge>;
  };

  const getReportBadge = (org) => {
    if (org.reportVisible) {
      return (
        <Badge color="success">
          <i className="ph ph-check-circle me-1" />
          Released
        </Badge>
      );
    }
    return <Badge color="light" className="text-muted">Not Released</Badge>;
  };

  return (
    <>
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <h4 className="mb-1">
              <i className="ph ph-leaf me-2 text-success" />
              Carbon Footprint Reports
            </h4>
            <p className="text-muted mb-0">
              View calculations and release reports to organization users
            </p>
          </Col>
          <Col xs="auto">
            <Button color="outline-secondary" size="sm" onClick={fetchCarbonStatus}>
              <i className="ph ph-arrows-clockwise me-1" /> Refresh
            </Button>
          </Col>
        </Row>
      </MainCard>

      <MainCard className="mt-3">
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2 text-muted">Loading carbon data...</p>
          </div>
        ) : orgusers.length === 0 ? (
          <div className="text-center py-5">
            <i className="ph ph-leaf" style={{ fontSize: 48, color: '#aaa' }} />
            <p className="text-muted mt-2">No organization users found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover bordered className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Organization</th>
                  <th>Contact</th>
                  <th>Data Status</th>
                  <th>Calculated</th>
                  <th>Report Status</th>
                  <th>Released On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orgusers.map((org) => (
                  <tr key={org._id}>
                    <td>
                      <div className="fw-bold">{org.organisationName || <span className="text-muted">Not set</span>}</div>
                      <small className="text-muted">{org.email}</small>
                    </td>
                    <td>{org.contactPerson}</td>
                    <td>{getDataStatusBadge(org)}</td>
                    <td>
                      {org.allCalculated
                        ? <Badge color="success">Yes</Badge>
                        : org.calculatedCount > 0
                        ? <Badge color="warning">{org.calculatedCount}/15</Badge>
                        : <Badge color="light" className="text-muted">No</Badge>
                      }
                    </td>
                    <td>{getReportBadge(org)}</td>
                    <td>
                      {org.reportReleasedAt
                        ? new Date(org.reportReleasedAt).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td>
                      <Button
                        color="primary"
                        size="sm"
                        onClick={() => navigate(`/admin-panel/carbon-reports/${org._id}`)}
                      >
                        <i className="ph ph-eye me-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </MainCard>
    </>
  );
}
