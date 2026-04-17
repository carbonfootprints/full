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
import ResultsPendingCard from 'components/ResultsPendingCard';
import useResultsReleased from 'hooks/useResultsReleased';
import { getCurrentFinancialYearMonths } from 'utils/reportingPeriod';

const MONTHS = getCurrentFinancialYearMonths();

const ELECTRICITY_EF = 0.727; // kgCO2/kWh — CEA India Version 20 December 2024

const newFacility = (name = '') => ({
  facilityName: name,
  isExcluded: false,
  monthlyData: MONTHS.map((month) => ({ month, kWh: 0 }))
});

const newSite = (siteName = '') => ({ siteName, facilities: [newFacility()] });

// ==============================|| CATEGORY 2 FORM ||============================== //

export default function Category2Form() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [activeSiteIndex, setActiveSiteIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [calculations, setCalculations] = useState(null);
  const resultsReleased = useResultsReleased();

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
      const res = await axios.get(`${apiUrl}/api/carbon/category/2`, {
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

  // ——— Facility CRUD ———
  const addFacility = (si) => {
    const next = [...sites];
    next[si].facilities = [...(next[si].facilities || []), newFacility()];
    setSites(next);
  };

  const removeFacility = (si, fi) => {
    const next = [...sites];
    next[si].facilities = next[si].facilities.filter((_, i) => i !== fi);
    setSites(next);
  };

  const updateFacilityName = (si, fi, value) => {
    const next = [...sites];
    next[si].facilities[fi].facilityName = value;
    setSites(next);
  };

  const toggleExcluded = (si, fi) => {
    const next = [...sites];
    next[si].facilities[fi].isExcluded = !next[si].facilities[fi].isExcluded;
    setSites(next);
  };

  const updateKWh = (si, fi, monthIndex, value) => {
    const next = [...sites];
    next[si].facilities[fi].monthlyData[monthIndex].kWh = parseFloat(value) || 0;
    setSites(next);
  };

  // ——— Live preview ———
  const facilityTotal = (facility) =>
    (facility.monthlyData || []).reduce((s, m) => s + (m.kWh || 0), 0);

  const siteIncludedKWh = (site) =>
    (site.facilities || []).filter((f) => !f.isExcluded).reduce((s, f) => s + facilityTotal(f), 0);

  // ——— Save ———
  const handleSave = async () => {
    if (sites.find((s) => !s.siteName.trim())) {
      Swal.fire('Error', 'Please enter a name for all sites', 'error'); return false;
    }
    for (const site of sites) {
      if ((site.facilities || []).find((f) => !f.facilityName.trim())) {
        Swal.fire('Error', `Please enter a name for all facilities in site "${site.siteName}"`, 'error');
        return false;
      }
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${apiUrl}/api/carbon/category/2`, { sites }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.category?.calculations) setCalculations(res.data.category.calculations);
      Swal.fire({
        icon: 'success', title: 'Data Saved',
        text: 'Category 2 data saved successfully. Results will be available once reviewed by the administrator.',
        timer: 2500
      });
      return true;
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save data', 'error'); return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => { if (await handleSave()) navigate('/calculate/carbon-footprint/category/3.1'); };

  return (
    <>
      {/* Header */}
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/calculate/carbon-footprint')} className="mb-2">
              <i className="ph ph-arrow-left me-2" />Back to Categories
            </Button>
            <h4 className="mb-1">Category 2 - Purchased Electricity</h4>
            <p className="text-muted mb-0">Enter monthly electricity consumption per facility per site</p>
          </Col>
          <Col xs="auto">
            <Badge bg="warning" className="px-3 py-2"><i className="ph ph-lightning me-2" />Scope 2</Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Site Tabs */}
      <MainCard className="mt-3">
        <Alert variant="info" className="mb-3 small">
          <i className="ph ph-info me-2" />
          CEA India Grid EF: <strong>0.727 kgCO₂/kWh</strong> (Version 20 December 2024). Mark facilities as
          <strong> Excluded</strong> if electricity is not purchased/consumed by the reporting organisation (e.g. CETP).
        </Alert>

        <Tabs activeKey={activeSiteIndex} onSelect={(k) => setActiveSiteIndex(parseInt(k))} className="mb-4">
          {sites.map((site, si) => (
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

              {(site.facilities || []).map((facility, fi) => {
                const facTotal = facilityTotal(facility);
                const facCO2 = facility.isExcluded ? 0 : facTotal * ELECTRICITY_EF;
                return (
                  <Card key={fi} className={`mb-4 border ${facility.isExcluded ? 'border-secondary opacity-75' : 'border-primary'}`}>
                    <Card.Header className="d-flex align-items-center gap-2 flex-wrap">
                      <Form.Control
                        size="sm" type="text" placeholder="Facility name (e.g., Tannery, CETP)"
                        value={facility.facilityName}
                        onChange={(e) => updateFacilityName(si, fi, e.target.value)}
                        style={{ maxWidth: 240 }}
                      />
                      <Form.Check
                        type="switch"
                        id={`exclude-${si}-${fi}`}
                        label={<span className="small text-danger fw-semibold">Exclude from calculation</span>}
                        checked={!!facility.isExcluded}
                        onChange={() => toggleExcluded(si, fi)}
                        className="ms-2"
                      />
                      {facility.isExcluded && (
                        <Badge bg="secondary" className="ms-1">Excluded</Badge>
                      )}
                      <div className="ms-auto d-flex align-items-center gap-2">
                        <span className="small text-muted">
                          {facTotal.toFixed(0)} kWh
                          {!facility.isExcluded && <> → <strong className="text-success">{facCO2.toFixed(1)} kgCO₂</strong></>}
                          {facility.isExcluded && <> → <strong className="text-secondary">0 kgCO₂ (excluded)</strong></>}
                        </span>
                        {(site.facilities || []).length > 1 && (
                          <Button variant="outline-danger" size="sm" onClick={() => removeFacility(si, fi)}>
                            <i className="ph ph-trash" />
                          </Button>
                        )}
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <Table bordered hover size="sm" className="mb-0">
                          <thead className="table-light">
                            <tr>
                              <th style={{ minWidth: 100 }}>Month</th>
                              <th style={{ minWidth: 160 }}>Electricity (kWh)</th>
                              <th className="text-end" style={{ minWidth: 140 }}>CO₂ (kgCO₂)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(facility.monthlyData || []).map((md, mi) => {
                              const rowCO2 = facility.isExcluded ? 0 : (md.kWh || 0) * ELECTRICITY_EF;
                              return (
                                <tr key={mi}>
                                  <td className="fw-bold align-middle">{md.month}</td>
                                  <td>
                                    <Form.Control
                                      size="sm" type="number" min="0" step="0.01"
                                      value={md.kWh || ''} placeholder="0.00"
                                      onChange={(e) => updateKWh(si, fi, mi, e.target.value)}
                                    />
                                  </td>
                                  <td className="text-end align-middle fw-semibold">
                                    {facility.isExcluded
                                      ? <span className="text-muted">—</span>
                                      : rowCO2.toFixed(3)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="table-light fw-bold">
                              <td>Total</td>
                              <td>{facTotal.toFixed(2)} kWh</td>
                              <td className="text-end">
                                {facility.isExcluded
                                  ? <span className="text-muted">— (excluded)</span>
                                  : <span className="text-success">{facCO2.toFixed(3)} kgCO₂</span>}
                              </td>
                            </tr>
                          </tfoot>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}

              <Button variant="outline-primary" size="sm" onClick={() => addFacility(si)}>
                <i className="ph ph-plus me-1" />Add Facility
              </Button>

              {/* Site total preview */}
              <div className="border rounded p-3 bg-light mt-3 d-flex justify-content-between align-items-center">
                <span className="text-muted small">Site total (included facilities only):</span>
                <strong className="text-success">{siteIncludedKWh(site).toFixed(0)} kWh → {(siteIncludedKWh(site) * ELECTRICITY_EF).toFixed(1)} kgCO₂</strong>
              </div>
            </Tab>
          ))}
        </Tabs>
      </MainCard>

      {/* Calculation Results — only visible after admin releases results */}
      {calculations && !resultsReleased && <ResultsPendingCard />}
      {calculations && resultsReleased && (
        <MainCard className="mt-3">
          <h5 className="mb-3">
            <i className="ph ph-chart-bar me-2 text-success" />
            CO₂e Emission Results
            <Badge bg="success" className="ms-2 px-3">Category 2</Badge>
          </h5>

          <Alert variant="light" className="border mb-3 small">
            <strong>Emission Factor:</strong> 0.727 kgCO₂/kWh (CEA India Grid EF, Version 20 December 2024) &nbsp;|&nbsp;
            <strong>Note:</strong> Excluded facilities (e.g., CETP not owned by organisation) are not counted.
          </Alert>

          {calculations.siteCalculations?.map((site, i) => (
            <Card key={i} className="mb-3 border">
              <Card.Header className="bg-light fw-semibold d-flex justify-content-between">
                <span><i className="ph ph-map-pin me-2" />{site.siteName}</span>
                <span>Site total: <strong>{site.totalCO2?.toFixed(3)} kgCO₂</strong></span>
              </Card.Header>
              <Card.Body className="p-0">
                <Table bordered size="sm" className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Facility</th>
                      <th className="text-end">kWh</th>
                      <th className="text-end">kgCO₂</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {site.facilityDetails?.map((fac, j) => (
                      <tr key={j} className={fac.isExcluded ? 'text-muted' : ''}>
                        <td>{fac.facilityName}</td>
                        <td className="text-end">{fac.totalKWh?.toFixed(2)}</td>
                        <td className="text-end fw-semibold">{fac.isExcluded ? '—' : fac.co2?.toFixed(3)}</td>
                        <td className="text-center">
                          {fac.isExcluded
                            ? <Badge bg="secondary">Excluded</Badge>
                            : <Badge bg="success">Included</Badge>}
                        </td>
                      </tr>
                    ))}
                    <tr className="table-success fw-bold">
                      <td colSpan={2}>Total — {site.siteName}</td>
                      <td className="text-end">{site.totalCO2?.toFixed(3)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))}

          <Card className="border-success">
            <Card.Header className="bg-success text-white fw-semibold">Grand Total — All Sites (Category 2)</Card.Header>
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Source</th>
                    <th className="text-end">Total kWh</th>
                    <th className="text-end">Total CO₂ (kgCO₂)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Purchased Electricity</td>
                    <td className="text-end">{calculations.totalKWh?.toFixed(2) ?? '—'}</td>
                    <td className="text-end fw-semibold">{calculations.totalCO2?.toFixed(3) ?? '—'}</td>
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
