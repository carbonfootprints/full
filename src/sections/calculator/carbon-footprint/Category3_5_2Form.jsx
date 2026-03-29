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

// UK Govt GHG Conversion Factors 2025 — Freight goods by sea
const SEA_CO2_EF = 0.01592; // kg CO2 per t.km
const SEA_N2O_EF = 0.00019; // kg N2O per t.km (direct, no GWP; CH4 excluded per client data)
const NM_TO_KM   = 1.852;   // 1 nautical mile = 1.852 km

const newDelivery = () => ({
  date: '',
  invoiceNo: '',
  areaSqft: 0,
  weightTonnes: 0,
  customerLocation: '',
  distanceNm: 0
});

const newSite = (siteName = '') => ({ siteName, consignments: [newDelivery()] });

// ==============================|| CATEGORY 3.5.2 FORM ||============================== //

export default function Category3_5_2Form() {
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
      const res = await axios.get(`${apiUrl}/api/carbon/category/3.5.2`, {
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

  const addRow = (si) => {
    const next = [...sites];
    next[si].consignments = [...(next[si].consignments || []), newDelivery()];
    setSites(next);
  };

  const removeRow = (si, ri) => {
    const next = [...sites];
    next[si].consignments = next[si].consignments.filter((_, i) => i !== ri);
    setSites(next);
  };

  const updateRow = (si, ri, field, value) => {
    const next = [...sites];
    next[si].consignments[ri][field] =
      ['areaSqft', 'weightTonnes', 'distanceNm'].includes(field) ? (parseFloat(value) || 0) : value;
    setSites(next);
  };

  // Live preview — weight already in tonnes, distance in nm → km
  const rowTkm  = (c) => (c.weightTonnes || 0) * ((c.distanceNm || 0) * NM_TO_KM);
  const rowCO2e = (c) => rowTkm(c) * (SEA_CO2_EF + SEA_N2O_EF);
  const siteTotalTkm  = (site) => (site.consignments || []).reduce((s, c) => s + rowTkm(c), 0);
  const siteTotalCO2e = (site) => (site.consignments || []).reduce((s, c) => s + rowCO2e(c), 0);

  const handleSave = async () => {
    if (sites.find((s) => !s.siteName.trim())) {
      Swal.fire('Error', 'Please enter a name for all sites', 'error'); return false;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${apiUrl}/api/carbon/category/3.5.2`, { sites }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.category?.calculations) setCalculations(res.data.category.calculations);
      Swal.fire({
        icon: 'success', title: 'Saved & Calculated!',
        text: `Category 3.5.2 saved. Total CO₂e: ${res.data.category?.grandTotals?.totalCO2e?.toFixed(3) ?? '—'} kgCO₂e`,
        timer: 2500
      });
      return true;
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save data', 'error'); return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => { if (await handleSave()) navigate('/calculate/carbon-footprint/category/3.2.3a'); };

  return (
    <>
      {/* Header */}
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/calculate/carbon-footprint')} className="mb-2">
              <i className="ph ph-arrow-left me-2" />Back to Categories
            </Button>
            <h4 className="mb-1">Category 3.5.2 - Downstream Sea Transportation (Finished Leather)</h4>
            <p className="text-muted mb-0">Export delivery data — weight (tonnes) × sea distance = t·km → CO₂e</p>
          </Col>
          <Col xs="auto">
            <Badge bg="primary" className="px-3 py-2"><i className="ph ph-boat me-2" />Scope 3</Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Site Tabs */}
      <MainCard className="mt-3">
        <Alert variant="info" className="mb-3 small">
          <i className="ph ph-info me-2" />
          EF source: UK Govt GHG Conversion Factors 2025 — Freight goods by sea:
          CO₂ <strong>0.01592</strong> + N₂O <strong>0.00019</strong> = <strong>0.01611 kg/t·km</strong> (ISO 14064-1 direct reporting).
          Enter distance in <strong>nautical miles</strong> — converted to km automatically (1 nm = {NM_TO_KM} km).
          Weight entered in <strong>tonnes</strong>.
        </Alert>

        <Tabs activeKey={activeSiteIndex} onSelect={(k) => setActiveSiteIndex(parseInt(k))} className="mb-4">
          {sites.map((site, si) => {
            const totalTkm  = siteTotalTkm(site);
            const totalCO2e = siteTotalCO2e(site);
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
                        type="text" placeholder="e.g., BAB Thirumudivakkam" value={site.siteName}
                        onChange={(e) => {
                          const next = [...sites]; next[si].siteName = e.target.value; setSites(next);
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="table-responsive mb-2">
                  <Table bordered hover size="sm">
                    <thead className="table-light">
                      <tr>
                        <th style={{ minWidth: 100 }}>Date</th>
                        <th style={{ minWidth: 130 }}>Invoice No.</th>
                        <th style={{ minWidth: 100 }}>Area (sqft)</th>
                        <th style={{ minWidth: 110 }}>Weight (t)</th>
                        <th style={{ minWidth: 140 }}>Customer Location</th>
                        <th style={{ minWidth: 110 }}>Distance (nm)</th>
                        <th className="text-end" style={{ minWidth: 100 }}>t·km</th>
                        <th className="text-end" style={{ minWidth: 110 }}>CO₂e (kg)</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(site.consignments || []).map((c, ri) => {
                        const tkm  = rowTkm(c);
                        const co2e = rowCO2e(c);
                        return (
                          <tr key={ri}>
                            <td>
                              <Form.Control size="sm" type="date" value={c.date || ''}
                                onChange={(e) => updateRow(si, ri, 'date', e.target.value)} />
                            </td>
                            <td>
                              <Form.Control size="sm" type="text" placeholder="Invoice no."
                                value={c.invoiceNo || ''}
                                onChange={(e) => updateRow(si, ri, 'invoiceNo', e.target.value)} />
                            </td>
                            <td>
                              <Form.Control size="sm" type="number" min="0" step="0.01"
                                value={c.areaSqft || ''} placeholder="0.00"
                                onChange={(e) => updateRow(si, ri, 'areaSqft', e.target.value)} />
                            </td>
                            <td>
                              <Form.Control size="sm" type="number" min="0" step="0.01"
                                value={c.weightTonnes || ''} placeholder="0.00"
                                onChange={(e) => updateRow(si, ri, 'weightTonnes', e.target.value)} />
                            </td>
                            <td>
                              <Form.Control size="sm" type="text" placeholder="e.g., UAE"
                                value={c.customerLocation || ''}
                                onChange={(e) => updateRow(si, ri, 'customerLocation', e.target.value)} />
                            </td>
                            <td>
                              <Form.Control size="sm" type="number" min="0" step="1"
                                value={c.distanceNm || ''} placeholder="nm"
                                onChange={(e) => updateRow(si, ri, 'distanceNm', e.target.value)} />
                            </td>
                            <td className="text-end align-middle fw-semibold">{tkm.toFixed(3)}</td>
                            <td className="text-end align-middle fw-semibold text-success">{co2e.toFixed(3)}</td>
                            <td className="text-center">
                              <Button variant="outline-danger" size="sm" onClick={() => removeRow(si, ri)}>
                                <i className="ph ph-trash" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="table-light fw-bold">
                        <td colSpan={6}>Total</td>
                        <td className="text-end">{totalTkm.toFixed(3)}</td>
                        <td className="text-end text-success">{totalCO2e.toFixed(3)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>

                <Button variant="outline-primary" size="sm" onClick={() => addRow(si)}>
                  <i className="ph ph-plus me-1" />Add Delivery
                </Button>
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
            <Badge bg="success" className="ms-2 px-3">Category 3.5.2</Badge>
          </h5>

          <Alert variant="light" className="border mb-3 small">
            <strong>EFs:</strong> CO₂ 0.01592 + N₂O 0.00019 = 0.01611 kg/t·km &nbsp;|&nbsp;
            <strong>Source:</strong> UK Govt GHG Conversion Factors 2025 (freight goods by sea)
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
                      <th>Total Weight (t)</th>
                      <th className="text-end">Total t·km</th>
                      <th className="text-end">CO₂ (kg)</th>
                      <th className="text-end">N₂O (kg)</th>
                      <th className="text-end">Total CO₂e (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{site.totalWeightTonnes?.toFixed(3)}</td>
                      <td className="text-end">{site.totalTonneKm?.toFixed(3)}</td>
                      <td className="text-end">{site.co2?.toFixed(3)}</td>
                      <td className="text-end">{site.n2o?.toFixed(3)}</td>
                      <td className="text-end fw-semibold text-success">{site.totalCO2e?.toFixed(3)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))}

          <Card className="border-success">
            <Card.Header className="bg-success text-white fw-semibold">Grand Total — All Sites (Category 3.5.2)</Card.Header>
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Total Weight (t)</th>
                    <th className="text-end">Total t·km</th>
                    <th className="text-end">CO₂ (kg)</th>
                    <th className="text-end">N₂O (kg)</th>
                    <th className="text-end">Total CO₂e (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{calculations.totalWeightTonnes?.toFixed(3) ?? '—'}</td>
                    <td className="text-end">{calculations.totalTonneKm?.toFixed(3) ?? '—'}</td>
                    <td className="text-end">{calculations.totalCO2?.toFixed(3) ?? '—'}</td>
                    <td className="text-end">{calculations.totalN2O?.toFixed(3) ?? '—'}</td>
                    <td className="text-end fw-semibold text-success">{calculations.totalCO2e?.toFixed(3) ?? '—'}</td>
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
