import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Row, Col, Card, CardBody, CardHeader, Table, Badge,
  Button, Spinner, Alert
} from 'reactstrap';
import MainCard from 'components/MainCard';
import { downloadCarbonReportPDF, downloadCarbonReportExcel } from 'utils/reportGenerator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SCOPE_COLOR = { 1: 'primary', 2: 'success', 3: 'warning' };

const safe = (n) => (parseFloat(n) || 0).toFixed(2);

export default function CarbonReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/admin/orgusers/${id}/carbon-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching carbon data:', err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async () => {
    const current = data?.orguser?.reportVisible;
    const action = current ? 'hide' : 'release';
    const result = await Swal.fire({
      title: current ? 'Hide Report?' : 'Release Report to User?',
      text: current
        ? 'The user will no longer be able to download the report.'
        : 'The user will be able to download their carbon footprint report.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: current ? '#d33' : '#28a745',
      confirmButtonText: current ? 'Yes, hide it' : 'Yes, release it'
    });

    if (!result.isConfirmed) return;

    try {
      setToggling(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/admin/orgusers/${id}/toggle-visibility`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Done!', res.data.message, 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to update visibility', 'error');
    } finally {
      setToggling(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/admin/orgusers/${id}/recalculate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Done!', 'All categories recalculated successfully.', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Error', 'Failed to recalculate', 'error');
    } finally {
      setRecalculating(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const allCats = [
        ...(data.categories.scope1 || []),
        ...(data.categories.scope2 || []),
        ...(data.categories.scope3 || [])
      ].map(c => ({ ...c, scope: c.code.startsWith('1') ? 1 : c.code === '2' ? 2 : 3 }));
      downloadCarbonReportPDF(data.orguser, allCats, data.scopeTotals);
    } catch (err) {
      Swal.fire('Error', 'Failed to generate PDF', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const allCats = [
        ...(data.categories.scope1 || []),
        ...(data.categories.scope2 || []),
        ...(data.categories.scope3 || [])
      ].map(c => ({ ...c, scope: c.code.startsWith('1') ? 1 : c.code === '2' ? 2 : 3 }));
      downloadCarbonReportExcel(data.orguser, allCats, data.scopeTotals);
    } catch (err) {
      Swal.fire('Error', 'Failed to generate Excel', 'error');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <MainCard>
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2 text-muted">Loading carbon footprint data...</p>
        </div>
      </MainCard>
    );
  }

  if (!data) return null;

  const { orguser, categories, scopeTotals, reportingPeriod } = data;
  const isReleased = orguser?.reportVisible;

  return (
    <>
      {/* Header */}
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <Button
              color="outline-secondary"
              size="sm"
              onClick={() => navigate('/admin-panel/carbon-reports')}
              className="mb-2"
            >
              <i className="ph ph-arrow-left me-1" /> Back to Reports
            </Button>
            <h4 className="mb-1">
              <i className="ph ph-leaf me-2 text-success" />
              {orguser.organisationName || orguser.email}
            </h4>
            <p className="text-muted mb-0">
              Carbon Footprint Report — {reportingPeriod}
            </p>
          </Col>
          <Col xs="auto">
            <Badge color={isReleased ? 'success' : 'secondary'} className="px-3 py-2">
              {isReleased ? 'Report Released' : 'Not Released'}
            </Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Org Info */}
      <MainCard className="mt-3">
        <h5 className="mb-3">Organization Details</h5>
        <Row>
          {[
            ['Contact Person', orguser.contactPerson],
            ['Email', orguser.email],
            ['Phone', orguser.contactNumber],
            ['Address', orguser.address],
            ['Sites', orguser.numberOfSites],
            ['Employees', orguser.numberOfEmployees]
          ].map(([label, value]) => (
            <Col md={4} key={label} className="mb-2">
              <small className="text-muted d-block">{label}</small>
              <span className="fw-semibold">{value || '—'}</span>
            </Col>
          ))}
        </Row>
      </MainCard>

      {/* Scope 1 */}
      <MainCard className="mt-3">
        <h5 className="mb-3 text-primary">
          <i className="ph ph-factory me-2" />
          Scope 1 — Direct Emissions
        </h5>
        <CategoryTable categories={categories.scope1} />
        <div className="text-end mt-2">
          <strong>Scope 1 Total: {safe(scopeTotals.scope1)} kgCO₂e</strong>
        </div>
      </MainCard>

      {/* Scope 2 */}
      <MainCard className="mt-3">
        <h5 className="mb-3 text-success">
          <i className="ph ph-lightning me-2" />
          Scope 2 — Purchased Electricity
        </h5>
        <CategoryTable categories={categories.scope2} />
        <div className="text-end mt-2">
          <strong>Scope 2 Total: {safe(scopeTotals.scope2)} kgCO₂e</strong>
        </div>
      </MainCard>

      {/* Scope 3 */}
      <MainCard className="mt-3">
        <h5 className="mb-3 text-warning">
          <i className="ph ph-truck me-2" />
          Scope 3 — Other Indirect Emissions
        </h5>
        <CategoryTable categories={categories.scope3} />
        <div className="text-end mt-2">
          <strong>Scope 3 Total: {safe(scopeTotals.scope3)} kgCO₂e</strong>
        </div>
      </MainCard>

      {/* Grand Total */}
      <MainCard className="mt-3">
        <Row className="text-center">
          <Col md={3}>
            <Card className="border-primary h-100">
              <CardBody>
                <h6 className="text-muted">Scope 1</h6>
                <h4 className="text-primary">{safe(scopeTotals.scope1)}</h4>
                <small className="text-muted">kgCO₂e</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-success h-100">
              <CardBody>
                <h6 className="text-muted">Scope 2</h6>
                <h4 className="text-success">{safe(scopeTotals.scope2)}</h4>
                <small className="text-muted">kgCO₂e</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-warning h-100">
              <CardBody>
                <h6 className="text-muted">Scope 3</h6>
                <h4 className="text-warning">{safe(scopeTotals.scope3)}</h4>
                <small className="text-muted">kgCO₂e</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-danger h-100" style={{ backgroundColor: '#fff5f5' }}>
              <CardBody>
                <h6 className="text-muted">Grand Total</h6>
                <h3 className="text-danger">{safe(scopeTotals.grandTotal)}</h3>
                <small className="text-muted">kgCO₂e</small>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </MainCard>

      {/* Action Bar */}
      <MainCard className="mt-3">
        {!isReleased && (
          <Alert color="warning" className="mb-3">
            <i className="ph ph-lock me-2" />
            <strong>Results hidden from user.</strong> The organisation user cannot see any calculated CO₂e values
            in their category screens until you release the report below. Verify all calculations before releasing.
          </Alert>
        )}
        <Row className="align-items-center">
          <Col>
            <Button
              color={isReleased ? 'danger' : 'success'}
              onClick={handleToggleVisibility}
              disabled={toggling}
              className="me-2"
            >
              {toggling ? <Spinner size="sm" /> : (
                isReleased
                  ? <><i className="ph ph-eye-slash me-1" /> Hide Report from User</>
                  : <><i className="ph ph-paper-plane-right me-1" /> Release Report to User</>
              )}
            </Button>
            <Button
              color="outline-secondary"
              onClick={handleRecalculate}
              disabled={recalculating}
              className="me-2"
            >
              {recalculating ? <Spinner size="sm" /> : <><i className="ph ph-calculator me-1" /> Recalculate</>}
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              color="outline-danger"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="me-2"
            >
              <i className="ph ph-file-pdf me-1" /> Download PDF
            </Button>
            <Button
              color="outline-success"
              onClick={handleDownloadExcel}
              disabled={downloading}
            >
              <i className="ph ph-microsoft-excel-logo me-1" /> Download Excel
            </Button>
          </Col>
        </Row>
        {isReleased && (
          <Alert color="success" className="mt-3 mb-0">
            <i className="ph ph-check-circle me-2" />
            Report released to user on{' '}
            {orguser.reportReleasedAt
              ? new Date(orguser.reportReleasedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—'}
          </Alert>
        )}
      </MainCard>
    </>
  );
}

// ——— Input quantity summary per category ———
// Uses rawInputTotals pre-computed by the backend from the actual data arrays
function getInputSummary(code, ri = {}) {
  const n = (v, dec = 2) => (parseFloat(v) || 0).toFixed(dec);

  switch (code) {
    case '1.1':
      return [
        `Wooden Pallets: ${n(ri.woodenPalletsKg)} kg`,
        `Firewood: ${n(ri.firewoodKg)} kg`,
        `Diesel: ${n(ri.dieselL)} L`
      ];
    case '1.2':
      return [`LPG: ${n(ri.lpgKg)} kg`];
    case '1.3':
      return [
        `AC Units: ${ri.acUnits || 0}`,
        `Refrigerators: ${ri.refrigerators || 0}`,
        `Gas Leakage: ${n(ri.gasLeakageKg)} kg`
      ];
    case '1.4':
      return [`CO₂ Refilled: ${n(ri.co2RefilledKg)} kg`];
    case '1.5':
      return [`Trees: ${ri.trees || 0}`];
    case '2':
      return [`Electricity: ${n(ri.electricityKwh)} kWh`];
    case '3.1':
      return [`Diesel: ${n(ri.dieselL)} L`, `Trips: ${ri.trips || 0}`];
    case '3.2':
    case '3.5.1':
      return [`Weight: ${n(ri.weightKg)} kg`, `Tonne·km: ${n(ri.tonneKm)}`];
    case '3.3.1':
    case '3.3.2':
      return [`Quantity: ${n(ri.quantityKg)} kg`, `Tonne·km: ${n(ri.tonneKm)}`];
    case '3.4.1':
    case '3.5.2':
      return [`Weight: ${n(ri.weightTonnes)} t`, `Tonne·km: ${n(ri.tonneKm)}`];
    case '3.2.3a':
    case '3.2.3b':
      return [`Weight: ${n(ri.weightTonnes)} t`, `Tonne·km: ${n(ri.tonneKm)}`];
    default:
      return [];
  }
}

// ——— Category Table Sub-component ———
function CategoryTable({ categories = [] }) {
  return (
    <div className="table-responsive">
      <Table bordered hover size="sm" className="mb-0">
        <thead className="table-light">
          <tr>
            <th>Code</th>
            <th>Category</th>
            <th>Input Quantities</th>
            <th>Data Entered</th>
            <th>Calculated</th>
            <th className="text-end">CO₂e (kg)</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const inputs = getInputSummary(cat.code, cat.rawInputTotals || {});
            return (
              <tr key={cat.code}>
                <td><code>{cat.code}</code></td>
                <td>{cat.title}</td>
                <td>
                  {inputs.length > 0 ? (
                    <ul className="mb-0 ps-3" style={{ fontSize: '0.8rem' }}>
                      {inputs.map((line, i) => <li key={i}>{line}</li>)}
                    </ul>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  <Badge color={cat.dataEntered ? 'success' : 'secondary'}>
                    {cat.dataEntered ? 'Yes' : 'No'}
                  </Badge>
                </td>
                <td>
                  <Badge color={cat.calculated ? 'success' : 'warning'}>
                    {cat.calculated ? 'Yes' : 'Pending'}
                  </Badge>
                </td>
                <td className="text-end fw-bold" style={{ color: cat.totalCO2e < 0 ? 'green' : 'inherit' }}>
                  {(parseFloat(cat.totalCO2e) || 0).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
