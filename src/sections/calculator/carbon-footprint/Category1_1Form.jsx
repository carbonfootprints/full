import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';

// react-bootstrap
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

// project-imports
import MainCard from 'components/MainCard';
import ResultsPendingCard from 'components/ResultsPendingCard';
import CategoryChart from 'components/CategoryChart';
import useResultsReleased from 'hooks/useResultsReleased';
import { getReportingMonths, getCurrentFinancialYearMonths } from 'utils/reportingPeriod';

const MONTHS = getCurrentFinancialYearMonths();

// ==============================|| CATEGORY 1.1 FORM ||============================== //

export default function Category1_1Form() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [activeSiteIndex, setActiveSiteIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calculations, setCalculations] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const resultsReleased = useResultsReleased();

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const initFromOrgSites = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axiosServices.get(`${apiUrl}/api/orguser/organization-details`);
      const orgSites = (res.data.organizationDetails?.sites || []).filter((s) => s.isActive);
      if (orgSites.length > 0) {
        setSites(
          orgSites.map((s) => ({
            siteName: s.siteName,
            monthlyData: MONTHS.map((month) => ({
              month,
              woodenPallets: 0,
              firewood: 0,
              diesel: 0
            })),
            totalWoodenPallets: 0,
            totalFirewood: 0,
            totalDiesel: 0
          }))
        );
        setActiveSiteIndex(0);
      } else {
        await initFromOrgSites();
      }
    } catch {
      setSites([{
        siteName: '',
        monthlyData: MONTHS.map((month) => ({ month, woodenPallets: 0, firewood: 0, diesel: 0 })),
        totalWoodenPallets: 0,
        totalFirewood: 0,
        totalDiesel: 0
      }]);
      setActiveSiteIndex(0);
    }
  };

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const res = await axiosServices.get(`${apiUrl}/api/carbon/category/1.1`);

      if (res.data.category && res.data.category.sites && res.data.category.sites.length > 0) {
        setSites(res.data.category.sites);
        if (res.data.category.calculations) setCalculations(res.data.category.calculations);
      } else {
        // Initialize with one default site
        await initFromOrgSites();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Initialize with one default site if error
      await initFromOrgSites();
    } finally {
      setLoading(false);
    }
  };

  const handleSiteNameChange = (index, value) => {
    const newSites = [...sites];
    newSites[index].siteName = value;
    setSites(newSites);
  };

  const handleMonthlyDataChange = (siteIndex, monthIndex, field, value) => {
    const newSites = [...sites];
    const numValue = parseFloat(value) || 0;
    newSites[siteIndex].monthlyData[monthIndex][field] = numValue;

    // Calculate totals for this site
    calculateSiteTotals(newSites[siteIndex]);
    setSites(newSites);
  };

  const calculateSiteTotals = (site) => {
    site.totalWoodenPallets = site.monthlyData.reduce((sum, m) => sum + m.woodenPallets, 0);
    site.totalFirewood = site.monthlyData.reduce((sum, m) => sum + m.firewood, 0);
    site.totalDiesel = site.monthlyData.reduce((sum, m) => sum + m.diesel, 0);
  };

  const getGrandTotals = () => {
    return {
      woodenPallets: sites.reduce((sum, site) => sum + site.totalWoodenPallets, 0),
      firewood: sites.reduce((sum, site) => sum + site.totalFirewood, 0),
      diesel: sites.reduce((sum, site) => sum + site.totalDiesel, 0)
    };
  };

  const handleSave = async () => {
    // Validate
    const invalidSite = sites.find((site) => !site.siteName.trim());
    if (invalidSite) {
      Swal.fire('Error', 'Please enter a name for all sites', 'error');
      return false;
    }

    setSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const res = await axiosServices.post(`${apiUrl}/api/carbon/category/1.1`, { sites });

      if (res.data.category?.calculations) {
        setCalculations(res.data.category.calculations);
      }

      Swal.fire({
        icon: 'success',
        title: 'Data Saved',
        text: 'Category 1.1 data saved successfully. Results will be available once reviewed by the administrator.',
        timer: 2500
      });
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save data', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    const success = await handleSave();
    if (success) navigate('/calculate/carbon-footprint/category/1.2');
  };

  const grandTotals = getGrandTotals();

  return (
    <>
      {/* Header */}
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/calculate/carbon-footprint')} className="mb-2">
              <i className="ph ph-arrow-left me-2" />
              Back to Categories
            </Button>
            <h4 className="mb-1">Category 1.1 - Stationary Combustion (Industrial)</h4>
            <p className="text-muted mb-0">Enter monthly fuel consumption data for wooden pallets, firewood, and diesel</p>
          </Col>
          <Col xs="auto">
            <Badge bg="primary" className="px-3 py-2">
              <i className="ph ph-factory me-2" />
              Scope 1
            </Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Sites Tabs */}
      <MainCard className="mt-3">
        <Tabs activeKey={activeSiteIndex} onSelect={(k) => setActiveSiteIndex(parseInt(k))} className="mb-3">
          {sites.map((site, index) => (
            <Tab
              key={index}
              eventKey={index}
              title={
                <span>
                  <i className="ph ph-map-pin me-1" />
                  {site.siteName || `Site ${index + 1}`}
                </span>
              }
            >
              {/* Site Name Input */}
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Site Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., BAB Pernambut"
                      value={site.siteName}
                      onChange={(e) => handleSiteNameChange(index, e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Monthly Data Table */}
              <Alert variant="info" className="mb-3">
                <i className="ph ph-info me-2" />
                Enter monthly consumption data. Values will be automatically totaled.
              </Alert>

              <div className="table-responsive">
                <Table bordered hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: '120px' }}>Month</th>
                      <th style={{ minWidth: '150px' }}>
                        Wooden Pallets (kg)
                        <i className="ph ph-info ms-1" title="Wooden pallets consumed"></i>
                      </th>
                      <th style={{ minWidth: '150px' }}>
                        Firewood (kg)
                        <i className="ph ph-info ms-1" title="Firewood consumed"></i>
                      </th>
                      <th style={{ minWidth: '150px' }}>
                        Diesel (litres)
                        <i className="ph ph-info ms-1" title="Diesel consumed"></i>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {site.monthlyData.map((monthData, monthIndex) => (
                      <tr key={monthIndex}>
                        <td className="fw-bold">{monthData.month}</td>
                        <td>
                          <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            value={monthData.woodenPallets || ''}
                            onChange={(e) => handleMonthlyDataChange(index, monthIndex, 'woodenPallets', e.target.value)}
                            placeholder="0.00"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            value={monthData.firewood || ''}
                            onChange={(e) => handleMonthlyDataChange(index, monthIndex, 'firewood', e.target.value)}
                            placeholder="0.00"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            value={monthData.diesel || ''}
                            onChange={(e) => handleMonthlyDataChange(index, monthIndex, 'diesel', e.target.value)}
                            placeholder="0.00"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>
          ))}
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
              <Badge bg="success" className="ms-2 px-3">Category 1.1</Badge>
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
          {showChart && <CategoryChart code="1.1" calculations={calculations} />}

          {/* Emission factors reference */}
          <Alert variant="light" className="border mb-3 small">
            <strong>IPCC Emission Factors Used:</strong>
            &nbsp;Wood NCV: 16.6 MJ/kg (EF 18349) &nbsp;|&nbsp; CO₂: 112,000 kg/TJ (EF 117971) &nbsp;|&nbsp; N₂O: 4 kg/TJ (EF 18175)
            &nbsp;|&nbsp; CH₄: 300 kg/TJ (EF 17210) &nbsp;|&nbsp; Diesel NCV: 43 TJ/kt (EF 117453) &nbsp;|&nbsp; CO₂: 74,100 kg/TJ (EF
            117776) &nbsp;|&nbsp; N₂O: 0.6 kg/TJ (EF 117830) &nbsp;|&nbsp; CH₄: 3 kg/TJ (EF 117830)
          </Alert>

          {/* Per-site breakdown */}
          {calculations.siteCalculations && calculations.siteCalculations.length > 0 && (
            <>
              <h6 className="text-muted mb-2">Per-Site Breakdown</h6>
              {calculations.siteCalculations.map((site, i) => (
                <Card key={i} className="mb-3 border">
                  <Card.Header className="bg-light fw-semibold">
                    <i className="ph ph-map-pin me-2" />
                    {site.siteName}
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table bordered size="sm" className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Fuel Type</th>
                          <th className="text-end">CO₂ (kg)</th>
                          <th className="text-end">N₂O (kg)</th>
                          <th className="text-end">CH₄ (kg)</th>
                          <th className="text-end">Total CO₂e (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Wooden Pallets &amp; Wood</td>
                          <td className="text-end">{site.woodenPalletsAndWood.co2.toFixed(3)}</td>
                          <td className="text-end">{site.woodenPalletsAndWood.n2o.toFixed(3)}</td>
                          <td className="text-end">{site.woodenPalletsAndWood.ch4.toFixed(3)}</td>
                          <td className="text-end fw-semibold">{site.woodenPalletsAndWood.totalCO2e.toFixed(3)}</td>
                        </tr>
                        <tr>
                          <td>Diesel</td>
                          <td className="text-end">{site.diesel.co2.toFixed(3)}</td>
                          <td className="text-end">{site.diesel.n2o.toFixed(3)}</td>
                          <td className="text-end">{site.diesel.ch4.toFixed(3)}</td>
                          <td className="text-end fw-semibold">{site.diesel.totalCO2e.toFixed(3)}</td>
                        </tr>
                        <tr className="table-success fw-bold">
                          <td>Total — {site.siteName}</td>
                          <td className="text-end">—</td>
                          <td className="text-end">—</td>
                          <td className="text-end">—</td>
                          <td className="text-end">{site.totalForSite.toFixed(3)}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              ))}
            </>
          )}

          {/* Grand total summary */}
          <Card className="border-success">
            <Card.Header className="bg-success text-white fw-semibold">Grand Total — All Sites (Category 1.1)</Card.Header>
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Source</th>
                    <th className="text-end">CO₂ (kgCO₂e)</th>
                    <th className="text-end">N₂O (kgCO₂e)</th>
                    <th className="text-end">CH₄ (kgCO₂e)</th>
                    <th className="text-end">Total CO₂e (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Wooden Pallets &amp; Wood</td>
                    <td className="text-end">{calculations.woodCO2?.toFixed(3) ?? '—'}</td>
                    <td className="text-end">{calculations.woodN2O?.toFixed(3) ?? '—'}</td>
                    <td className="text-end">{calculations.woodCH4?.toFixed(3) ?? '—'}</td>
                    <td className="text-end fw-semibold">{calculations.woodTotalCO2e?.toFixed(3) ?? '—'}</td>
                  </tr>
                  <tr>
                    <td>Diesel</td>
                    <td className="text-end">{calculations.dieselCO2?.toFixed(3) ?? '—'}</td>
                    <td className="text-end">{calculations.dieselN2O?.toFixed(3) ?? '—'}</td>
                    <td className="text-end">{calculations.dieselCH4?.toFixed(3) ?? '—'}</td>
                    <td className="text-end fw-semibold">{calculations.dieselTotalCO2e?.toFixed(3) ?? '—'}</td>
                  </tr>
                  <tr className="table-success fw-bold">
                    <td>Grand Total</td>
                    <td className="text-end">{calculations.totalCO2?.toFixed(3) ?? '—'}</td>
                    <td className="text-end">{calculations.totalN2O?.toFixed(3) ?? '—'}</td>
                    <td className="text-end">{calculations.totalCH4?.toFixed(3) ?? '—'}</td>
                    <td className="text-end text-success">{calculations.totalCO2e?.toFixed(3) ?? '—'}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Alert variant="info" className="mt-3 small mb-0">
            <i className="ph ph-leaf me-2" />
            <strong>Biogenic CO₂ from wood combustion:</strong> {calculations.totalBiogenicCarbon?.toFixed(3) ?? '—'} kgCO₂e — reported
            separately per ISO 14064-1 (not included in Scope 1 total)
          </Alert>
        </MainCard>
      )}

      {/* Action Buttons */}
      <MainCard className="mt-3">
        <Stack direction="horizontal" gap={2} className="justify-content-end">
          <Button variant="outline-secondary" onClick={() => navigate('/calculate/carbon-footprint')} disabled={saving}>
            Cancel
          </Button>
          <Button variant="outline-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save & Calculate'}
          </Button>
          <Button variant="primary" onClick={handleSaveAndNext} disabled={saving}>
            {saving ? (
              'Saving...'
            ) : (
              <>
                Save & Next
                <i className="ph ph-arrow-right ms-2" />
              </>
            )}
          </Button>
        </Stack>
      </MainCard>
    </>
  );
}
