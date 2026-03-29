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

const REFRIGERANT_TYPES_AC = ['HFC32', 'R134a', 'R410A', 'R22'];
const REFRIGERANT_TYPES_FRIDGE = ['FROST FREE', 'HFC32', 'R134a', 'R410A', 'R22'];

const newAC = () => ({ equipmentNumber: '', location: '', make: '', refrigerantGasType: 'HFC32', refrigerantQuantity: 0, numberOfRefills: 0 });
const newFridge = () => ({ equipmentType: '', location: '', make: '', refrigerantType: 'FROST FREE', refrigerantQuantity: 0, numberOfRefills: 0 });
const newSite = (siteName = '') => ({ siteName, airConditioners: [newAC()], refrigerators: [newFridge()] });

// ==============================|| CATEGORY 1.3 FORM ||============================== //

export default function Category1_3Form() {
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
      const res = await axios.get(`${apiUrl}/api/carbon/category/1.3`, {
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

  // ── Site handlers ──────────────────────────────────────────────────────────
  const updateSiteName = (si, value) => {
    const next = [...sites]; next[si].siteName = value; setSites(next);
  };

  // ── AC handlers ────────────────────────────────────────────────────────────
  const addAC = (si) => {
    const next = [...sites]; next[si].airConditioners = [...(next[si].airConditioners || []), newAC()]; setSites(next);
  };

  const removeAC = (si, ai) => {
    const next = [...sites]; next[si].airConditioners = next[si].airConditioners.filter((_, i) => i !== ai); setSites(next);
  };

  const updateAC = (si, ai, field, value) => {
    const next = [...sites];
    next[si].airConditioners[ai][field] = (field === 'numberOfRefills' || field === 'refrigerantQuantity') ? (parseFloat(value) || 0) : value;
    setSites(next);
  };

  // ── Fridge handlers ────────────────────────────────────────────────────────
  const addFridge = (si) => {
    const next = [...sites]; next[si].refrigerators = [...(next[si].refrigerators || []), newFridge()]; setSites(next);
  };

  const removeFridge = (si, fi) => {
    const next = [...sites]; next[si].refrigerators = next[si].refrigerators.filter((_, i) => i !== fi); setSites(next);
  };

  const updateFridge = (si, fi, field, value) => {
    const next = [...sites];
    next[si].refrigerators[fi][field] = (field === 'numberOfRefills' || field === 'refrigerantQuantity') ? (parseFloat(value) || 0) : value;
    setSites(next);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (sites.find((s) => !s.siteName.trim())) {
      Swal.fire('Error', 'Please enter a name for all sites', 'error'); return false;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${apiUrl}/api/carbon/category/1.3`, { sites }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.category?.calculations) setCalculations(res.data.category.calculations);
      Swal.fire({ icon: 'success', title: 'Saved & Calculated!', text: `Category 1.3 saved. Total CO₂e: ${res.data.category?.grandTotals?.totalCO2e?.toFixed(3) ?? '—'} kgCO₂e`, timer: 2500 });
      return true;
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save data', 'error'); return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => { if (await handleSave()) navigate('/calculate/carbon-footprint/category/1.4'); };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/calculate/carbon-footprint')} className="mb-2">
              <i className="ph ph-arrow-left me-2" />Back to Categories
            </Button>
            <h4 className="mb-1">Category 1.3 - Refrigerant — Use and Leaks</h4>
            <p className="text-muted mb-0">Enter AC and refrigerator refrigerant details per site</p>
          </Col>
          <Col xs="auto">
            <Badge bg="info" className="px-3 py-2"><i className="ph ph-snowflake me-2" />Scope 1</Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Site Tabs */}
      <MainCard className="mt-3">
        <Tabs activeKey={activeSiteIndex} onSelect={(k) => setActiveSiteIndex(parseInt(k))} className="mb-3">
          {sites.map((site, si) => (
            <Tab
              key={si}
              eventKey={si}
              title={
                <span>
                  <i className="ph ph-map-pin me-1" />
                  {site.siteName || `Site ${si + 1}`}
                </span>
              }
            >
              {/* Site Name */}
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Site Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" placeholder="e.g., BAB Pernambut" value={site.siteName} onChange={(e) => updateSiteName(si, e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>

              {/* Air Conditioners */}
              <h6 className="fw-semibold mb-2"><i className="ph ph-thermometer-hot me-2 text-primary" />Air Conditioners</h6>
              <Alert variant="info" className="mb-2 py-2 small">
                <i className="ph ph-info me-1" />
                Refills = 0: 3% annual leakage applied. Refills &gt; 0: full refrigerant charge counted as leaked.
              </Alert>
              <div className="table-responsive mb-2">
                <Table bordered hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Equipment</th>
                      <th>Location</th>
                      <th>Make</th>
                      <th>Refrigerant Type</th>
                      <th style={{ minWidth: 110 }}>Quantity (kg)</th>
                      <th style={{ minWidth: 90 }}>Refills</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(site.airConditioners || []).map((ac, ai) => (
                      <tr key={ai}>
                        <td><Form.Control size="sm" value={ac.equipmentNumber} placeholder="e.g., 1 (2 tonne)" onChange={(e) => updateAC(si, ai, 'equipmentNumber', e.target.value)} /></td>
                        <td><Form.Control size="sm" value={ac.location} placeholder="e.g., MD OFFICE" onChange={(e) => updateAC(si, ai, 'location', e.target.value)} /></td>
                        <td><Form.Control size="sm" value={ac.make} placeholder="e.g., O General" onChange={(e) => updateAC(si, ai, 'make', e.target.value)} /></td>
                        <td>
                          <Form.Select size="sm" value={ac.refrigerantGasType} onChange={(e) => updateAC(si, ai, 'refrigerantGasType', e.target.value)}>
                            {REFRIGERANT_TYPES_AC.map((t) => <option key={t} value={t}>{t}</option>)}
                            <option value="">— Not tracked —</option>
                          </Form.Select>
                        </td>
                        <td><Form.Control size="sm" type="number" min="0" step="0.001" value={ac.refrigerantQuantity || ''} placeholder="0.000" onChange={(e) => updateAC(si, ai, 'refrigerantQuantity', e.target.value)} /></td>
                        <td><Form.Control size="sm" type="number" min="0" step="1" value={ac.numberOfRefills || ''} placeholder="0" onChange={(e) => updateAC(si, ai, 'numberOfRefills', e.target.value)} /></td>
                        <td className="text-center">
                          <Button variant="outline-danger" size="sm" onClick={() => removeAC(si, ai)}><i className="ph ph-trash" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <Button variant="outline-primary" size="sm" onClick={() => addAC(si)} className="mb-4">
                <i className="ph ph-plus me-1" />Add AC Unit
              </Button>

              {/* Refrigerators */}
              <h6 className="fw-semibold mb-2"><i className="ph ph-cube me-2 text-primary" />Refrigerators</h6>
              <div className="table-responsive mb-2">
                <Table bordered hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Equipment Type</th>
                      <th>Location</th>
                      <th>Make</th>
                      <th>Refrigerant Type</th>
                      <th style={{ minWidth: 110 }}>Quantity (kg)</th>
                      <th style={{ minWidth: 90 }}>Refills</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(site.refrigerators || []).map((fridge, fi) => (
                      <tr key={fi}>
                        <td><Form.Control size="sm" value={fridge.equipmentType} placeholder="e.g., LG (Refrigerator)" onChange={(e) => updateFridge(si, fi, 'equipmentType', e.target.value)} /></td>
                        <td><Form.Control size="sm" value={fridge.location} placeholder="e.g., Kitchen" onChange={(e) => updateFridge(si, fi, 'location', e.target.value)} /></td>
                        <td><Form.Control size="sm" value={fridge.make} placeholder="e.g., LG" onChange={(e) => updateFridge(si, fi, 'make', e.target.value)} /></td>
                        <td>
                          <Form.Select size="sm" value={fridge.refrigerantType} onChange={(e) => updateFridge(si, fi, 'refrigerantType', e.target.value)}>
                            {REFRIGERANT_TYPES_FRIDGE.map((t) => <option key={t} value={t}>{t}</option>)}
                          </Form.Select>
                        </td>
                        <td><Form.Control size="sm" type="number" min="0" step="0.001" value={fridge.refrigerantQuantity || ''} placeholder="0.000" onChange={(e) => updateFridge(si, fi, 'refrigerantQuantity', e.target.value)} /></td>
                        <td><Form.Control size="sm" type="number" min="0" step="1" value={fridge.numberOfRefills || ''} placeholder="0" onChange={(e) => updateFridge(si, fi, 'numberOfRefills', e.target.value)} /></td>
                        <td className="text-center">
                          <Button variant="outline-danger" size="sm" onClick={() => removeFridge(si, fi)}><i className="ph ph-trash" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <Button variant="outline-primary" size="sm" onClick={() => addFridge(si)}>
                <i className="ph ph-plus me-1" />Add Refrigerator
              </Button>
            </Tab>
          ))}
        </Tabs>

      </MainCard>

      {/* Calculation Results */}
      {calculations && (
        <MainCard className="mt-3">
          <h5 className="mb-3">
            <i className="ph ph-chart-bar me-2 text-success" />
            CO₂e Emission Results
            <Badge bg="success" className="ms-2 px-3">Category 1.3</Badge>
          </h5>

          <Alert variant="light" className="border mb-3 small">
            <strong>GWP Values (IPCC AR6, EF ID 214382):</strong>
            &nbsp;HFC32: 771 &nbsp;|&nbsp; R134a: 1,526 &nbsp;|&nbsp; R410A: 2,088 &nbsp;|&nbsp; R22: 1,760 &nbsp;|&nbsp;
            Leakage rate: full charge if refilled, else 3% annual
          </Alert>

          {calculations.siteCalculations?.map((site, i) => (
            <Card key={i} className="mb-3 border">
              <Card.Header className="bg-light fw-semibold d-flex justify-content-between">
                <span><i className="ph ph-map-pin me-2" />{site.siteName}</span>
                <span>Site total: <strong>{site.totalCO2e?.toFixed(3)} kgCO₂e</strong></span>
              </Card.Header>
              <Card.Body className="p-0">
                <Table bordered size="sm" className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th>Equipment</th>
                      <th>Location</th>
                      <th>Refrigerant</th>
                      <th className="text-end">Qty (kg)</th>
                      <th className="text-end">Refills</th>
                      <th className="text-end">Leak (kg)</th>
                      <th className="text-end">GWP</th>
                      <th className="text-end">CO₂e (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {site.equipmentDetails?.map((eq, j) => (
                      <tr key={j}>
                        <td>{eq.type}</td>
                        <td>{eq.description || '—'}</td>
                        <td>{eq.location || '—'}</td>
                        <td>{eq.refrigerantGasType || '—'}</td>
                        <td className="text-end">{eq.refrigerantQuantity?.toFixed(3)}</td>
                        <td className="text-end">{eq.numberOfRefills}</td>
                        <td className="text-end">{eq.totalRefrigerantLeak?.toFixed(4)}</td>
                        <td className="text-end">{eq.gwp || '—'}</td>
                        <td className="text-end fw-semibold">{eq.co2e?.toFixed(3)}</td>
                      </tr>
                    ))}
                    <tr className="table-success fw-bold">
                      <td colSpan={8}>Total — {site.siteName}</td>
                      <td className="text-end">{site.totalCO2e?.toFixed(3)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))}

          <Card className="border-success">
            <Card.Header className="bg-success text-white fw-semibold">Grand Total — All Sites (Category 1.3)</Card.Header>
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Source</th>
                    <th className="text-end">Total Refrigerant Leak (kg)</th>
                    <th className="text-end">Total CO₂e (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>All Refrigerants</td>
                    <td className="text-end">{calculations.totalRefrigerantLeak?.toFixed(4) ?? '—'}</td>
                    <td className="text-end fw-semibold">{calculations.totalCO2e?.toFixed(3) ?? '—'}</td>
                  </tr>
                  <tr className="table-success fw-bold">
                    <td>Grand Total</td>
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
