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

// Energy intensity from supplier data: 0.6324 MJ/m² ÷ 3.6 MJ/kWh
const ENERGY_INTENSITY_MJ_PER_M2 = 0.6324;           // MJ/m² (from supplier)
const ENERGY_INTENSITY_KWH_PER_M2 = 0.6324 / 3.6;    // = 0.17566667 kWh/m²
const ELECTRICITY_EF = 0.727;                          // kg CO₂/kWh — CEA India Grid (Dec 2024)
const COMBINED_EF = ENERGY_INTENSITY_KWH_PER_M2 * ELECTRICITY_EF; // kg CO₂ per m²

const MONTHS = [
  'Apr-24', 'May-24', 'Jun-24', 'Jul-24', 'Aug-24', 'Sep-24',
  'Oct-24', 'Nov-24', 'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25'
];

function makeSite(name = '') {
  return {
    siteName: name,
    monthlyData: MONTHS.map(month => ({ month, areaM2: '' })),
  };
}

function calcLive(sites) {
  const totalAreaM2 = sites.reduce((siteSum, site) =>
    siteSum + site.monthlyData.reduce((s, r) => s + (parseFloat(r.areaM2) || 0), 0), 0);
  const totalKWh = totalAreaM2 * ENERGY_INTENSITY_KWH_PER_M2;
  return {
    totalAreaM2,
    totalKWh,
    co2e: totalKWh * ELECTRICITY_EF,
  };
}

// ==============================|| CATEGORY 4.7 FORM ||============================== //

export default function Category4_7Form() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const [sites, setSites] = useState([makeSite('Pernambut')]);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(false);

  const live = calcLive(sites);

  useEffect(() => {
    fetchExisting();
  }, []);

  const fetchExisting = async () => {
    try {
      const res = await axiosServices.get(`${apiUrl}/api/carbon/category/4.7`);
      if (res.data?.category?.sites?.length) {
        const loaded = res.data.category.sites.map(site => ({
          siteName: site.siteName || '',
          monthlyData: MONTHS.map(month => {
            const found = (site.monthlyData || []).find(e => e.month === month);
            return { month, areaM2: found ? found.areaM2 ?? '' : '' };
          }),
        }));
        setSites(loaded);
        setExisting(true);
      }
    } catch {
      // no existing data — defaults are fine
    }
  };

  const addSite = () => setSites(s => [...s, makeSite(`Site ${s.length + 1}`)]);
  const removeSite = (siteIdx) => setSites(s => s.filter((_, i) => i !== siteIdx));
  const updateSiteName = (siteIdx, value) =>
    setSites(s => s.map((site, i) => i === siteIdx ? { ...site, siteName: value } : site));
  const updateMonthlyData = (siteIdx, monthIdx, value) =>
    setSites(s => s.map((site, i) => {
      if (i !== siteIdx) return site;
      const monthlyData = site.monthlyData.map((row, j) =>
        j === monthIdx ? { ...row, areaM2: value } : row
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
            .filter(r => parseFloat(r.areaM2) > 0)
            .map(r => ({ month: r.month, areaM2: parseFloat(r.areaM2) || 0 })),
        })),
      };

      await axiosServices.post(`${apiUrl}/api/carbon/category/4.7`, payload);

      await Swal.fire({
        icon: 'success',
        title: 'Data Saved',
        text: `Category 4.7 job work data saved. Total area: ${live.totalAreaM2.toFixed(0)} m², CO₂: ${live.co2e.toFixed(2)} kg`,
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
      text: 'This will permanently delete all Category 4.7 job work data.',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      confirmButtonColor: '#d33',
    });
    if (!result.isConfirmed) return;

    try {
      await axiosServices.delete(`${apiUrl}/api/carbon/category/4.7`);
      setSites([makeSite('Pernambut')]);
      setExisting(false);
      Swal.fire({ icon: 'success', title: 'Cleared', text: 'Category 4.7 data removed.' });
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
                <h4 className="mb-1">Category 4.7 — Purchased Services (Job Work)</h4>
                <p className="text-muted mb-0 small">
                  Supplier energy intensity: {ENERGY_INTENSITY_MJ_PER_M2} MJ/m² =&nbsp;
                  {ENERGY_INTENSITY_KWH_PER_M2.toFixed(8)} kWh/m² &nbsp;·&nbsp;
                  CEA EF: {ELECTRICITY_EF} kg CO₂/kWh
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

      {/* Live Summary */}
      <MainCard className="mt-3">
        <Row className="text-center g-3">
          <Col md={3}>
            <div className="bg-light-secondary rounded p-3">
              <h5 className="mb-1">{live.totalAreaM2.toFixed(2)} m²</h5>
              <small className="text-muted">Production Area (all sites)</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-warning rounded p-3">
              <h5 className="mb-1 text-warning">{live.totalKWh.toFixed(2)} kWh</h5>
              <small className="text-muted">Electricity (derived)</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-info rounded p-3">
              <h5 className="mb-1 text-info">{ELECTRICITY_EF} kg CO₂/kWh</h5>
              <small className="text-muted">CEA Emission Factor</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-success rounded p-3">
              <h5 className="mb-1 text-success">{live.co2e.toFixed(4)} kg CO₂</h5>
              <small className="text-muted">Total Emissions</small>
            </div>
          </Col>
        </Row>
        <Alert variant="secondary" className="mt-3 mb-0 py-2 small">
          <strong>Formula:</strong> Production area (m²) × {ENERGY_INTENSITY_KWH_PER_M2.toFixed(8)} kWh/m² × {ELECTRICITY_EF} kg CO₂/kWh
          &nbsp;·&nbsp; Energy intensity source: Supplier data (0.6324 MJ/m² ÷ 3.6).
          &nbsp;·&nbsp; EF source: CO₂ Baseline Database for the Indian Power Sector, Version 20 December 2024 (CEA).
        </Alert>
      </MainCard>

      {/* Per-site tables */}
      {sites.map((site, siteIdx) => {
        const siteArea = site.monthlyData.reduce((s, r) => s + (parseFloat(r.areaM2) || 0), 0);
        const siteKWh  = siteArea * ENERGY_INTENSITY_KWH_PER_M2;
        const siteCO2e = siteKWh  * ELECTRICITY_EF;
        return (
          <Card className="mt-3" key={siteIdx}>
            <Card.Header>
              <Row className="align-items-center">
                <Col>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <i className="ph ph-factory text-secondary" />
                    <Form.Control
                      size="sm"
                      style={{ maxWidth: 240 }}
                      value={site.siteName}
                      onChange={e => updateSiteName(siteIdx, e.target.value)}
                      placeholder="Job work site name"
                    />
                    <Badge bg="secondary">{siteArea.toFixed(2)} m²</Badge>
                    <Badge bg="warning" text="dark">{siteKWh.toFixed(2)} kWh</Badge>
                    <Badge bg="success">{siteCO2e.toFixed(4)} kg CO₂</Badge>
                  </div>
                </Col>
                <Col xs="auto">
                  {sites.length > 1 && (
                    <Button variant="outline-danger" size="sm" onClick={() => removeSite(siteIdx)}>
                      <i className="ph ph-trash me-1" />Remove Site
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
                      <th>Production Area Processed (m²)</th>
                      <th className="text-end">Electricity (kWh)</th>
                      <th className="text-end">CO₂ (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {site.monthlyData.map((row, monthIdx) => {
                      const m2   = parseFloat(row.areaM2) || 0;
                      const kWh  = m2 * ENERGY_INTENSITY_KWH_PER_M2;
                      const co2  = kWh * ELECTRICITY_EF;
                      return (
                        <tr key={monthIdx}>
                          <td className="fw-semibold text-nowrap">{row.month}</td>
                          <td>
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.areaM2}
                              onChange={e => updateMonthlyData(siteIdx, monthIdx, e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td className="text-muted small text-end">{kWh.toFixed(4)}</td>
                          <td className="text-muted small text-end">{co2.toFixed(4)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="table-secondary fw-semibold">
                      <td>Total</td>
                      <td>{siteArea.toFixed(3)} m²</td>
                      <td className="text-end">{siteKWh.toFixed(4)} kWh</td>
                      <td className="text-end">{siteCO2e.toFixed(4)} kg CO₂</td>
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
        <Button variant="outline-secondary" onClick={addSite}>
          <i className="ph ph-plus me-1" />
          Add Job Work Site
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
