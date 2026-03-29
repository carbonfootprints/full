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

const EXTINGUISHER_TYPES = ['ABC', 'CO₂', 'M/F', 'Dry Powder', 'Water', 'Other'];

const newExtinguisher = () => ({ type: 'ABC', quantity: 0, capacityPerUnit: 0, numberRefilled: 0 });
const newSite = (siteName = '') => ({ siteName, fireExtinguishers: [newExtinguisher()] });

// ==============================|| CATEGORY 1.4 FORM ||============================== //

export default function Category1_4Form() {
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
      const res = await axios.get(`${apiUrl}/api/carbon/category/1.4`, {
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

  const updateSiteName = (si, value) => {
    const next = [...sites]; next[si].siteName = value; setSites(next);
  };

  const addRow = (si) => {
    const next = [...sites];
    next[si].fireExtinguishers = [...(next[si].fireExtinguishers || []), newExtinguisher()];
    setSites(next);
  };

  const removeRow = (si, ri) => {
    const next = [...sites];
    next[si].fireExtinguishers = next[si].fireExtinguishers.filter((_, i) => i !== ri);
    setSites(next);
  };

  const updateRow = (si, ri, field, value) => {
    const next = [...sites];
    next[si].fireExtinguishers[ri][field] =
      ['quantity', 'capacityPerUnit', 'numberRefilled'].includes(field) ? (parseFloat(value) || 0) : value;
    setSites(next);
  };

  const handleSave = async () => {
    if (sites.find((s) => !s.siteName.trim())) {
      Swal.fire('Error', 'Please enter a name for all sites', 'error'); return false;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${apiUrl}/api/carbon/category/1.4`, { sites }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.category?.calculations) setCalculations(res.data.category.calculations);
      Swal.fire({
        icon: 'success', title: 'Saved & Calculated!',
        text: `Category 1.4 saved. Total CO₂e: ${res.data.category?.grandTotals?.totalCO2e?.toFixed(3) ?? '—'} kgCO₂e`,
        timer: 2500
      });
      return true;
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save data', 'error'); return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => { if (await handleSave()) navigate('/calculate/carbon-footprint/category/1.5'); };

  return (
    <>
      {/* Header */}
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/calculate/carbon-footprint')} className="mb-2">
              <i className="ph ph-arrow-left me-2" />Back to Categories
            </Button>
            <h4 className="mb-1">Category 1.4 - Fire Extinguishers</h4>
            <p className="text-muted mb-0">Enter fire extinguisher inventory and refill data per site</p>
          </Col>
          <Col xs="auto">
            <Badge bg="warning" className="px-3 py-2"><i className="ph ph-fire me-2" />Scope 1</Badge>
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
              title={<span><i className="ph ph-map-pin me-1" />{site.siteName || `Site ${si + 1}`}</span>}
            >
              {/* Site Name */}
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Site Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" placeholder="e.g., BAB Pernambut" value={site.siteName}
                      onChange={(e) => updateSiteName(si, e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>

              <Alert variant="info" className="mb-3 small">
                <i className="ph ph-info me-2" />
                Only <strong>CO₂-type</strong> extinguishers emit CO₂e when refilled. ABC, M/F, and other types contribute 0 kgCO₂e.
                CO₂e = No. refilled × Capacity per unit (kg).
              </Alert>

              <div className="table-responsive mb-2">
                <Table bordered hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th style={{ minWidth: 100 }}>Qty of Units</th>
                      <th style={{ minWidth: 130 }}>Capacity/Unit (kg)</th>
                      <th style={{ minWidth: 120 }}>No. Refilled</th>
                      <th className="text-end" style={{ minWidth: 130 }}>Total Refilled (kg)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(site.fireExtinguishers || []).map((ext, ri) => {
                      const totalKg = (ext.numberRefilled || 0) * (ext.capacityPerUnit || 0);
                      return (
                        <tr key={ri}>
                          <td>
                            <Form.Select size="sm" value={ext.type} onChange={(e) => updateRow(si, ri, 'type', e.target.value)}>
                              {EXTINGUISHER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </Form.Select>
                          </td>
                          <td>
                            <Form.Control size="sm" type="number" min="0" step="1" value={ext.quantity || ''} placeholder="0"
                              onChange={(e) => updateRow(si, ri, 'quantity', e.target.value)} />
                          </td>
                          <td>
                            <Form.Control size="sm" type="number" min="0" step="0.1" value={ext.capacityPerUnit || ''} placeholder="0.0"
                              onChange={(e) => updateRow(si, ri, 'capacityPerUnit', e.target.value)} />
                          </td>
                          <td>
                            <Form.Control size="sm" type="number" min="0" step="1" value={ext.numberRefilled || ''} placeholder="0"
                              onChange={(e) => updateRow(si, ri, 'numberRefilled', e.target.value)} />
                          </td>
                          <td className="text-end align-middle fw-semibold">{totalKg.toFixed(2)}</td>
                          <td className="text-center">
                            <Button variant="outline-danger" size="sm" onClick={() => removeRow(si, ri)}>
                              <i className="ph ph-trash" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
              <Button variant="outline-primary" size="sm" onClick={() => addRow(si)}>
                <i className="ph ph-plus me-1" />Add Row
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
            <Badge bg="success" className="ms-2 px-3">Category 1.4</Badge>
          </h5>

          <Alert variant="light" className="border mb-3 small">
            <strong>Calculation:</strong> CO₂e = No. refilled × Capacity/unit (kg) — applies to CO₂-type only. GWP = 1 (direct CO₂ emission).
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
                      <th className="text-end">Units</th>
                      <th className="text-end">Cap/Unit (kg)</th>
                      <th className="text-end">Refilled</th>
                      <th className="text-end">Total Refilled (kg)</th>
                      <th className="text-end">CO₂e (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {site.extinguisherDetails?.map((ext, j) => (
                      <tr key={j}>
                        <td>
                          {ext.type}
                          {ext.isCO2Type && <Badge bg="danger" className="ms-2" style={{ fontSize: '0.65rem' }}>CO₂</Badge>}
                        </td>
                        <td className="text-end">{ext.quantity}</td>
                        <td className="text-end">{ext.capacityPerUnit?.toFixed(1)}</td>
                        <td className="text-end">{ext.numberRefilled}</td>
                        <td className="text-end">{ext.totalKgRefilled?.toFixed(2)}</td>
                        <td className="text-end fw-semibold">{ext.co2e?.toFixed(3)}</td>
                      </tr>
                    ))}
                    <tr className="table-success fw-bold">
                      <td colSpan={5}>Total — {site.siteName}</td>
                      <td className="text-end">{site.totalCO2e?.toFixed(3)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))}

          <Card className="border-success">
            <Card.Header className="bg-success text-white fw-semibold">Grand Total — All Sites (Category 1.4)</Card.Header>
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Source</th>
                    <th className="text-end">Total CO₂ Refilled (kg)</th>
                    <th className="text-end">Total CO₂e (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CO₂ Fire Extinguishers</td>
                    <td className="text-end">{calculations.totalKgRefilled?.toFixed(2) ?? '—'}</td>
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
