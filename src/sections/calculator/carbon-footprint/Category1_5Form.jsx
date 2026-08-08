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

const TREE_CO2E_PER_YEAR = 27.5; // kgCO2e per tree per year (IPCC EFDB EF ID: 328656)

const newSite = (siteName = '') => ({ siteName, totalTreeCount: 0 });

// ==============================|| CATEGORY 1.5 FORM ||============================== //

export default function Category1_5Form() {
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
      const res = await axiosServices.get(`${apiUrl}/api/carbon/category/1.6`);
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

  const updateSite = (si, field, value) => {
    const next = [...sites];
    next[si][field] = field === 'totalTreeCount' ? (parseInt(value) || 0) : value;
    setSites(next);
  };

  const handleSave = async () => {
    if (sites.find((s) => !s.siteName.trim())) {
      Swal.fire('Error', 'Please enter a name for all sites', 'error'); return false;
    }
    setSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axiosServices.post(`${apiUrl}/api/carbon/category/1.6`, { sites });
      if (res.data.category?.calculations) setCalculations(res.data.category.calculations);
      Swal.fire({
        icon: 'success', title: 'Data Saved',
        text: 'Category 1.6 data saved successfully. Results will be available once reviewed by the administrator.',
        timer: 2500
      });
      return true;
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save data', 'error'); return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => { if (await handleSave()) navigate('/calculate/carbon-footprint/category/2'); };

  // Live preview of carbon sink
  const totalTrees = sites.reduce((sum, s) => sum + (s.totalTreeCount || 0), 0);
  const totalSinkPreview = -(totalTrees * TREE_CO2E_PER_YEAR);

  return (
    <>
      {/* Header */}
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/calculate/carbon-footprint')} className="mb-2">
              <i className="ph ph-arrow-left me-2" />Back to Categories
            </Button>
            <h4 className="mb-1">Category 1.6 - GHG Sink — Tree Plantation</h4>
            <p className="text-muted mb-0">Enter the total number of trees planted per site</p>
          </Col>
          <Col xs="auto">
            <Badge bg="success" className="px-3 py-2"><i className="ph ph-tree me-2" />Carbon Sink</Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Site Tabs */}
      <MainCard className="mt-3">
        <Alert variant="info" className="mb-3 small">
          <i className="ph ph-info me-2" />
          IPCC EFDB (EF ID: 328656) — Annual carbon accumulation: <strong>0.0075 tC/tree/year</strong> × (44/12) × 1,000
          = <strong>27.5 kgCO₂e per tree per year</strong>. Carbon sink values are reported as <strong>negative</strong> emissions.
        </Alert>

        <Tabs activeKey={activeSiteIndex} onSelect={(k) => setActiveSiteIndex(parseInt(k))} className="mb-4">
          {sites.map((site, si) => (
            <Tab
              key={si}
              eventKey={si}
              title={<span><i className="ph ph-map-pin me-1" />{site.siteName || `Site ${si + 1}`}</span>}
            >
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Site Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" placeholder="Enter site name" value={site.siteName}
                      onChange={(e) => updateSite(si, 'siteName', e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="align-items-end">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Number of Trees Planted</Form.Label>
                    <Form.Control
                      type="number" min="0" step="1"
                      value={site.totalTreeCount || ''}
                      placeholder="0"
                      onChange={(e) => updateSite(si, 'totalTreeCount', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <div className="border rounded p-3 bg-light text-center">
                    <div className="small text-muted">Estimated Carbon Sink</div>
                    <div className="fw-bold text-success fs-5">
                      {(-(site.totalTreeCount || 0) * TREE_CO2E_PER_YEAR).toFixed(1)} kgCO₂e
                    </div>
                    <div className="small text-muted">{site.totalTreeCount || 0} trees × 27.5</div>
                  </div>
                </Col>
              </Row>
            </Tab>
          ))}
        </Tabs>

        {/* Grand total preview */}
        {sites.length > 1 && (
          <div className="border rounded p-3 bg-success bg-opacity-10 text-center mt-2">
            <span className="me-3 text-muted small">All sites combined:</span>
            <strong className="text-success">{totalTrees} trees → {totalSinkPreview.toFixed(1)} kgCO₂e</strong>
          </div>
        )}
      </MainCard>

      {/* Calculation Results — only visible after admin releases results */}
      {calculations && !resultsReleased && <ResultsPendingCard />}
      {calculations && resultsReleased && (
        <MainCard className="mt-3">
          <Stack direction="horizontal" className="justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <i className="ph ph-leaf me-2 text-success" />
              Carbon Sink Results
              <Badge bg="success" className="ms-2 px-3">Category 1.6</Badge>
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
          {showChart && <CategoryChart code="1.6" calculations={calculations} />}

          <Alert variant="light" className="border mb-3 small">
            <strong>Sequestration Factor:</strong> 27.5 kgCO₂e/tree/year (IPCC EFDB EF ID: 328656 — 0.0075 tC/yr × 44/12 × 1,000) &nbsp;|&nbsp;
            <strong>Note:</strong> Negative values = CO₂ removed from atmosphere
          </Alert>

          {calculations.siteCalculations?.map((site, i) => (
            <Card key={i} className="mb-3 border">
              <Card.Header className="bg-light fw-semibold d-flex justify-content-between">
                <span><i className="ph ph-map-pin me-2" />{site.siteName}</span>
                <span className="text-success">Sink: <strong>{site.totalCarbonSink?.toFixed(1)} kgCO₂e</strong></span>
              </Card.Header>
              <Card.Body className="p-0">
                <Table bordered size="sm" className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Source</th>
                      <th className="text-end">Trees</th>
                      <th className="text-end">kgCO₂e/tree/yr</th>
                      <th className="text-end">Carbon Sink (kgCO₂e)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Tree Plantation</td>
                      <td className="text-end">{site.trees}</td>
                      <td className="text-end">{site.carbonSinkPerTree}</td>
                      <td className="text-end fw-semibold text-success">{site.totalCarbonSink?.toFixed(1)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))}

          <Card className="border-success">
            <Card.Header className="bg-success text-white fw-semibold">Grand Total — All Sites (Category 1.6)</Card.Header>
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Source</th>
                    <th className="text-end">Total Trees</th>
                    <th className="text-end">Total Carbon Sink (kgCO₂e)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tree Plantation</td>
                    <td className="text-end">{calculations.totalTrees}</td>
                    <td className="text-end fw-semibold text-success">{calculations.totalCarbonSink?.toFixed(1) ?? '—'}</td>
                  </tr>
                  <tr className="table-success fw-bold">
                    <td>Grand Total</td>
                    <td className="text-end">—</td>
                    <td className="text-end text-success">{calculations.totalCO2e?.toFixed(1) ?? '—'}</td>
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
