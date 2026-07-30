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

// CEA India grid emission factor
const ELECTRICITY_EF = 0.727; // kg CO2e / kWh

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

// ==============================|| CATEGORY 4 FORM ||============================== //

export default function Category4Form() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const [sites, setSites] = useState([makeSite('Site 1')]);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(false);

  const live = calcLive(sites);

  useEffect(() => {
    fetchExisting();
  }, []);

  const fetchExisting = async () => {
    try {
      const res = await axiosServices.get(`${apiUrl}/api/carbon/category/4`);
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

  // ── Site handlers ────────────────────────────────────────────────────────────
  const addSite = () => setSites(s => [...s, makeSite(`Site ${s.length + 1}`)]);

  const removeSite = (siteIdx) => {
    setSites(s => s.filter((_, i) => i !== siteIdx));
  };

  const updateSiteName = (siteIdx, value) => {
    setSites(s => s.map((site, i) => i === siteIdx ? { ...site, siteName: value } : site));
  };

  const updateMonthlyData = (siteIdx, monthIdx, value) => {
    setSites(s => s.map((site, i) => {
      if (i !== siteIdx) return site;
      const monthlyData = site.monthlyData.map((row, j) =>
        j === monthIdx ? { ...row, kWh: value } : row
      );
      return { ...site, monthlyData };
    }));
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
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

      await axiosServices.post(`${apiUrl}/api/carbon/category/4`, payload);

      await Swal.fire({
        icon: 'success',
        title: 'Data Saved',
        text: `Category 4 job work electricity data saved. CO₂e: ${live.co2e.toFixed(4)} kg`,
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

  // ── Clear ────────────────────────────────────────────────────────────────────
  const handleClear = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Clear Data?',
      text: 'This will permanently delete all Category 4 job work electricity data.',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      confirmButtonColor: '#d33',
    });
    if (!result.isConfirmed) return;

    try {
      await axiosServices.delete(`${apiUrl}/api/carbon/category/4`);
      setSites([makeSite('Site 1')]);
      setExisting(false);
      Swal.fire({ icon: 'success', title: 'Cleared', text: 'Category 4 data removed.' });
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
                <h4 className="mb-1">Category 4 — Job Work (Outsourced Electricity)</h4>
                <p className="text-muted mb-0 small">
                  CEA India Grid EF: {ELECTRICITY_EF} kg CO₂e/kWh &nbsp;·&nbsp; Formula: total kWh × {ELECTRICITY_EF}
                </p>
              </div>
            </div>
          </Col>
          <Col xs="auto">
            {existing && <Badge bg="success" className="me-2"><i className="ph ph-check me-1" />Data Saved</Badge>}
            <Badge bg="info">Scope 4</Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Live CO2e Summary */}
      <MainCard className="mt-3">
        <Row className="text-center g-3">
          <Col md={4}>
            <div className="bg-light-primary rounded p-3">
              <h5 className="mb-1 text-primary">{live.totalKWh.toFixed(2)} kWh</h5>
              <small className="text-muted">Total Electricity (all sites)</small>
            </div>
          </Col>
          <Col md={4}>
            <div className="bg-light-warning rounded p-3">
              <h5 className="mb-1 text-warning">{ELECTRICITY_EF} kg CO₂e/kWh</h5>
              <small className="text-muted">Emission Factor (CEA India)</small>
            </div>
          </Col>
          <Col md={4}>
            <div className="bg-light-success rounded p-3">
              <h5 className="mb-1 text-success">{live.co2e.toFixed(4)} kg CO₂e</h5>
              <small className="text-muted">Total Emissions</small>
            </div>
          </Col>
        </Row>
        <Alert variant="secondary" className="mt-3 mb-0 py-2 small">
          <strong>Formula:</strong> Total kWh (all sites) × {ELECTRICITY_EF} kg CO₂e/kWh &nbsp;·&nbsp;
          EF source: CEA India (Grid Emission Factor).
        </Alert>
      </MainCard>

      {/* Per-site tables */}
      {sites.map((site, siteIdx) => {
        const siteKWh = site.monthlyData.reduce((s, r) => s + (parseFloat(r.kWh) || 0), 0);
        const siteCO2e = siteKWh * ELECTRICITY_EF;
        return (
          <Card className="mt-3" key={siteIdx}>
            <Card.Header>
              <Row className="align-items-center">
                <Col>
                  <div className="d-flex align-items-center gap-3">
                    <i className="ph ph-lightning text-primary" />
                    <Form.Control
                      size="sm"
                      style={{ maxWidth: 240 }}
                      value={site.siteName}
                      onChange={e => updateSiteName(siteIdx, e.target.value)}
                      placeholder="Site name"
                    />
                    <Badge bg="secondary" className="ms-2">{siteKWh.toFixed(2)} kWh</Badge>
                    <Badge bg="success">{siteCO2e.toFixed(4)} kg CO₂e</Badge>
                  </div>
                </Col>
                <Col xs="auto">
                  {sites.length > 1 && (
                    <Button variant="outline-danger" size="sm" onClick={() => removeSite(siteIdx)}>
                      <i className="ph ph-trash me-1" />
                      Remove Site
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
                      <th>Month</th>
                      <th>Electricity Consumed (kWh)</th>
                      <th>CO₂e (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {site.monthlyData.map((row, monthIdx) => (
                      <tr key={monthIdx}>
                        <td className="fw-semibold text-nowrap" style={{ width: 90 }}>{row.month}</td>
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
                        <td className="text-muted small text-end">
                          {((parseFloat(row.kWh) || 0) * ELECTRICITY_EF).toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-secondary fw-semibold">
                      <td>Total</td>
                      <td>{siteKWh.toFixed(3)} kWh</td>
                      <td className="text-end">{siteCO2e.toFixed(4)} kg CO₂e</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>
        );
      })}

      {/* Add Site */}
      <div className="mt-3">
        <Button variant="outline-primary" onClick={addSite}>
          <i className="ph ph-plus me-1" />
          Add Site
        </Button>
      </div>

      {/* Actions */}
      <Card className="mt-3">
        <Card.Body>
          <div className="d-flex gap-3 justify-content-end">
            {existing && (
              <Button variant="outline-danger" onClick={handleClear}>
                <i className="ph ph-trash me-1" />
                Clear Data
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
