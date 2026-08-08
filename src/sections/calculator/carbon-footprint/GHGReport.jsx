import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import axiosServices from 'utils/axios';

// react-bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';

// ==============================|| HELPERS ||============================== //

const fmt = (n) => {
  const rounded = Math.round(n || 0);
  if (rounded === 0) return '';
  return rounded.toLocaleString();
};

const fmtNum = (n) => Math.round(n || 0).toLocaleString();

const fmtDec = (n, d = 2) => (n || 0).toFixed(d);

// ==============================|| GHG REPORT PAGE ||============================== //

export default function GHGReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axiosServices.get(`${apiUrl}/api/orguser/report-data`);
      setData(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to load report';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" variant="success" />
        <span className="ms-3 text-muted">Loading GHG Report…</span>
      </div>
    );
  }

  // ── Error / not released ──────────────────────────────────────────────────
  if (error) {
    return (
      <Card className="border-warning">
        <Card.Body className="text-center py-5">
          <i className="ph ph-lock text-warning" style={{ fontSize: '3rem' }} />
          <h5 className="mt-3 text-warning">Report Not Available</h5>
          <p className="text-muted">{error}</p>
          <Button variant="outline-primary" onClick={() => navigate('/calculate/carbon-footprint')}>
            <i className="ph ph-arrow-left me-2" />
            Back to Calculator
          </Button>
        </Card.Body>
      </Card>
    );
  }

  // ── Destructure API response ──────────────────────────────────────────────
  const { orguser, categories = [], scopeTotals = {}, derivedMetrics = {}, reportingPeriod } = data || {};
  const { scope1 = 0, scope2 = 0, scope3 = 0, scope4 = 0, scope5 = 0, grandTotal = 0 } = scopeTotals;
  const { productionAreaM2 = 0, biogenicCO2e = 0, weightFinishedLeatherKg = 0 } = derivedMetrics;

  // Helper to look up a category by DB code
  const getCat = (code) => categories.find((c) => c.code === code) || {};

  const gas = (code, field) => getCat(code)?.gasBreakdown?.[field] || 0;
  const total = (code) => getCat(code)?.totalCO2e || 0;

  // Combined codes
  const waste3_5 = total('3.2.3a') + total('3.2.3b');
  const wasteGasCo2 = gas('3.2.3a', 'co2') + gas('3.2.3b', 'co2');
  const wasteGasCh4 = gas('3.2.3a', 'ch4') + gas('3.2.3b', 'ch4');
  const wasteGasN2o = gas('3.2.3a', 'n2o') + gas('3.2.3b', 'n2o');

  const chem4_2 = total('4.2.a') + total('4.2.b');

  // Scope totals for the table
  const scope3Total = scope3;
  const externalTotal = scope3 + scope4 + scope5;

  // Carbon intensity
  const ciOverall = productionAreaM2 > 0 ? grandTotal / productionAreaM2 : 0;
  const ciCore = productionAreaM2 > 0 ? (scope1 + scope2) / productionAreaM2 : 0;
  const ciAll = productionAreaM2 > 0 ? grandTotal / productionAreaM2 : 0;
  const ciBiogenic = productionAreaM2 > 0 ? biogenicCO2e / productionAreaM2 : 0;
  const ciWeight = weightFinishedLeatherKg > 0 ? grandTotal / weightFinishedLeatherKg : 0;

  // Release date formatted
  const releasedAt = orguser?.reportReleasedAt
    ? new Date(orguser.reportReleasedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '—';

  // ── Chart helpers ─────────────────────────────────────────────────────────
  const buildPieChart = (rawLabels, rawValues, colors) => {
    const pairs = rawLabels.map((l, i) => ({ label: l, value: rawValues[i] || 0 })).filter((p) => p.value > 0);
    return {
      series: pairs.map((p) => Math.round(p.value)),
      options: {
        chart: { type: 'pie' },
        labels: pairs.map((p) => p.label),
        colors: colors ? pairs.map((_, i) => colors[i % colors.length]) : undefined,
        legend: { position: 'bottom' },
        dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
        responsive: [{ breakpoint: 480, options: { chart: { width: 300 }, legend: { position: 'bottom' } } }]
      }
    };
  };

  const scopePie = buildPieChart(
    ['1 Direct GHG', '2 Purchased Energy', '3 Transportation', '4 Products Used', '5 Use of Products'],
    [scope1, scope2, scope3, scope4, scope5],
    ['#FF4560', '#008FFB', '#00E396', '#FEB019', '#775DD0']
  );

  const cat4Pie = buildPieChart(
    ['Tanned leather', 'Chemicals', 'Wastewater', 'Water', 'Solid waste', 'Purchased services', 'Job work'],
    [total('4.1'), chem4_2, total('4.4'), total('4.3'), total('4.5'), total('4.6'), total('4.7')],
    ['#FF4560', '#FEB019', '#00E396', '#008FFB', '#775DD0', '#FF66C3', '#546E7A']
  );

  const scopeBarChart = {
    series: [{ name: 'kgCO₂e', data: [scope1, scope2, scope3, scope4, scope5].map((v) => Math.round(v)) }],
    options: {
      chart: { type: 'bar', toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
      xaxis: { categories: ['Scope 1 (Direct)', 'Scope 2 (Electricity)', 'Scope 3 (Transport)', 'Scope 4 (Products)', 'Scope 5 (Use)'] },
      colors: ['#00897B'],
      dataLabels: { enabled: true, formatter: (val) => Math.round(val).toLocaleString() },
      tooltip: { y: { formatter: (val) => `${Math.round(val).toLocaleString()} kgCO₂e` } }
    }
  };

  // ── Row helpers for the quantification table ──────────────────────────────
  const CatRow = ({ label, subCat, description, co2, ch4, n2o, tot, isNegative }) => (
    <tr style={isNegative ? { color: '#28a745' } : undefined}>
      <td>{label}</td>
      <td>{subCat}</td>
      <td>{description}</td>
      <td className="text-end">{fmt(co2)}</td>
      <td className="text-end">{fmt(ch4)}</td>
      <td className="text-end">{fmt(n2o)}</td>
      <td className="text-end fw-semibold">{fmt(tot)}</td>
    </tr>
  );

  const SubtotalRow = ({ label, value, colSpan = 6 }) => (
    <tr className="table-light fw-bold">
      <td colSpan={colSpan}>{label}</td>
      <td className="text-end">{fmtNum(value)}</td>
    </tr>
  );

  const CategoryHeader = ({ label }) => (
    <tr className="table-secondary">
      <td colSpan={7} className="fw-bold">{label}</td>
    </tr>
  );

  const MetricRow = ({ label, value }) => (
    <tr className="table-light">
      <td colSpan={6} className="fw-semibold">{label}</td>
      <td className="text-end fw-semibold">{value}</td>
    </tr>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── A. Page Header (no-print nav) ─────────────────────────────────── */}
      <div className="d-flex align-items-center justify-content-between mb-4 no-print">
        <Button variant="outline-secondary" onClick={() => navigate('/calculate/carbon-footprint')}>
          <i className="ph ph-arrow-left me-2" />
          Back
        </Button>
        <div className="d-flex align-items-center gap-3">
          <Badge bg="success" className="px-3 py-2" style={{ fontSize: '0.85rem' }}>
            ISO 14064-1 Report
          </Badge>
          <Button variant="primary" onClick={() => window.print()}>
            <i className="ph ph-printer me-2" />
            Print / Download PDF
          </Button>
        </div>
      </div>

      {/* ── B. GHG Statement Table ────────────────────────────────────────── */}
      <Card className="mb-4">
        <Card.Header className="bg-success text-white">
          <h5 className="mb-0">GHG Statement — ISO 14064-1 Conformance</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table bordered size="sm" className="mb-0">
            <tbody>
              <tr>
                <td className="fw-semibold" style={{ width: '30%' }}>Document No.</td>
                <td>BAB/GHG</td>
                <td className="fw-semibold">Revision</td>
                <td>1</td>
                <td className="fw-semibold">Date</td>
                <td>{releasedAt}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Reporting Company</td>
                <td colSpan={5}>{orguser?.organisationName || '—'} — GHG Emissions and Removals</td>
              </tr>
              <tr>
                <td className="fw-semibold">Person Responsible</td>
                <td colSpan={5}>{orguser?.contactPerson || '—'}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Reporting Period</td>
                <td colSpan={5}>{reportingPeriod || '—'}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Organisational Boundaries</td>
                <td colSpan={5}>{orguser?.numberOfSites ? `${orguser.numberOfSites} Facilities` : '—'}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Reporting Standard</td>
                <td colSpan={5}>ISO 14064-1</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* ── C. Consolidated GHG Quantification Table ─────────────────────── */}
      <Card className="mb-4">
        <Card.Header className="bg-dark text-white">
          <h5 className="mb-0">Consolidated GHG Quantification — All Scopes (kgCO₂e)</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div style={{ overflowX: 'auto' }}>
            <Table bordered size="sm" className="mb-0" style={{ fontSize: '0.82rem' }}>
              <thead className="table-dark">
                <tr>
                  <th>Category</th>
                  <th>Sub-category</th>
                  <th>Description</th>
                  <th className="text-end">CO₂ (kgCO₂e)</th>
                  <th className="text-end">CH₄ (kgCO₂e)</th>
                  <th className="text-end">N₂O (kgCO₂e)</th>
                  <th className="text-end">Total (kgCO₂e)</th>
                </tr>
              </thead>
              <tbody>
                {/* ── Category 1 ── */}
                <CategoryHeader label="Category 1 — Direct GHG Emissions (Scope 1)" />
                <CatRow
                  label="1" subCat="1.1"
                  description="Stationary combustion of fuels: Industrial use"
                  co2={gas('1.1', 'co2')} ch4={gas('1.1', 'ch4')} n2o={gas('1.1', 'n2o')} tot={total('1.1')}
                />
                <CatRow
                  label="1" subCat="1.2"
                  description="Stationary combustion of fuels: Domestic use"
                  co2={gas('1.2', 'co2')} ch4={gas('1.2', 'ch4')} n2o={gas('1.2', 'n2o')} tot={total('1.2')}
                />
                <CatRow
                  label="1" subCat="1.3"
                  description="Refrigerant — use and leaks"
                  co2={gas('1.3', 'co2')} ch4={gas('1.3', 'ch4')} n2o={gas('1.3', 'n2o')} tot={total('1.3')}
                />
                <CatRow
                  label="1" subCat="1.4"
                  description="Fire extinguishers — used for demo"
                  co2={gas('1.4', 'co2')} ch4={gas('1.4', 'ch4')} n2o={gas('1.4', 'n2o')} tot={total('1.4')}
                />
                <CatRow
                  label="1" subCat="1.5"
                  description="GHG sink — tree plantation"
                  co2={gas('1.6', 'co2')} ch4={gas('1.6', 'ch4')} n2o={gas('1.6', 'n2o')} tot={total('1.6')}
                  isNegative
                />
                <CatRow
                  label="1" subCat="1.6"
                  description="Transport fuel combustion — own vehicles, between 2 plants"
                  co2={gas('3.1', 'co2')} ch4={gas('3.1', 'ch4')} n2o={gas('3.1', 'n2o')} tot={total('3.1')}
                />

                {/* ── Category 2 ── */}
                <CategoryHeader label="Category 2 — Indirect GHG Emissions from Purchased Energy (Scope 2)" />
                <CatRow
                  label="2" subCat="2.1"
                  description="Purchased electricity"
                  co2={gas('2', 'co2')} ch4={gas('2', 'ch4')} n2o={gas('2', 'n2o')} tot={total('2')}
                />

                {/* Core subtotals */}
                <SubtotalRow label="Subtotal — Total Core Processes (Category 1 + Category 2)" value={scope1 + scope2} />
                <MetricRow label="Production Area (m²)" value={fmtNum(productionAreaM2)} />
                <MetricRow
                  label="Carbon Intensity — Core (kgCO₂e/m²)"
                  value={productionAreaM2 > 0 ? fmtDec(ciCore) : '—'}
                />

                {/* ── Category 3 ── */}
                <CategoryHeader label="Category 3 — Indirect GHG Emissions from Transportation (Scope 3)" />
                <CatRow
                  label="3" subCat="3.1"
                  description="Upstream road transportation — Tanned leather"
                  co2={gas('3.2', 'co2')} ch4={gas('3.2', 'ch4')} n2o={gas('3.2', 'n2o')} tot={total('3.2')}
                />
                <CatRow
                  label="3" subCat="3.2.1"
                  description="Upstream road transportation — Chemicals (site 1)"
                  co2={gas('3.3.1', 'co2')} ch4={gas('3.3.1', 'ch4')} n2o={gas('3.3.1', 'n2o')} tot={total('3.3.1')}
                />
                <CatRow
                  label="3" subCat="3.2.2"
                  description="Upstream road transportation — Chemicals (site 2)"
                  co2={gas('3.3.2', 'co2')} ch4={gas('3.3.2', 'ch4')} n2o={gas('3.3.2', 'n2o')} tot={total('3.3.2')}
                />
                <CatRow
                  label="3" subCat="3.3.1"
                  description="Upstream sea transportation — Chemicals (site 1)"
                  co2={gas('3.4.1', 'co2')} ch4={gas('3.4.1', 'ch4')} n2o={gas('3.4.1', 'n2o')} tot={total('3.4.1')}
                />
                <CatRow
                  label="3" subCat="3.3.2"
                  description="Upstream sea transportation — Chemicals (site 2)"
                  co2={gas('3.4.2', 'co2')} ch4={gas('3.4.2', 'ch4')} n2o={gas('3.4.2', 'n2o')} tot={total('3.4.2')}
                />
                <CatRow
                  label="3" subCat="3.4.1"
                  description="Downstream transportation road — finished leather"
                  co2={gas('3.5.1', 'co2')} ch4={gas('3.5.1', 'ch4')} n2o={gas('3.5.1', 'n2o')} tot={total('3.5.1')}
                />
                <CatRow
                  label="3" subCat="3.4.2"
                  description="Downstream transportation sea — finished leather"
                  co2={gas('3.5.2', 'co2')} ch4={gas('3.5.2', 'ch4')} n2o={gas('3.5.2', 'n2o')} tot={total('3.5.2')}
                />
                <CatRow
                  label="3" subCat="3.5"
                  description="Downstream road transportation — solid wastes (sites 1 + 2)"
                  co2={wasteGasCo2} ch4={wasteGasCh4} n2o={wasteGasN2o} tot={waste3_5}
                />
                <CatRow
                  label="3" subCat="3.6"
                  description="Employee commuting, business travels"
                  co2={gas('3.6', 'co2')} ch4={gas('3.6', 'ch4')} n2o={gas('3.6', 'n2o')} tot={total('3.6')}
                />

                {/* ── Category 4 ── */}
                <CategoryHeader label="Category 4 — Indirect GHG Emissions from Products Used (Scope 4)" />
                <CatRow
                  label="4" subCat="4.1"
                  description="Tanned leather"
                  co2={gas('4.1', 'co2')} ch4={gas('4.1', 'ch4')} n2o={gas('4.1', 'n2o')} tot={total('4.1')}
                />
                <CatRow
                  label="4" subCat="4.2.1"
                  description="Retanning chemicals consumption"
                  co2={gas('4.2.a', 'co2')} ch4={gas('4.2.a', 'ch4')} n2o={gas('4.2.a', 'n2o')} tot={total('4.2.a')}
                />
                <CatRow
                  label="4" subCat="4.2.2"
                  description="Finishing chemicals"
                  co2={gas('4.2.b', 'co2')} ch4={gas('4.2.b', 'ch4')} n2o={gas('4.2.b', 'n2o')} tot={total('4.2.b')}
                />
                <CatRow
                  label="4" subCat="4.3"
                  description="Water"
                  co2={gas('4.3', 'co2')} ch4={gas('4.3', 'ch4')} n2o={gas('4.3', 'n2o')} tot={total('4.3')}
                />
                <CatRow
                  label="4" subCat="4.4"
                  description="Wastewater"
                  co2={gas('4.4', 'co2')} ch4={gas('4.4', 'ch4')} n2o={gas('4.4', 'n2o')} tot={total('4.4')}
                />
                <CatRow
                  label="4" subCat="4.5"
                  description="Solid waste utilisation and disposal"
                  co2={gas('4.5', 'co2')} ch4={gas('4.5', 'ch4')} n2o={gas('4.5', 'n2o')} tot={total('4.5')}
                />
                <CatRow
                  label="4" subCat="4.6"
                  description="Purchased services"
                  co2={gas('4.6', 'co2')} ch4={gas('4.6', 'ch4')} n2o={gas('4.6', 'n2o')} tot={total('4.6')}
                />
                <CatRow
                  label="4" subCat="4.7"
                  description="Purchased services — Job work"
                  co2={gas('4.7', 'co2')} ch4={gas('4.7', 'ch4')} n2o={gas('4.7', 'n2o')} tot={total('4.7')}
                />

                {/* ── Category 5 ── */}
                <CategoryHeader label="Category 5 — Indirect GHG Emissions from Use of Products (Scope 5)" />
                <CatRow
                  label="5" subCat="5.1"
                  description="Energy use in leather upholstery manufacturing"
                  co2={gas('5.1', 'co2')} ch4={gas('5.1', 'ch4')} n2o={gas('5.1', 'n2o')} tot={total('5.1')}
                />
                <CatRow
                  label="5" subCat="5.2"
                  description="Disposal of products (landfill)"
                  co2={gas('5.2', 'co2')} ch4={gas('5.2', 'ch4')} n2o={gas('5.2', 'n2o')} tot={total('5.2')}
                />

                {/* ── Grand totals ── */}
                <SubtotalRow label="Total for External (Scope 3 + Scope 4 + Scope 5)" value={externalTotal} />

                <tr className="fw-bold" style={{ backgroundColor: '#fff3cd' }}>
                  <td colSpan={6} className="fw-bold" style={{ fontSize: '1rem' }}>TOTAL EMISSIONS</td>
                  <td className="text-end fw-bold" style={{ fontSize: '1rem' }}>{fmtNum(grandTotal)}</td>
                </tr>

                <MetricRow
                  label="CARBON INTENSITY (kgCO₂e/m²)"
                  value={productionAreaM2 > 0 ? fmtDec(ciAll) : '—'}
                />
                <MetricRow
                  label="BIOGENIC CARBON EMISSION (kgCO₂e)"
                  value={fmtNum(biogenicCO2e)}
                />
                <MetricRow
                  label="BIOGENIC CARBON EMISSION INTENSITY (kgCO₂e/m²)"
                  value={productionAreaM2 > 0 ? fmtDec(ciBiogenic) : '—'}
                />
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* ── D. Analysis Section — Charts ─────────────────────────────────── */}
      <div className="page-break" />
      <h5 className="mb-3 mt-4">Analysis — GHG Emission Breakdown</h5>

      <Row className="mb-4">
        {/* Chart 1: Scope breakdown pie */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Consolidated Statement of GHG Quantification</h6>
            </Card.Header>
            <Card.Body>
              {scopePie.series.length > 0 ? (
                <ReactApexChart
                  type="pie"
                  series={scopePie.series}
                  options={scopePie.options}
                  height={350}
                />
              ) : (
                <p className="text-muted text-center py-5">No data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Chart 2: Category 4 breakdown pie */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Share of Sub-categories in Category 4 (Products Used)</h6>
            </Card.Header>
            <Card.Body>
              {cat4Pie.series.length > 0 ? (
                <ReactApexChart
                  type="pie"
                  series={cat4Pie.series}
                  options={cat4Pie.options}
                  height={350}
                />
              ) : (
                <p className="text-muted text-center py-5">No data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chart 3: Horizontal bar — all scopes */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">GHG Emissions by Scope Category (kgCO₂e)</h6>
        </Card.Header>
        <Card.Body>
          <ReactApexChart
            type="bar"
            series={scopeBarChart.series}
            options={scopeBarChart.options}
            height={280}
          />
        </Card.Body>
      </Card>

      {/* ── E. Carbon Intensity Cards ─────────────────────────────────────── */}
      <div className="page-break" />
      <h5 className="mb-3 mt-4">Carbon Intensity &amp; Key Metrics</h5>
      <Row className="mb-4">
        <Col sm={6} lg={4} className="mb-3">
          <Card className="border-primary h-100">
            <Card.Body className="text-center">
              <div className="text-primary mb-2" style={{ fontSize: '1.8rem' }}>
                <i className="ph ph-cloud" />
              </div>
              <h6 className="text-muted">Total Emissions</h6>
              <h4 className="mb-0">{fmtNum(grandTotal)}</h4>
              <small className="text-muted">kgCO₂e</small>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={4} className="mb-3">
          <Card className="border-info h-100">
            <Card.Body className="text-center">
              <div className="text-info mb-2" style={{ fontSize: '1.8rem' }}>
                <i className="ph ph-ruler" />
              </div>
              <h6 className="text-muted">Production Area</h6>
              <h4 className="mb-0">{fmtNum(productionAreaM2)}</h4>
              <small className="text-muted">m²</small>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={4} className="mb-3">
          <Card className="border-success h-100">
            <Card.Body className="text-center">
              <div className="text-success mb-2" style={{ fontSize: '1.8rem' }}>
                <i className="ph ph-chart-line-up" />
              </div>
              <h6 className="text-muted">Carbon Intensity (Overall)</h6>
              <h4 className="mb-0">{productionAreaM2 > 0 ? fmtDec(ciOverall) : '—'}</h4>
              <small className="text-muted">kgCO₂e/m²</small>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={4} className="mb-3">
          <Card className="border-warning h-100">
            <Card.Body className="text-center">
              <div className="text-warning mb-2" style={{ fontSize: '1.8rem' }}>
                <i className="ph ph-factory" />
              </div>
              <h6 className="text-muted">Carbon Intensity (Core)</h6>
              <h4 className="mb-0">{productionAreaM2 > 0 ? fmtDec(ciCore) : '—'}</h4>
              <small className="text-muted">kgCO₂e/m² (Scope 1+2)</small>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={4} className="mb-3">
          <Card className="border-success h-100">
            <Card.Body className="text-center">
              <div className="text-success mb-2" style={{ fontSize: '1.8rem' }}>
                <i className="ph ph-tree" />
              </div>
              <h6 className="text-muted">Biogenic Carbon</h6>
              <h4 className="mb-0">{fmtNum(biogenicCO2e)}</h4>
              <small className="text-muted">kgCO₂e (wood combustion)</small>
            </Card.Body>
          </Card>
        </Col>

        {weightFinishedLeatherKg > 0 && (
          <Col sm={6} lg={4} className="mb-3">
            <Card className="border-secondary h-100">
              <Card.Body className="text-center">
                <div className="text-secondary mb-2" style={{ fontSize: '1.8rem' }}>
                  <i className="ph ph-scales" />
                </div>
                <h6 className="text-muted">Carbon Intensity by Weight</h6>
                <h4 className="mb-0">{fmtDec(ciWeight)}</h4>
                <small className="text-muted">kgCO₂e/kg finished leather</small>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* ── F. Print CSS ─────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 12px; }
          .page-break { page-break-before: always; }
        }
      `}</style>
    </>
  );
}
