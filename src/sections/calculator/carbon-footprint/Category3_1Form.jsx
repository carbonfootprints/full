import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import Stack from 'react-bootstrap/Stack';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

import MainCard from 'components/MainCard';

const MONTHS = [
  'Apr-24', 'May-24', 'Jun-24', 'Jul-24', 'Aug-24', 'Sep-24',
  'Oct-24', 'Nov-24', 'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25'
];

// Live preview constants (IPCC EFDB EF IDs: 17143, 123005, 18166, 17201)
const DIESEL_NCV = 43.33;    // TJ/kt
const DIESEL_CO2_EF = 74100; // kg CO2/TJ
const DIESEL_N2O_EF = 0.6;   // kg N2O/TJ
const DIESEL_CH4_EF = 5;     // kg CH4/TJ

const newSite = (siteName = '') => ({
  siteName,
  monthlyData: MONTHS.map((month) => ({ month, diesel: 0, boleroTrips: 0, eicherTrips: 0 }))
});

// ==============================|| CATEGORY 3.1 FORM ||============================== //

export default function Category3_1Form() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [activeSiteIndex, setActiveSiteIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [calculations, setCalculations] = useState(null);

  useEffect(() => { fetchCategoryData(); }, []);

  const initFromOrgSites = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.get(`${apiUrl}/api/orguser/organization-details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orgSites = (res.data.organizationDetails?.sites || []).filter((s) => s.isActive);
      setSites(orgSites.length > 0 ? orgSites.map((s) => newSite(s.siteName)) : [newSite()]);
      setActiveSiteIndex(0);
    } catch {
      setSites([newSite()]);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.get(`${apiUrl}/api/carbon/category/3.1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.category?.sites?.length > 0) {
        setSites(res.data.category.sites);
        if (res.data.category.calculations) setCalculations(res.data.category.calculations);
      } else {
        await initFromOrgSites();
      }
    } catch {
      await initFromOrgSites();
    }
  };

  const updateMonthly = (si, mi, field, value) => {
    const next = [...sites];
    next[si].monthlyData[mi][field] =
      field === 'diesel' ? (parseFloat(value) || 0) : (parseInt(value) || 0);
    setSites(next);
  };

  // Live preview
  const siteTotalDiesel = (site) => (site.monthlyData || []).reduce((s, m) => s + (m.diesel || 0), 0);
  const dieselToCO2e = (litres) => {
    const massKt = litres / 1e6;
    const energy = massKt * DIESEL_NCV;
    return energy * DIESEL_CO2_EF + energy * DIESEL_N2O_EF + energy * DIESEL_CH4_EF;
  };

  const handleSave = async () => {
    if (sites.find((s) => !s.siteName.trim())) {
      Swal.fire('Error', 'Please enter a name for all sites', 'error'); return false;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${apiUrl}/api/carbon/category/3.1`, { sites }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.category?.calculations) setCalculations(res.data.category.calculations);
      Swal.fire({
        icon: 'success', title: 'Saved & Calculated!',
        text: `Category 3.1 saved. Total CO₂e: ${res.data.category?.grandTotals?.totalCO2e?.toFixed(3) ?? '—'} kgCO₂e`,
        timer: 2500
      });
      return true;
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save data', 'error'); return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => { if (await handleSave()) navigate('/calculate/carbon-footprint/category/3.2'); };

  return (
    <>
      {/* Header */}
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/calculate/carbon-footprint')} className="mb-2">
              <i className="ph ph-arrow-left me-2" />Back to Categories
            </Button>
            <h4 className="mb-1">Category 3.1 - Transport Fuel Combustion (Between Plants)</h4>
            <p className="text-muted mb-0">Own vehicle diesel consumption for goods transport between sites</p>
          </Col>
          <Col xs="auto">
            <Badge bg="danger" className="px-3 py-2"><i className="ph ph-truck me-2" />Scope 3</Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Site Tabs */}
      <MainCard className="mt-3">
        <Alert variant="info" className="mb-3 small">
          <i className="ph ph-info me-2" />
          IPCC EFDB (EF IDs: 17143, 123005, 18166, 17201) — Diesel: NCV 43.33 TJ/kt, CO₂ 74,100 kg/TJ, N₂O 0.6 kg/TJ, CH₄ 5 kg/TJ.
          ISO 14064-1 direct reporting — N₂O and CH₄ reported as raw kg (no GWP multiplier).
        </Alert>

        <Tabs activeKey={activeSiteIndex} onSelect={(k) => setActiveSiteIndex(parseInt(k))} className="mb-4">
          {sites.map((site, si) => {
            const totalDiesel = siteTotalDiesel(site);
            const totalCO2e = dieselToCO2e(totalDiesel);
            return (
              <Tab
                key={si}
                eventKey={si}
                title={<span><i className="ph ph-map-pin me-1" />{site.siteName || `Site ${si + 1}`}</span>}
              >
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Site Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text" placeholder="e.g., BAB Pernambut" value={site.siteName}
                        onChange={(e) => {
                          const next = [...sites]; next[si].siteName = e.target.value; setSites(next);
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="table-responsive mb-3">
                  <Table bordered hover size="sm">
                    <thead className="table-light">
                      <tr>
                        <th style={{ minWidth: 100 }}>Month</th>
                        <th style={{ minWidth: 140 }}>Diesel (litres)</th>
                        <th style={{ minWidth: 130 }}>Bolero Trips</th>
                        <th style={{ minWidth: 130 }}>Eicher Trips</th>
                        <th className="text-end" style={{ minWidth: 150 }}>CO₂e Preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(site.monthlyData || []).map((md, mi) => {
                        const rowCO2e = dieselToCO2e(md.diesel || 0);
                        return (
                          <tr key={mi}>
                            <td className="fw-bold align-middle">{md.month}</td>
                            <td>
                              <Form.Control
                                size="sm" type="number" min="0" step="0.01"
                                value={md.diesel || ''} placeholder="0.00"
                                onChange={(e) => updateMonthly(si, mi, 'diesel', e.target.value)}
                              />
                            </td>
                            <td>
                              <Form.Control
                                size="sm" type="number" min="0" step="1"
                                value={md.boleroTrips || ''} placeholder="0"
                                onChange={(e) => updateMonthly(si, mi, 'boleroTrips', e.target.value)}
                              />
                            </td>
                            <td>
                              <Form.Control
                                size="sm" type="number" min="0" step="1"
                                value={md.eicherTrips || ''} placeholder="0"
                                onChange={(e) => updateMonthly(si, mi, 'eicherTrips', e.target.value)}
                              />
                            </td>
                            <td className="text-end align-middle fw-semibold text-success">
                              {rowCO2e.toFixed(3)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="table-light fw-bold">
                        <td>Total</td>
                        <td>{totalDiesel.toFixed(2)} L</td>
                        <td>{(site.monthlyData || []).reduce((s, m) => s + (m.boleroTrips || 0), 0)} trips</td>
                        <td>{(site.monthlyData || []).reduce((s, m) => s + (m.eicherTrips || 0), 0)} trips</td>
                        <td className="text-end text-success">{totalCO2e.toFixed(3)} kgCO₂e</td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </Tab>
            );
          })}
        </Tabs>
      </MainCard>

      {/* Calculation Results */}
      {calculations && (
        <MainCard className="mt-3">
          <h5 className="mb-3">
            <i className="ph ph-chart-bar me-2 text-success" />
            CO₂e Emission Results
            <Badge bg="success" className="ms-2 px-3">Category 3.1</Badge>
          </h5>

          <Alert variant="light" className="border mb-3 small">
            <strong>Calculation:</strong> CO₂e = (Litres ÷ 10⁶) × 43.33 TJ/kt × (74,100 CO₂ + 0.6 N₂O + 5 CH₄) kg/TJ &nbsp;|&nbsp;
            <strong>Note:</strong> N₂O and CH₄ are direct kg (ISO 14064-1, no GWP weighting)
          </Alert>

          {calculations.siteCalculations?.map((site, i) => (
            <Card key={i} className="mb-3 border">
              <Card.Header className="bg-light fw-semibold d-flex justify-content-between">
                <span><i className="ph ph-map-pin me-2" />{site.siteName}</span>
                <span>Total CO₂e: <strong>{site.totalCO2e?.toFixed(3)} kgCO₂e</strong></span>
              </Card.Header>
              <Card.Body className="p-0">
                <Table bordered size="sm" className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Fuel</th>
                      <th className="text-end">Litres</th>
                      <th className="text-end">Energy (TJ)</th>
                      <th className="text-end">CO₂ (kg)</th>
                      <th className="text-end">N₂O (kg)</th>
                      <th className="text-end">CH₄ (kg)</th>
                      <th className="text-end">Total CO₂e (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Diesel</td>
                      <td className="text-end">{site.totalDiesel?.toFixed(2)}</td>
                      <td className="text-end">{site.energyTJ?.toFixed(6)}</td>
                      <td className="text-end">{site.co2?.toFixed(3)}</td>
                      <td className="text-end">{site.n2o?.toFixed(3)}</td>
                      <td className="text-end">{site.ch4?.toFixed(3)}</td>
                      <td className="text-end fw-semibold text-success">{site.totalCO2e?.toFixed(3)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))}

          <Card className="border-success">
            <Card.Header className="bg-success text-white fw-semibold">Grand Total — All Sites (Category 3.1)</Card.Header>
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Fuel</th>
                    <th className="text-end">Total Litres</th>
                    <th className="text-end">CO₂ (kg)</th>
                    <th className="text-end">N₂O (kg)</th>
                    <th className="text-end">CH₄ (kg)</th>
                    <th className="text-end">Total CO₂e (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Diesel</td>
                    <td className="text-end">{calculations.totalDiesel?.toFixed(2) ?? '—'}</td>
                    <td className="text-end">{calculations.totalCO2?.toFixed(3) ?? '—'}</td>
                    <td className="text-end">{calculations.totalN2O?.toFixed(3) ?? '—'}</td>
                    <td className="text-end">{calculations.totalCH4?.toFixed(3) ?? '—'}</td>
                    <td className="text-end fw-semibold">{calculations.totalCO2e?.toFixed(3) ?? '—'}</td>
                  </tr>
                  <tr className="table-success fw-bold">
                    <td>Grand Total</td>
                    <td className="text-end">—</td>
                    <td className="text-end">—</td>
                    <td className="text-end">—</td>
                    <td className="text-end">—</td>
                    <td className="text-end text-success">{calculations.totalCO2e?.toFixed(3) ?? '—'}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </MainCard>
      )}

      {/* Action Buttons */}
      <MainCard className="mt-3">
        <Stack direction="horizontal" gap={2} className="justify-content-end">
          <Button variant="outline-secondary" onClick={() => navigate('/calculate/carbon-footprint')} disabled={saving}>Cancel</Button>
          <Button variant="outline-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save & Calculate'}</Button>
          <Button variant="primary" onClick={handleSaveAndNext} disabled={saving}>
            {saving ? 'Saving...' : <><span>Save & Next</span><i className="ph ph-arrow-right ms-2" /></>}
          </Button>
        </Stack>
      </MainCard>
    </>
  );
}
