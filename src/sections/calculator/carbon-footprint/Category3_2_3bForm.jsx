import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosServices from 'utils/axios';
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
import ResultsPendingCard from 'components/ResultsPendingCard';
import CategoryChart from 'components/CategoryChart';
import useResultsReleased from 'hooks/useResultsReleased';

const ROAD_FREIGHT_EF = 0.160; // kg CO2e per tonne.km

const newEntry = () => ({
  date: '',
  gatePass: '',
  agency: '',
  wasteName: '',
  weightTonnes: 0,
  agencyLocation: '',
  distanceKm: 0,
  disposalType: ''
});

const newSite = (siteName = '') => ({ siteName, consignments: [newEntry()] });

// ==============================|| CATEGORY 3.2.3b FORM ||============================== //

export default function Category3_2_3bForm() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [activeSiteIndex, setActiveSiteIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [calculations, setCalculations] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const resultsReleased = useResultsReleased();

  useEffect(() => { fetchCategoryData(); }, []);

  const initFromOrgSites = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axiosServices.get(`${apiUrl}/api/orguser/organization-details`);
      const orgSites = (res.data.organizationDetails?.sites || []).filter((s) => s.isActive);
      setSites(orgSites.length > 0 ? orgSites.map((s) => newSite(s.siteName)) : [newSite()]);
      setActiveSiteIndex(0);
    } catch {
      setSites([newSite()]);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axiosServices.get(`${apiUrl}/api/carbon/category/3.2.3b`);
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
    next[si].consignments = [...(next[si].consignments || []), newEntry()];
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
      ['weightTonnes', 'distanceKm'].includes(field) ? (parseFloat(value) || 0) : value;
    setSites(next);
  };

  // Live preview — weight already in tonnes
  const rowTkm  = (c) => (c.weightTonnes || 0) * (c.distanceKm || 0);
  const rowCO2e = (c) => rowTkm(c) * ROAD_FREIGHT_EF;
  const siteTotalTkm  = (site) => (site.consignments || []).reduce((s, c) => s + rowTkm(c), 0);
  const siteTotalCO2e = (site) => (site.consignments || []).reduce((s, c) => s + rowCO2e(c), 0);

  const handleSave = async () => {
    if (sites.find((s) => !s.siteName.trim())) {
      Swal.fire('Error', 'Please enter a name for all sites', 'error'); return false;
    }
    setSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axiosServices.post(`${apiUrl}/api/carbon/category/3.2.3b`, { sites });
      if (res.data.category?.calculations) setCalculations(res.data.category.calculations);
      Swal.fire({
        icon: 'success', title: 'Data Saved',
        text: 'Category 3.2.3b data saved successfully. Results will be available once reviewed by the administrator.',
        timer: 2500
      });
      return true;
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save data', 'error'); return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => { if (await handleSave()) navigate('/calculate/carbon-footprint'); };

  return (
    <>
      {/* Header */}
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/calculate/carbon-footprint')} className="mb-2">
              <i className="ph ph-arrow-left me-2" />Back to Categories
            </Button>
            <h4 className="mb-1">Category 3.2.3b - Downstream Road Transportation (Solid Wastes — Thirumudivakkam)</h4>
            <p className="text-muted mb-0">Waste dispatch data — weight (tonnes) × distance = t·km → CO₂e</p>
          </Col>
          <Col xs="auto">
            <Badge bg="warning" text="dark" className="px-3 py-2"><i className="ph ph-recycle me-2" />Scope 3</Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Site Tabs */}
      <MainCard className="mt-3">
        <Alert variant="info" className="mb-3 small">
          <i className="ph ph-info me-2" />
          EF: <strong>160 gm/t·km = 0.160 kg CO₂e/t·km</strong> — Road Freight, India
          (Source: Carbon Dioxide Emissions From Various Transport Modes In India, data.gov.in).
          CO₂e = Weight (tonnes) × Distance km × 0.160
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
                        <th style={{ minWidth: 130 }}>Gate Pass / Invoice</th>
                        <th style={{ minWidth: 160 }}>Waste Handling Agency</th>
                        <th style={{ minWidth: 140 }}>Waste Name</th>
                        <th style={{ minWidth: 100 }}>Weight (t)</th>
                        <th style={{ minWidth: 140 }}>Agency Location</th>
                        <th style={{ minWidth: 110 }}>Distance (km)</th>
                        <th style={{ minWidth: 120 }}>Disposal Type</th>
                        <th className="text-end" style={{ minWidth: 90 }}>t·km</th>
                        <th className="text-end" style={{ minWidth: 100 }}>CO₂e (kg)</th>
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
                              <Form.Control size="sm" type="text" placeholder="e.g., 1201063818"
                                value={c.gatePass || ''}
                                onChange={(e) => updateRow(si, ri, 'gatePass', e.target.value)} />
                            </td>
                            <td>
                              <Form.Control size="sm" type="text" placeholder="e.g., GREEN GENE ENVIRO"
                                value={c.agency || ''}
                                onChange={(e) => updateRow(si, ri, 'agency', e.target.value)} />
                            </td>
                            <td>
                              <Form.Control size="sm" type="text" placeholder="e.g., CHEMICAL SLUDGE"
                                value={c.wasteName || ''}
                                onChange={(e) => updateRow(si, ri, 'wasteName', e.target.value)} />
                            </td>
                            <td>
                              <Form.Control size="sm" type="number" min="0" step="0.001"
                                value={c.weightTonnes || ''} placeholder="0.000"
                                onChange={(e) => updateRow(si, ri, 'weightTonnes', e.target.value)} />
                            </td>
                            <td>
                              <Form.Control size="sm" type="text" placeholder="e.g., Ranipet"
                                value={c.agencyLocation || ''}
                                onChange={(e) => updateRow(si, ri, 'agencyLocation', e.target.value)} />
                            </td>
                            <td>
                              <Form.Control size="sm" type="number" min="0" step="1"
                                value={c.distanceKm || ''} placeholder="0"
                                onChange={(e) => updateRow(si, ri, 'distanceKm', e.target.value)} />
                            </td>
                            <td>
                              <Form.Control size="sm" type="text" placeholder="e.g., Free of cost"
                                value={c.disposalType || ''}
                                onChange={(e) => updateRow(si, ri, 'disposalType', e.target.value)} />
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
                        <td colSpan={8}>Total</td>
                        <td className="text-end">{totalTkm.toFixed(3)}</td>
                        <td className="text-end text-success">{totalCO2e.toFixed(3)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>

                <Button variant="outline-primary" size="sm" onClick={() => addRow(si)}>
                  <i className="ph ph-plus me-1" />Add Entry
                </Button>
              </Tab>
            );
          })}
        </Tabs>
      </MainCard>

      {/* Calculation Results — only visible after admin releases results */}
      {calculations && !resultsReleased && <ResultsPendingCard />}
      {calculations && resultsReleased && (
        <MainCard className="mt-3">
          <Stack direction="horizontal" className="justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <i className="ph ph-chart-bar me-2 text-success" />
              CO₂e Emission Results
              <Badge bg="success" className="ms-2 px-3">Category 3.2.3b</Badge>
            </h5>
            <Button
              variant={showChart ? 'success' : 'outline-success'}
              size="sm"
              onClick={() => setShowChart((v) => !v)}
            >
              <i className={`ph ${showChart ? 'ph-table' : 'ph-chart-bar'} me-1`} />
              {showChart ? 'Show Table' : 'Show Chart'}
            </Button>
          </Stack>
          {showChart && <CategoryChart code="3.2.3b" calculations={calculations} />}

          <Alert variant="light" className="border mb-3 small">
            <strong>Calculation:</strong> CO₂e = Weight (tonnes) × Distance km × 0.160 kg CO₂e/t·km
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
                      <th className="text-end">Total CO₂e (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{site.totalWeightTonnes?.toFixed(3)}</td>
                      <td className="text-end">{site.totalTonneKm?.toFixed(3)}</td>
                      <td className="text-end fw-semibold text-success">{site.totalCO2e?.toFixed(3)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))}

          <Card className="border-success">
            <Card.Header className="bg-success text-white fw-semibold">Grand Total — All Sites (Category 3.2.3b)</Card.Header>
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Total Weight (t)</th>
                    <th className="text-end">Total t·km</th>
                    <th className="text-end">Total CO₂e (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{calculations.totalWeightTonnes?.toFixed(3) ?? '—'}</td>
                    <td className="text-end">{calculations.totalTonneKm?.toFixed(3) ?? '—'}</td>
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
