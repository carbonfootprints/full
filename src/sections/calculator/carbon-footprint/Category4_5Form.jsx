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
import InputGroup from 'react-bootstrap/InputGroup';

// project-imports
import MainCard from 'components/MainCard';

// UK GHG Conversion Factors 2025 — sea freight (kg / t.km)
const SEA_EF = {
  co2:  0.01592,
  ch4:  0.00001,
  n2o:  0.00019,
};
// Combined CO2e factor
const SEA_EF_TOTAL = SEA_EF.co2 + SEA_EF.ch4 + SEA_EF.n2o; // 0.01612

const makeWasteBatch = () => ({ wasteType: '', weightTonnes: '', distanceKm: '' });
const makeDefaultBatches = () => [makeWasteBatch()];

const makeSite = (name = '') => ({
  siteName: name,
  wasteBatches: makeDefaultBatches(),
  disposalEmissionsKgCO2e: '',
});

const calcBatchCO2e = (batch) =>
  (parseFloat(batch.weightTonnes) || 0) * (parseFloat(batch.distanceKm) || 0) * SEA_EF_TOTAL;

const calcSiteTransportCO2e = (batches) =>
  batches.reduce((sum, b) => sum + calcBatchCO2e(b), 0);

const calcSiteTotalCO2e = (site) =>
  calcSiteTransportCO2e(site.wasteBatches) + (parseFloat(site.disposalEmissionsKgCO2e) || 0);

// ==============================|| CATEGORY 4.5 FORM ||============================== //

export default function Category4_5Form() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const [sites, setSites] = useState([makeSite('BAB Pernambut')]);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(false);

  const grandTotal = sites.reduce((sum, site) => sum + calcSiteTotalCO2e(site), 0);

  useEffect(() => {
    fetchExisting();
  }, []);

  const fetchExisting = async () => {
    try {
      const res = await axiosServices.get(`${apiUrl}/api/carbon/category/4.5`);
      if (res.data?.category?.sites?.length) {
        const loaded = res.data.category.sites.map((s) => ({
          siteName: s.siteName || '',
          wasteBatches: s.wasteBatches?.length
            ? s.wasteBatches.map((b) => ({
                wasteType: b.wasteType || '',
                weightTonnes: b.weightTonnes ?? '',
                distanceKm: b.distanceKm ?? '',
              }))
            : makeDefaultBatches(),
          disposalEmissionsKgCO2e: s.disposalEmissionsKgCO2e ?? '',
        }));
        setSites(loaded);
        setExisting(true);
      }
    } catch {
      // no existing data — defaults are fine
    }
  };

  // ── Site handlers ─────────────────────────────────────────────────────────────
  const addSite = () => setSites((prev) => [...prev, makeSite()]);
  const removeSite = (sIdx) => setSites((prev) => prev.filter((_, i) => i !== sIdx));
  const updateSiteName = (sIdx, value) =>
    setSites((prev) => prev.map((s, i) => (i === sIdx ? { ...s, siteName: value } : s)));
  const updateDisposal = (sIdx, value) =>
    setSites((prev) =>
      prev.map((s, i) => (i === sIdx ? { ...s, disposalEmissionsKgCO2e: value } : s))
    );

  // ── Waste batch row handlers ──────────────────────────────────────────────────
  const addBatch = (sIdx) =>
    setSites((prev) =>
      prev.map((s, i) =>
        i === sIdx ? { ...s, wasteBatches: [...s.wasteBatches, makeWasteBatch()] } : s
      )
    );

  const removeBatch = (sIdx, rIdx) =>
    setSites((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? { ...s, wasteBatches: s.wasteBatches.filter((_, ri) => ri !== rIdx) }
          : s
      )
    );

  const updateBatch = (sIdx, rIdx, field, value) =>
    setSites((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              wasteBatches: s.wasteBatches.map((b, ri) =>
                ri === rIdx ? { ...b, [field]: value } : b
              ),
            }
          : s
      )
    );

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        sites: sites.map((s) => ({
          siteName: s.siteName,
          wasteBatches: s.wasteBatches
            .filter(
              (b) =>
                b.wasteType.trim() ||
                parseFloat(b.weightTonnes) > 0 ||
                parseFloat(b.distanceKm) > 0
            )
            .map((b) => ({
              wasteType: b.wasteType,
              weightTonnes: parseFloat(b.weightTonnes) || 0,
              distanceKm: parseFloat(b.distanceKm) || 0,
            })),
          disposalEmissionsKgCO2e: parseFloat(s.disposalEmissionsKgCO2e) || 0,
        })),
      };

      await axiosServices.post(`${apiUrl}/api/carbon/category/4.5`, payload);

      await Swal.fire({
        icon: 'success',
        title: 'Data Saved',
        text: `Category 4.5 solid waste transportation data saved. Total CO₂e: ${grandTotal.toFixed(4)} kg`,
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

  // ── Clear ─────────────────────────────────────────────────────────────────────
  const handleClear = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Clear Data?',
      text: 'This will permanently delete all Category 4.5 solid waste transportation data.',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      confirmButtonColor: '#d33',
    });
    if (!result.isConfirmed) return;

    try {
      await axiosServices.delete(`${apiUrl}/api/carbon/category/4.5`);
      setSites([makeSite('BAB Pernambut')]);
      setExisting(false);
      Swal.fire({ icon: 'success', title: 'Cleared', text: 'Category 4.5 data removed.' });
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
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => navigate('/calculate/carbon-footprint')}
              >
                <i className="ph ph-arrow-left me-1" />
                Back
              </Button>
              <div>
                <h4 className="mb-1">Category 4.5 — Solid Waste Transportation</h4>
                <p className="text-muted mb-0 small">
                  Sea freight · UK GHG Conversion Factors 2025 · Combined EF:{' '}
                  {SEA_EF_TOTAL.toFixed(5)} kg CO₂e/t.km
                </p>
              </div>
            </div>
          </Col>
          <Col xs="auto">
            {existing && (
              <Badge bg="success" className="me-2">
                <i className="ph ph-check me-1" />
                Data Saved
              </Badge>
            )}
            <Badge bg="info">Scope 4</Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Formula note */}
      <MainCard className="mt-3">
        <Alert variant="info" className="mb-0 small">
          <i className="ph ph-info me-2" />
          <strong>Formula:</strong> For each waste batch: CO₂e = weight (t) × distance (km) ×{' '}
          {SEA_EF_TOTAL.toFixed(5)} kg CO₂e/t.km &nbsp;·&nbsp; Site Total = Transport CO₂e +
          Disposal CO₂e &nbsp;·&nbsp; Sea EFs — CO₂: {SEA_EF.co2} · CH₄: {SEA_EF.ch4} · N₂O:{' '}
          {SEA_EF.n2o} kg/t.km (UK GHG Conv. Factors 2025).
        </Alert>
      </MainCard>

      {/* Grand total summary */}
      <MainCard className="mt-3">
        <Row className="text-center g-3">
          <Col md={4}>
            <div className="bg-light-primary rounded p-3">
              <h5 className="mb-1 text-primary">{sites.length}</h5>
              <small className="text-muted">Site(s)</small>
            </div>
          </Col>
          <Col md={4}>
            <div className="bg-light-warning rounded p-3">
              <h5 className="mb-1 text-warning">
                {sites
                  .reduce((sum, s) => sum + calcSiteTransportCO2e(s.wasteBatches), 0)
                  .toFixed(4)}{' '}
                kg
              </h5>
              <small className="text-muted">Transport CO₂e</small>
            </div>
          </Col>
          <Col md={4}>
            <div className="bg-light-success rounded p-3">
              <h5 className="mb-1 text-success">{grandTotal.toFixed(4)} kg CO₂e</h5>
              <small className="text-muted">Grand Total Emissions</small>
            </div>
          </Col>
        </Row>
      </MainCard>

      {/* Sites */}
      {sites.map((site, sIdx) => {
        const transportCO2e = calcSiteTransportCO2e(site.wasteBatches);
        const disposalCO2e = parseFloat(site.disposalEmissionsKgCO2e) || 0;
        const siteTotalCO2e = transportCO2e + disposalCO2e;

        return (
          <Card className="mt-3" key={sIdx}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3 flex-grow-1">
                <h5 className="mb-0">
                  <i className="ph ph-truck me-2 text-primary" />
                  Site {sIdx + 1}
                </h5>
                <Form.Control
                  size="sm"
                  style={{ maxWidth: 260 }}
                  placeholder="Site name"
                  value={site.siteName}
                  onChange={(e) => updateSiteName(sIdx, e.target.value)}
                />
              </div>
              <div className="d-flex align-items-center gap-2">
                <Badge bg="primary" className="px-3">
                  {siteTotalCO2e.toFixed(4)} kg CO₂e
                </Badge>
                {sites.length > 1 && (
                  <Button variant="outline-danger" size="sm" onClick={() => removeSite(sIdx)}>
                    <i className="ph ph-trash" />
                  </Button>
                )}
              </div>
            </Card.Header>

            <Card.Body>
              {/* Waste batches table */}
              <h6 className="mb-2">
                <i className="ph ph-package me-1 text-warning" />
                Waste Batches (Sea Freight)
              </h6>
              <div className="table-responsive mb-3">
                <Table bordered hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Waste Type</th>
                      <th style={{ width: 160 }}>Weight (tonnes)</th>
                      <th style={{ width: 160 }}>Distance (km)</th>
                      <th style={{ width: 180 }}>CO₂e (kg)</th>
                      <th style={{ width: 60 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {site.wasteBatches.map((batch, rIdx) => (
                      <tr key={rIdx}>
                        <td>
                          <Form.Control
                            size="sm"
                            placeholder="e.g. Leather offcuts"
                            value={batch.wasteType}
                            onChange={(e) =>
                              updateBatch(sIdx, rIdx, 'wasteType', e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="number"
                            min="0"
                            step="0.001"
                            placeholder="0"
                            value={batch.weightTonnes}
                            onChange={(e) =>
                              updateBatch(sIdx, rIdx, 'weightTonnes', e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            value={batch.distanceKm}
                            onChange={(e) =>
                              updateBatch(sIdx, rIdx, 'distanceKm', e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            readOnly
                            tabIndex={-1}
                            className="bg-light text-warning fw-semibold"
                            value={calcBatchCO2e(batch).toFixed(4)}
                          />
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeBatch(sIdx, rIdx)}
                          >
                            <i className="ph ph-x" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-secondary fw-semibold">
                      <td colSpan={3}>Transport Subtotal</td>
                      <td className="text-warning">{transportCO2e.toFixed(4)} kg CO₂e</td>
                      <td />
                    </tr>
                  </tfoot>
                </Table>
              </div>
              <Button
                variant="outline-warning"
                size="sm"
                className="mb-3"
                onClick={() => addBatch(sIdx)}
              >
                <i className="ph ph-plus me-1" />
                Add Waste Batch
              </Button>

              {/* Disposal emissions */}
              <div className="border rounded p-3 bg-light">
                <h6 className="mb-2">
                  <i className="ph ph-recycle me-1 text-danger" />
                  Landfill / Disposal Emissions
                </h6>
                <Row className="align-items-center g-2">
                  <Col md={5}>
                    <Form.Label className="small mb-1">
                      Total Disposal CO₂e (direct entry)
                    </Form.Label>
                    <InputGroup size="sm">
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.0001"
                        placeholder="0"
                        value={site.disposalEmissionsKgCO2e}
                        onChange={(e) => updateDisposal(sIdx, e.target.value)}
                      />
                      <InputGroup.Text>kg CO₂e</InputGroup.Text>
                    </InputGroup>
                  </Col>
                  <Col md={7}>
                    <div className="d-flex gap-3 mt-3">
                      <div className="border rounded p-2 text-center flex-fill">
                        <small className="text-muted d-block">Transport CO₂e</small>
                        <span className="fw-bold text-warning">{transportCO2e.toFixed(4)} kg</span>
                      </div>
                      <div className="border rounded p-2 text-center flex-fill">
                        <small className="text-muted d-block">Disposal CO₂e</small>
                        <span className="fw-bold text-danger">{disposalCO2e.toFixed(4)} kg</span>
                      </div>
                      <div className="border rounded p-2 bg-success bg-opacity-10 text-center flex-fill">
                        <small className="text-muted d-block">Site Total CO₂e</small>
                        <span className="fw-bold text-success">{siteTotalCO2e.toFixed(4)} kg</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        );
      })}

      {/* Add Site button */}
      <div className="mt-3">
        <Button variant="outline-secondary" onClick={addSite}>
          <i className="ph ph-plus-circle me-1" />
          Add Site
        </Button>
      </div>

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
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/calculate/carbon-footprint')}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="ph ph-floppy-disk me-1" />
                  {existing ? 'Update' : 'Save'} Data
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
