import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';

// react-bootstrap
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

// project-imports
import MainCard from 'components/MainCard';

// CEA India Grid emission factor (CO₂ Baseline Database, Version 20 December 2024)
const ELECTRICITY_EF = 0.727; // kg CO₂/kWh

const MONTHS = [
  'Apr-24', 'May-24', 'Jun-24', 'Jul-24', 'Aug-24', 'Sep-24',
  'Oct-24', 'Nov-24', 'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25'
];

function makeSite(name = '') {
  return {
    siteName: name,
    monthlyData: MONTHS.map(month => ({ month, kWh: '' })),
  };
}

function calcLive(sites) {
  const totalKWh = sites.reduce((siteSum, site) =>
    siteSum + site.monthlyData.reduce((s, r) => s + (parseFloat(r.kWh) || 0), 0), 0);
  return {
    totalKWh,
    co2e: totalKWh * ELECTRICITY_EF,
  };
}

// ==============================|| CATEGORY 5.1 FORM ||============================== //

export default function Category5_1Form() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const [sites, setSites] = useState([makeSite('')]);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(false);

  const live = calcLive(sites);

  useEffect(() => {
    fetchExisting();
  }, []);

  const fetchExisting = async () => {
    try {
      const res = await axiosServices.get(`${apiUrl}/api/carbon/category/5.1`);
      if (res.data?.category?.sites?.length) {
        const loaded = res.data.category.sites.map(site => ({
          siteName: site.siteName || '',
          monthlyData: MONTHS.map(month => {
            const found = (site.monthlyData || []).find(e => e.month === month);
            return { month, kWh: found ? found.kWh ?? '' : '' };
          }),
        }));
        setSites(loaded);
        setExisting(true);
      }
    } catch {
      // no existing data — defaults are fine
    }
  };

  const addSite = () => setSites(s => [...s, makeSite(`Customer ${s.length + 1}`)]);
  const removeSite = (idx) => setSites(s => s.filter((_, i) => i !== idx));
  const updateSiteName = (idx, value) =>
    setSites(s => s.map((site, i) => i === idx ? { ...site, siteName: value } : site));
  const updateMonthlyData = (siteIdx, monthIdx, value) =>
    setSites(s => s.map((site, i) => {
      if (i !== siteIdx) return site;
      const monthlyData = site.monthlyData.map((row, j) =>
        j === monthIdx ? { ...row, kWh: value } : row
      );
      return { ...site, monthlyData };
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        sites: sites.map(site => ({
          siteName: site.siteName,
          monthlyData: site.monthlyData
            .filter(r => parseFloat(r.kWh) > 0)
            .map(r => ({ month: r.month, kWh: parseFloat(r.kWh) || 0 })),
        })),
      };

      await axiosServices.post(`${apiUrl}/api/carbon/category/5.1`, payload);

      await Swal.fire({
        icon: 'success',
        title: 'Data Saved',
        text: `Category 5.1 data saved. Total electricity: ${live.totalKWh.toFixed(0)} kWh, CO₂: ${live.co2e.toFixed(2)} kg`,
        confirmButtonText: 'OK',
      });

      setExisting(true);
      navigate('/calculate/carbon-footprint');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err?.response?.data?.message || 'An error occurred.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Clear Data?',
      text: 'This will permanently delete all Category 5.1 data.',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      confirmButtonColor: '#d33',
    });
    if (!result.isConfirmed) return;

    try {
      await axiosServices.delete(`${apiUrl}/api/carbon/category/5.1`);
      setSites([makeSite('')]);
      setExisting(false);
      Swal.fire({ icon: 'success', title: 'Cleared', text: 'Category 5.1 data removed.' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete data.' });
    }
  };

  return (
    <>
      {/* Header */}
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center gap-3">
              <Button variant="outline-secondary" size="sm" onClick={() => navigate('/calculate/carbon-footprint')}>
                <i className="ph ph-arrow-left me-1" />
                Back
              </Button>
              <div>
                <h4 className="mb-1">Category 5.1 — Indirect GHG from Use of Products: Purchased Energy</h4>
                <p className="text-muted mb-0 small">
                  Electricity used in leather upholstery manufacturing by customers &nbsp;·&nbsp;
                  CEA EF: {ELECTRICITY_EF} kg CO₂/kWh
                </p>
              </div>
            </div>
          </Col>
          <Col xs="auto">
            {existing && <Badge bg="success" className="me-2"><i className="ph ph-check me-1" />Data Saved</Badge>}
            <Badge bg="warning" text="dark">Scope 5</Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Live Summary */}
      <MainCard className="mt-3">
        <Row className="text-center g-3">
          <Col md={4}>
            <div className="bg-light-warning rounded p-3">
              <h5 className="mb-1 text-warning">{live.totalKWh.toFixed(2)} kWh</h5>
              <small className="text-muted">Total Electricity (all customers)</small>
            </div>
          </Col>
          <Col md={4}>
            <div className="bg-light-info rounded p-3">
              <h5 className="mb-1 text-info">{ELECTRICITY_EF} kg CO₂/kWh</h5>
              <small className="text-muted">CEA Emission Factor</small>
            </div>
          </Col>
          <Col md={4}>
            <div className="bg-light-success rounded p-3">
              <h5 className="mb-1 text-success">{live.co2e.toFixed(4)} kg CO₂</h5>
              <small className="text-muted">Total Emissions</small>
            </div>
          </Col>
        </Row>
        <Alert variant="secondary" className="mt-3 mb-0 py-2 small">
          <strong>Formula:</strong> Electricity (kWh) × {ELECTRICITY_EF} kg CO₂/kWh
          &nbsp;·&nbsp; EF source: CO₂ Baseline Database for the Indian Power Sector, Version 20 December 2024 (CEA).
          &nbsp;·&nbsp; CSV check: 27,602 kWh × 0.727 = 20,067 kgCO₂.
        </Alert>
      </MainCard>

      {/* Per-customer tables */}
      {sites.map((site, siteIdx) => {
        const siteKWh  = site.monthlyData.reduce((s, r) => s + (parseFloat(r.kWh) || 0), 0);
        const siteCO2e = siteKWh * ELECTRICITY_EF;
        return (
          <Card className="mt-3" key={siteIdx}>
            <Card.Header>
              <Row className="align-items-center">
                <Col>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <i className="ph ph-lightning text-warning" />
                    <Form.Control
                      size="sm"
                      style={{ maxWidth: 280 }}
                      value={site.siteName}
                      onChange={e => updateSiteName(siteIdx, e.target.value)}
                      placeholder="Customer / location name"
                    />
                    <Badge bg="warning" text="dark">{siteKWh.toFixed(2)} kWh</Badge>
                    <Badge bg="success">{siteCO2e.toFixed(4)} kg CO₂</Badge>
                  </div>
                </Col>
                <Col xs="auto">
                  {sites.length > 1 && (
                    <Button variant="outline-danger" size="sm" onClick={() => removeSite(siteIdx)}>
                      <i className="ph ph-trash me-1" />Remove
                    </Button>
                  )}
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table bordered hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 90 }}>Month</th>
                      <th>Electricity Consumed (kWh)</th>
                      <th className="text-end">CO₂ (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {site.monthlyData.map((row, monthIdx) => {
                      const kWh = parseFloat(row.kWh) || 0;
                      const co2 = kWh * ELECTRICITY_EF;
                      return (
                        <tr key={monthIdx}>
                          <td className="fw-semibold text-nowrap">{row.month}</td>
                          <td>
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.kWh}
                              onChange={e => updateMonthlyData(siteIdx, monthIdx, e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td className="text-muted small text-end">{co2.toFixed(4)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="table-secondary fw-semibold">
                      <td>Total</td>
                      <td>{siteKWh.toFixed(3)} kWh</td>
                      <td className="text-end">{siteCO2e.toFixed(4)} kg CO₂</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>
        );
      })}

      {/* Add Customer */}
      <div className="mt-3">
        <Button variant="outline-secondary" onClick={addSite}>
          <i className="ph ph-plus me-1" />
          Add Customer / Location
        </Button>
      </div>

      {/* Actions */}
      <Card className="mt-3">
        <Card.Body>
          <div className="d-flex gap-3 justify-content-end">
            {existing && (
              <Button variant="outline-danger" onClick={handleClear}>
                <i className="ph ph-trash me-1" />Clear Data
              </Button>
            )}
            <Button variant="outline-secondary" onClick={() => navigate('/calculate/carbon-footprint')}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
              ) : (
                <><i className="ph ph-floppy-disk me-1" />{existing ? 'Update' : 'Save'} Data</>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
