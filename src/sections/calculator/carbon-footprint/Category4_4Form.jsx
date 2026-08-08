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

// UNIDO consumption factors per m³ of effluent
const UNIDO = {
  wood: { consumptionPerM3: 20, unit: 'kg/m³', ef: 1.8592, efUnit: 'kg CO₂/kg', co2PerM3: 37.184 },   // 20 × 1.8592
  diesel: { consumptionPerM3: 0.8, unit: 'L/m³', ef: 2.68, efUnit: 'kg CO₂/L', co2PerM3: 2.144 },     // 0.8 × 2.68
  electricity: { consumptionPerM3: 15, unit: 'kWh/m³', ef: 0.727, efUnit: 'kg CO₂/kWh', co2PerM3: 10.905 }, // 15 × 0.727
};

const TOTAL_EF_PER_M3 = UNIDO.wood.co2PerM3 + UNIDO.diesel.co2PerM3 + UNIDO.electricity.co2PerM3; // ~50.233

const MONTHS = [
  'Apr-24', 'May-24', 'Jun-24', 'Jul-24', 'Aug-24', 'Sep-24',
  'Oct-24', 'Nov-24', 'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25'
];

function makeSite(name = '') {
  return {
    siteName: name,
    monthlyData: MONTHS.map(month => ({ month, effluentVolumeM3: '' })),
  };
}

function calcLive(sites) {
  const totalM3 = sites.reduce((siteSum, site) =>
    siteSum + site.monthlyData.reduce((s, r) => s + (parseFloat(r.effluentVolumeM3) || 0), 0), 0);
  return {
    totalM3,
    woodKg: totalM3 * UNIDO.wood.consumptionPerM3,
    dieselL: totalM3 * UNIDO.diesel.consumptionPerM3,
    electricityKWh: totalM3 * UNIDO.electricity.consumptionPerM3,
    co2eWood: totalM3 * UNIDO.wood.co2PerM3,
    co2eDiesel: totalM3 * UNIDO.diesel.co2PerM3,
    co2eElectricity: totalM3 * UNIDO.electricity.co2PerM3,
    totalCO2e: totalM3 * TOTAL_EF_PER_M3,
  };
}

// ==============================|| CATEGORY 4.4 FORM ||============================== //

export default function Category4_4Form() {
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
      const res = await axiosServices.get(`${apiUrl}/api/carbon/category/4.4`);
      if (res.data?.category?.sites?.length) {
        const loaded = res.data.category.sites.map(site => ({
          siteName: site.siteName || '',
          monthlyData: MONTHS.map(month => {
            const found = (site.monthlyData || []).find(e => e.month === month);
            return { month, effluentVolumeM3: found ? found.effluentVolumeM3 ?? '' : '' };
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
        j === monthIdx ? { ...row, effluentVolumeM3: value } : row
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
            .filter(r => parseFloat(r.effluentVolumeM3) > 0)
            .map(r => ({ month: r.month, effluentVolumeM3: parseFloat(r.effluentVolumeM3) || 0 })),
        })),
      };

      await axiosServices.post(`${apiUrl}/api/carbon/category/4.4`, payload);

      await Swal.fire({
        icon: 'success',
        title: 'Data Saved',
        text: `Category 4.4 wastewater treatment data saved. Total CO₂e: ${live.totalCO2e.toFixed(4)} kg`,
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
      text: 'This will permanently delete all Category 4.4 wastewater treatment data.',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      confirmButtonColor: '#d33',
    });
    if (!result.isConfirmed) return;

    try {
      await axiosServices.delete(`${apiUrl}/api/carbon/category/4.4`);
      setSites([makeSite('')]);
      setExisting(false);
      Swal.fire({ icon: 'success', title: 'Cleared', text: 'Category 4.4 data removed.' });
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
                <h4 className="mb-1">Category 4.4 — Wastewater Treatment (UNIDO Factors)</h4>
                <p className="text-muted mb-0 small">
                  Combined EF: {TOTAL_EF_PER_M3.toFixed(3)} kg CO₂e/m³ effluent &nbsp;·&nbsp; Source: UNIDO
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

      {/* UNIDO Factors Info Card */}
      <Card className="mt-3 border-info">
        <Card.Header className="bg-light-info">
          <h5 className="mb-0 text-info">
            <i className="ph ph-info me-2" />
            UNIDO Consumption Factors per m³ of Effluent
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table bordered size="sm" className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Input</th>
                  <th>Consumption / m³</th>
                  <th>Emission Factor</th>
                  <th>CO₂e / m³ effluent</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><Badge bg="warning" text="dark">Wood</Badge></td>
                  <td>{UNIDO.wood.consumptionPerM3} {UNIDO.wood.unit}</td>
                  <td>{UNIDO.wood.ef} {UNIDO.wood.efUnit}</td>
                  <td className="fw-semibold">{UNIDO.wood.co2PerM3.toFixed(3)} kg CO₂e</td>
                </tr>
                <tr>
                  <td><Badge bg="secondary">Diesel</Badge></td>
                  <td>{UNIDO.diesel.consumptionPerM3} {UNIDO.diesel.unit}</td>
                  <td>{UNIDO.diesel.ef} {UNIDO.diesel.efUnit}</td>
                  <td className="fw-semibold">{UNIDO.diesel.co2PerM3.toFixed(3)} kg CO₂e</td>
                </tr>
                <tr>
                  <td><Badge bg="primary">Electricity</Badge></td>
                  <td>{UNIDO.electricity.consumptionPerM3} {UNIDO.electricity.unit}</td>
                  <td>{UNIDO.electricity.ef} {UNIDO.electricity.efUnit}</td>
                  <td className="fw-semibold">{UNIDO.electricity.co2PerM3.toFixed(3)} kg CO₂e</td>
                </tr>
                <tr className="table-success fw-bold">
                  <td colSpan={3}>Total per m³ effluent</td>
                  <td>{TOTAL_EF_PER_M3.toFixed(3)} kg CO₂e</td>
                </tr>
              </tbody>
            </Table>
          </div>
          <Alert variant="warning" className="mt-3 mb-0 py-2 small">
            <strong>Note:</strong> EF source: UNIDO. Verify against source report if totals differ.
          </Alert>
        </Card.Body>
      </Card>

      {/* Live CO2e Summary */}
      <MainCard className="mt-3">
        <Row className="text-center g-3">
          <Col md={3}>
            <div className="bg-light-primary rounded p-3">
              <h5 className="mb-1 text-primary">{live.totalM3.toFixed(2)} m³</h5>
              <small className="text-muted">Total Effluent Volume</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-warning rounded p-3">
              <h5 className="mb-1 text-warning">{live.woodKg.toFixed(2)} kg</h5>
              <small className="text-muted">Wood Consumed</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-info rounded p-3">
              <h5 className="mb-1 text-info">{live.dieselL.toFixed(2)} L</h5>
              <small className="text-muted">Diesel Consumed</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-secondary rounded p-3">
              <h5 className="mb-1 text-secondary">{live.electricityKWh.toFixed(2)} kWh</h5>
              <small className="text-muted">Electricity Consumed</small>
            </div>
          </Col>
        </Row>

        {/* Derived emissions breakdown */}
        <div className="mt-3">
          <div className="table-responsive">
            <Table bordered size="sm" className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Input</th>
                  <th className="text-end">Quantity</th>
                  <th className="text-end">CO₂e (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><Badge bg="warning" text="dark" className="me-1">Wood</Badge> {live.woodKg.toFixed(2)} kg</td>
                  <td className="text-end">{live.woodKg.toFixed(2)} kg × {UNIDO.wood.ef}</td>
                  <td className="text-end fw-semibold">{live.co2eWood.toFixed(4)}</td>
                </tr>
                <tr>
                  <td><Badge bg="secondary" className="me-1">Diesel</Badge> {live.dieselL.toFixed(2)} L</td>
                  <td className="text-end">{live.dieselL.toFixed(2)} L × {UNIDO.diesel.ef}</td>
                  <td className="text-end fw-semibold">{live.co2eDiesel.toFixed(4)}</td>
                </tr>
                <tr>
                  <td><Badge bg="primary" className="me-1">Electricity</Badge> {live.electricityKWh.toFixed(2)} kWh</td>
                  <td className="text-end">{live.electricityKWh.toFixed(2)} kWh × {UNIDO.electricity.ef}</td>
                  <td className="text-end fw-semibold">{live.co2eElectricity.toFixed(4)}</td>
                </tr>
                <tr className="table-success fw-bold">
                  <td>Total CO₂e</td>
                  <td className="text-end">{live.totalM3.toFixed(2)} m³ × {TOTAL_EF_PER_M3.toFixed(3)}</td>
                  <td className="text-end text-success">{live.totalCO2e.toFixed(4)} kg CO₂e</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
      </MainCard>

      {/* Per-site tables */}
      {sites.map((site, siteIdx) => {
        const siteM3 = site.monthlyData.reduce((s, r) => s + (parseFloat(r.effluentVolumeM3) || 0), 0);
        const siteCO2e = siteM3 * TOTAL_EF_PER_M3;
        return (
          <Card className="mt-3" key={siteIdx}>
            <Card.Header>
              <Row className="align-items-center">
                <Col>
                  <div className="d-flex align-items-center gap-3">
                    <i className="ph ph-waves text-info" />
                    <Form.Control
                      size="sm"
                      style={{ maxWidth: 240 }}
                      value={site.siteName}
                      onChange={e => updateSiteName(siteIdx, e.target.value)}
                      placeholder="Site name"
                    />
                    <Badge bg="secondary" className="ms-2">{siteM3.toFixed(2)} m³</Badge>
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
                      <th>Effluent Volume (m³)</th>
                      <th>Wood (kg)</th>
                      <th>Diesel (L)</th>
                      <th>Electricity (kWh)</th>
                      <th>CO₂e (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {site.monthlyData.map((row, monthIdx) => {
                      const vol = parseFloat(row.effluentVolumeM3) || 0;
                      return (
                        <tr key={monthIdx}>
                          <td className="fw-semibold text-nowrap" style={{ width: 90 }}>{row.month}</td>
                          <td>
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.effluentVolumeM3}
                              onChange={e => updateMonthlyData(siteIdx, monthIdx, e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td className="text-muted small text-end">
                            {(vol * UNIDO.wood.consumptionPerM3).toFixed(2)}
                          </td>
                          <td className="text-muted small text-end">
                            {(vol * UNIDO.diesel.consumptionPerM3).toFixed(3)}
                          </td>
                          <td className="text-muted small text-end">
                            {(vol * UNIDO.electricity.consumptionPerM3).toFixed(2)}
                          </td>
                          <td className="text-muted small text-end">
                            {(vol * TOTAL_EF_PER_M3).toFixed(4)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="table-secondary fw-semibold">
                      <td>Total</td>
                      <td>{siteM3.toFixed(3)} m³</td>
                      <td className="text-end">{(siteM3 * UNIDO.wood.consumptionPerM3).toFixed(2)} kg</td>
                      <td className="text-end">{(siteM3 * UNIDO.diesel.consumptionPerM3).toFixed(3)} L</td>
                      <td className="text-end">{(siteM3 * UNIDO.electricity.consumptionPerM3).toFixed(2)} kWh</td>
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
