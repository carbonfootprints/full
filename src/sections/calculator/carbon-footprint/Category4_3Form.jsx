import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';

// react-bootstrap
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

// project-imports
import MainCard from 'components/MainCard';

// Defra 2025 water supply EF
const WATER_SUPPLY_EF = 0.15311; // kg CO2e / m3

const MONTHS = [
  'Apr-24', 'May-24', 'Jun-24', 'Jul-24', 'Aug-24', 'Sep-24',
  'Oct-24', 'Nov-24', 'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25'
];

function makeTankerRow(month = '') {
  return { month, volumeM3: '', numberOfLoads: '' };
}

function makeDrinkingRow(month = '') {
  return { month, volumeLitres: '' };
}

function makeRecoveredRow(month = '') {
  return { month, volumeM3: '' };
}

function calcLive(tankerRows, drinkingRows) {
  const tankerM3 = tankerRows.reduce((s, r) => s + (parseFloat(r.volumeM3) || 0), 0);
  const drinkingM3 = drinkingRows.reduce((s, r) => s + (parseFloat(r.volumeLitres) || 0) / 1000, 0);
  const totalPurchasedM3 = tankerM3 + drinkingM3;
  return {
    tankerM3,
    drinkingM3,
    totalPurchasedM3,
    co2e: totalPurchasedM3 * WATER_SUPPLY_EF,
  };
}

// ==============================|| CATEGORY 4.3 FORM ||============================== //

export default function Category4_3Form() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const [siteName, setSiteName] = useState('');
  const [tankerRows, setTankerRows] = useState(MONTHS.map(makeTankerRow));
  const [drinkingRows, setDrinkingRows] = useState(MONTHS.map(makeDrinkingRow));
  const [recoveredRows, setRecoveredRows] = useState(MONTHS.map(makeRecoveredRow));
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(false);

  const live = calcLive(tankerRows, drinkingRows);

  useEffect(() => {
    fetchExisting();
  }, []);

  const fetchExisting = async () => {
    try {
      const res = await axiosServices.get(`${apiUrl}/api/carbon/category/4.3`);
      if (res.data?.category?.sites?.length) {
        const site = res.data.category.sites[0];
        setSiteName(site.siteName || '');

        if (site.tankerWaterEntries?.length) {
          setTankerRows(
            site.tankerWaterEntries.map(e => ({
              month: e.month || '',
              volumeM3: e.volumeM3 ?? '',
              numberOfLoads: e.numberOfLoads ?? '',
            }))
          );
        }
        if (site.drinkingWaterEntries?.length) {
          setDrinkingRows(
            site.drinkingWaterEntries.map(e => ({
              month: e.month || '',
              volumeLitres: e.volumeLitres ?? '',
            }))
          );
        }
        if (site.recoveredWaterEntries?.length) {
          setRecoveredRows(
            site.recoveredWaterEntries.map(e => ({
              month: e.month || '',
              volumeM3: e.volumeM3 ?? '',
            }))
          );
        }
        setExisting(true);
      }
    } catch {
      // no existing data — defaults are fine
    }
  };

  // ── Tanker row handlers ──────────────────────────────────────────────────────
  const updateTanker = (idx, field, value) => {
    setTankerRows(rows => rows.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };
  const addTankerRow = () => setTankerRows(rows => [...rows, makeTankerRow()]);
  const removeTankerRow = (idx) => setTankerRows(rows => rows.filter((_, i) => i !== idx));

  // ── Drinking row handlers ────────────────────────────────────────────────────
  const updateDrinking = (idx, field, value) => {
    setDrinkingRows(rows => rows.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };
  const addDrinkingRow = () => setDrinkingRows(rows => [...rows, makeDrinkingRow()]);
  const removeDrinkingRow = (idx) => setDrinkingRows(rows => rows.filter((_, i) => i !== idx));

  // ── Recovered row handlers ───────────────────────────────────────────────────
  const updateRecovered = (idx, field, value) => {
    setRecoveredRows(rows => rows.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };
  const addRecoveredRow = () => setRecoveredRows(rows => [...rows, makeRecoveredRow()]);
  const removeRecoveredRow = (idx) => setRecoveredRows(rows => rows.filter((_, i) => i !== idx));

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const sites = [
        {
          siteName,
          tankerWaterEntries: tankerRows
            .filter(r => parseFloat(r.volumeM3) > 0 || parseInt(r.numberOfLoads) > 0)
            .map(r => ({
              month: r.month,
              volumeM3: parseFloat(r.volumeM3) || 0,
              numberOfLoads: parseInt(r.numberOfLoads) || 0,
            })),
          drinkingWaterEntries: drinkingRows
            .filter(r => parseFloat(r.volumeLitres) > 0)
            .map(r => ({
              month: r.month,
              volumeLitres: parseFloat(r.volumeLitres) || 0,
            })),
          recoveredWaterEntries: recoveredRows
            .filter(r => parseFloat(r.volumeM3) > 0)
            .map(r => ({
              month: r.month,
              volumeM3: parseFloat(r.volumeM3) || 0,
            })),
        },
      ];

      await axiosServices.post(`${apiUrl}/api/carbon/category/4.3`, { sites });

      await Swal.fire({
        icon: 'success',
        title: 'Data Saved',
        text: `Category 4.3 water data saved. CO₂e: ${live.co2e.toFixed(4)} kg`,
        confirmButtonText: 'OK',
      });

      setExisting(true);
      navigate('/calculate/carbon-footprint');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err?.response?.data?.message || 'An error occurred.',
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Clear ────────────────────────────────────────────────────────────────────
  const handleClear = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Clear Data?',
      text: 'This will permanently delete all Category 4.3 water data.',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      confirmButtonColor: '#d33',
    });
    if (!result.isConfirmed) return;

    try {
      await axiosServices.delete(`${apiUrl}/api/carbon/category/4.3`);
      setTankerRows(MONTHS.map(makeTankerRow));
      setDrinkingRows(MONTHS.map(makeDrinkingRow));
      setRecoveredRows(MONTHS.map(makeRecoveredRow));
      setExisting(false);
      Swal.fire({ icon: 'success', title: 'Cleared', text: 'Category 4.3 data removed.' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete data.' });
    }
  };

  return (
    <>
      {/* Header */}
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center gap-3">
              <Button variant="outline-secondary" size="sm" onClick={() => navigate('/calculate/carbon-footprint')}>
                <i className="ph ph-arrow-left me-1" />
                Back
              </Button>
              <div>
                <h4 className="mb-1">Category 4.3 — Water Supply</h4>
                <p className="text-muted mb-0 small">
                  Defra 2025 EF: 0.15311 kg CO₂e/m³
                </p>
              </div>
            </div>
          </Col>
          <Col xs="auto">
            {existing && <Badge bg="success" className="me-2"><i className="ph ph-check me-1" />Data Saved</Badge>}
            <Badge bg="info">Scope 4</Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Live CO2e Summary */}
      <MainCard className="mt-3">
        <Row className="text-center g-3">
          <Col md={3}>
            <div className="bg-light-primary rounded p-3">
              <h5 className="mb-1 text-primary">{live.tankerM3.toFixed(2)} m³</h5>
              <small className="text-muted">Tanker Fresh Water</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-info rounded p-3">
              <h5 className="mb-1 text-info">{(live.drinkingM3 * 1000).toFixed(1)} L</h5>
              <small className="text-muted">Drinking Water ({live.drinkingM3.toFixed(3)} m³)</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-warning rounded p-3">
              <h5 className="mb-1 text-warning">{live.totalPurchasedM3.toFixed(2)} m³</h5>
              <small className="text-muted">Total Purchased</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-success rounded p-3">
              <h5 className="mb-1 text-success">{live.co2e.toFixed(4)} kg CO₂e</h5>
              <small className="text-muted">Emissions</small>
            </div>
          </Col>
        </Row>
        <Alert variant="secondary" className="mt-3 mb-0 py-2 small">
          <strong>Formula:</strong> (Tanker water m³ + Drinking water m³) × 0.15311 kg CO₂e/m³ &nbsp;·&nbsp;
          Recovered/reused water is tracked separately and <strong>excluded</strong> from emissions.
        </Alert>
      </MainCard>

      {/* Site name */}
      <Card className="mt-3">
        <Card.Body>
          <Form.Group as={Row} className="align-items-center">
            <Form.Label column md={2} className="fw-semibold">Site Name</Form.Label>
            <Col md={4}>
              <Form.Control
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                placeholder="Enter site name"
              />
            </Col>
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Tanker Fresh Water */}
      <Card className="mt-3">
        <Card.Header>
          <h5 className="mb-0">
            <i className="ph ph-drop me-2 text-primary" />
            Tanker Fresh Water
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table bordered hover size="sm">
              <thead className="table-light">
                <tr>
                  <th>Month</th>
                  <th>Volume (m³)</th>
                  <th>No. of Loads</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {tankerRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <Form.Control
                        size="sm"
                        value={row.month}
                        onChange={e => updateTanker(idx, 'month', e.target.value)}
                        placeholder="Apr-24"
                      />
                    </td>
                    <td>
                      <Form.Control
                        size="sm"
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.volumeM3}
                        onChange={e => updateTanker(idx, 'volumeM3', e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <Form.Control
                        size="sm"
                        type="number"
                        min="0"
                        value={row.numberOfLoads}
                        onChange={e => updateTanker(idx, 'numberOfLoads', e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td className="text-center">
                      <Button variant="outline-danger" size="sm" onClick={() => removeTankerRow(idx)}>
                        <i className="ph ph-trash" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-secondary fw-semibold">
                  <td>Total</td>
                  <td>{live.tankerM3.toFixed(3)} m³</td>
                  <td>
                    {tankerRows.reduce((s, r) => s + (parseInt(r.numberOfLoads) || 0), 0)} loads
                  </td>
                  <td />
                </tr>
              </tfoot>
            </Table>
          </div>
          <Button variant="outline-primary" size="sm" onClick={addTankerRow}>
            <i className="ph ph-plus me-1" />
            Add Row
          </Button>
        </Card.Body>
      </Card>

      {/* Drinking Water */}
      <Card className="mt-3">
        <Card.Header>
          <h5 className="mb-0">
            <i className="ph ph-cup me-2 text-info" />
            Drinking / Can Water
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table bordered hover size="sm">
              <thead className="table-light">
                <tr>
                  <th>Month</th>
                  <th>Volume (Litres)</th>
                  <th>Volume (m³)</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {drinkingRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <Form.Control
                        size="sm"
                        value={row.month}
                        onChange={e => updateDrinking(idx, 'month', e.target.value)}
                        placeholder="Apr-24"
                      />
                    </td>
                    <td>
                      <Form.Control
                        size="sm"
                        type="number"
                        min="0"
                        step="0.1"
                        value={row.volumeLitres}
                        onChange={e => updateDrinking(idx, 'volumeLitres', e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td className="text-muted small">
                      {((parseFloat(row.volumeLitres) || 0) / 1000).toFixed(4)}
                    </td>
                    <td className="text-center">
                      <Button variant="outline-danger" size="sm" onClick={() => removeDrinkingRow(idx)}>
                        <i className="ph ph-trash" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-secondary fw-semibold">
                  <td>Total</td>
                  <td>{drinkingRows.reduce((s, r) => s + (parseFloat(r.volumeLitres) || 0), 0).toFixed(1)} L</td>
                  <td>{live.drinkingM3.toFixed(4)} m³</td>
                  <td />
                </tr>
              </tfoot>
            </Table>
          </div>
          <Button variant="outline-info" size="sm" onClick={addDrinkingRow}>
            <i className="ph ph-plus me-1" />
            Add Row
          </Button>
        </Card.Body>
      </Card>

      {/* Recovered Water (excluded from CO2e) */}
      <Card className="mt-3">
        <Card.Header>
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0">
              <i className="ph ph-recycle me-2 text-success" />
              Recovered / Reused Water
            </h5>
            <Badge bg="secondary">Excluded from CO₂e</Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <Alert variant="info" className="py-2 small mb-3">
            Recovered water is tracked for reporting purposes but does <strong>not</strong> contribute to emissions.
          </Alert>
          <div className="table-responsive">
            <Table bordered hover size="sm">
              <thead className="table-light">
                <tr>
                  <th>Month</th>
                  <th>Volume (m³)</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {recoveredRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <Form.Control
                        size="sm"
                        value={row.month}
                        onChange={e => updateRecovered(idx, 'month', e.target.value)}
                        placeholder="Apr-24"
                      />
                    </td>
                    <td>
                      <Form.Control
                        size="sm"
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.volumeM3}
                        onChange={e => updateRecovered(idx, 'volumeM3', e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td className="text-center">
                      <Button variant="outline-danger" size="sm" onClick={() => removeRecoveredRow(idx)}>
                        <i className="ph ph-trash" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-secondary fw-semibold">
                  <td>Total</td>
                  <td>{recoveredRows.reduce((s, r) => s + (parseFloat(r.volumeM3) || 0), 0).toFixed(3)} m³</td>
                  <td />
                </tr>
              </tfoot>
            </Table>
          </div>
          <Button variant="outline-success" size="sm" onClick={addRecoveredRow}>
            <i className="ph ph-plus me-1" />
            Add Row
          </Button>
        </Card.Body>
      </Card>

      {/* Actions */}
      <Card className="mt-3">
        <Card.Body>
          <div className="d-flex gap-3 justify-content-end">
            {existing && (
              <Button variant="outline-danger" onClick={handleClear}>
                <i className="ph ph-trash me-1" />
                Clear Data
              </Button>
            )}
            <Button variant="outline-secondary" onClick={() => navigate('/calculate/carbon-footprint')}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
              ) : (
                <><i className="ph ph-floppy-disk me-1" />{existing ? 'Update' : 'Save'} Data</>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
