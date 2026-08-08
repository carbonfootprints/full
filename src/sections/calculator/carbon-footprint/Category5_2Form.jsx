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

// EF source: Defra GHG Conversion Factors 2024 — Waste disposal, clothing in landfills
const DISPOSAL_EF_KG_PER_TONNE = 496.78228; // kg CO₂e per tonne

function makeSite(name = '') {
  return {
    siteName: name,
    disposalBatches: [{ description: '', areaM2: '', weightKg: '' }],
  };
}

function calcLive(sites) {
  let totalAreaM2 = 0, totalWeightKg = 0, totalCO2e = 0;
  sites.forEach(site => {
    (site.disposalBatches || []).forEach(b => {
      const area   = parseFloat(b.areaM2)   || 0;
      const weight = parseFloat(b.weightKg) || 0;
      totalAreaM2   += area;
      totalWeightKg += weight;
      totalCO2e     += (weight / 1000) * DISPOSAL_EF_KG_PER_TONNE;
    });
  });
  return { totalAreaM2, totalWeightKg, totalWeightT: totalWeightKg / 1000, totalCO2e };
}

// ==============================|| CATEGORY 5.2 FORM ||============================== //

export default function Category5_2Form() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const [sites, setSites] = useState([makeSite('')]);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(false);

  const live = calcLive(sites);

  useEffect(() => {
    fetchExisting();
  }, []);

  const fetchExisting = async () => {
    try {
      const res = await axiosServices.get(`${apiUrl}/api/carbon/category/5.2`);
      if (res.data?.category?.sites?.length) {
        const loaded = res.data.category.sites.map(site => ({
          siteName: site.siteName || '',
          disposalBatches: (site.disposalBatches || []).map(b => ({
            description: b.description || '',
            areaM2:  b.areaM2  ?? '',
            weightKg: b.weightKg ?? '',
          })),
        }));
        setSites(loaded);
        setExisting(true);
      }
    } catch {
      // no existing data
    }
  };

  const addSite = () => setSites(s => [...s, makeSite(`Disposal Group ${s.length + 1}`)]);
  const removeSite = (idx) => setSites(s => s.filter((_, i) => i !== idx));
  const updateSiteName = (idx, value) =>
    setSites(s => s.map((site, i) => i === idx ? { ...site, siteName: value } : site));

  const addBatch = (siteIdx) =>
    setSites(s => s.map((site, i) => i === siteIdx
      ? { ...site, disposalBatches: [...site.disposalBatches, { description: '', areaM2: '', weightKg: '' }] }
      : site));
  const removeBatch = (siteIdx, batchIdx) =>
    setSites(s => s.map((site, i) => i === siteIdx
      ? { ...site, disposalBatches: site.disposalBatches.filter((_, j) => j !== batchIdx) }
      : site));
  const updateBatch = (siteIdx, batchIdx, field, value) =>
    setSites(s => s.map((site, i) => i === siteIdx
      ? {
          ...site,
          disposalBatches: site.disposalBatches.map((b, j) =>
            j === batchIdx ? { ...b, [field]: value } : b)
        }
      : site));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        sites: sites.map(site => ({
          siteName: site.siteName,
          disposalBatches: (site.disposalBatches || [])
            .filter(b => parseFloat(b.weightKg) > 0)
            .map(b => ({
              description: b.description || '',
              areaM2:   parseFloat(b.areaM2)   || 0,
              weightKg: parseFloat(b.weightKg) || 0,
            })),
        })),
      };

      await axiosServices.post(`${apiUrl}/api/carbon/category/5.2`, payload);

      await Swal.fire({
        icon: 'success',
        title: 'Data Saved',
        text: `Category 5.2 data saved. Weight: ${live.totalWeightKg.toFixed(0)} kg (${live.totalWeightT.toFixed(3)} t), CO₂e: ${live.totalCO2e.toFixed(2)} kg`,
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

  const handleClear = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Clear Data?',
      text: 'This will permanently delete all Category 5.2 data.',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      confirmButtonColor: '#d33',
    });
    if (!result.isConfirmed) return;

    try {
      await axiosServices.delete(`${apiUrl}/api/carbon/category/5.2`);
      setSites([makeSite('')]);
      setExisting(false);
      Swal.fire({ icon: 'success', title: 'Cleared', text: 'Category 5.2 data removed.' });
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
                <h4 className="mb-1">Category 5.2 — Indirect GHG from Use of Products: Disposal of Products</h4>
                <p className="text-muted mb-0 small">
                  Clothing / leather products disposed in landfill &nbsp;·&nbsp;
                  Defra 2024 EF: {DISPOSAL_EF_KG_PER_TONNE} kgCO₂e/t
                </p>
              </div>
            </div>
          </Col>
          <Col xs="auto">
            {existing && <Badge bg="success" className="me-2"><i className="ph ph-check me-1" />Data Saved</Badge>}
            <Badge bg="danger">Scope 5</Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Live Summary */}
      <MainCard className="mt-3">
        <Row className="text-center g-3">
          <Col md={3}>
            <div className="bg-light-secondary rounded p-3">
              <h5 className="mb-1">{live.totalAreaM2.toFixed(2)} m²</h5>
              <small className="text-muted">Total Area (reference)</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-warning rounded p-3">
              <h5 className="mb-1 text-warning">{live.totalWeightKg.toFixed(2)} kg</h5>
              <small className="text-muted">Total Weight Disposed</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-info rounded p-3">
              <h5 className="mb-1 text-info">{DISPOSAL_EF_KG_PER_TONNE} kgCO₂e/t</h5>
              <small className="text-muted">Defra 2024 EF (clothing landfill)</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-success rounded p-3">
              <h5 className="mb-1 text-success">{live.totalCO2e.toFixed(4)} kgCO₂e</h5>
              <small className="text-muted">Total Emissions</small>
            </div>
          </Col>
        </Row>
        <Alert variant="secondary" className="mt-3 mb-0 py-2 small">
          <strong>Formula:</strong> Weight (kg) ÷ 1000 × {DISPOSAL_EF_KG_PER_TONNE} kgCO₂e/t
          &nbsp;·&nbsp; EF source: Defra GHG Conversion Factors 2024 — Waste disposal, clothing in landfills.
          &nbsp;·&nbsp; CSV check: 3,050 kg ÷ 1000 × 496.78228 = 1,515 kgCO₂e.
        </Alert>
      </MainCard>

      {/* Per-group tables */}
      {sites.map((site, siteIdx) => {
        const siteArea   = (site.disposalBatches || []).reduce((s, b) => s + (parseFloat(b.areaM2) || 0), 0);
        const siteWeightKg = (site.disposalBatches || []).reduce((s, b) => s + (parseFloat(b.weightKg) || 0), 0);
        const siteCO2e   = (siteWeightKg / 1000) * DISPOSAL_EF_KG_PER_TONNE;
        return (
          <Card className="mt-3" key={siteIdx}>
            <Card.Header>
              <Row className="align-items-center">
                <Col>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <i className="ph ph-trash text-danger" />
                    <Form.Control
                      size="sm"
                      style={{ maxWidth: 260 }}
                      value={site.siteName}
                      onChange={e => updateSiteName(siteIdx, e.target.value)}
                      placeholder="Group / year label"
                    />
                    <Badge bg="secondary">{siteArea.toFixed(2)} m²</Badge>
                    <Badge bg="warning" text="dark">{siteWeightKg.toFixed(2)} kg</Badge>
                    <Badge bg="danger">{siteCO2e.toFixed(4)} kgCO₂e</Badge>
                  </div>
                </Col>
                <Col xs="auto">
                  {sites.length > 1 && (
                    <Button variant="outline-danger" size="sm" onClick={() => removeSite(siteIdx)}>
                      <i className="ph ph-trash me-1" />Remove Group
                    </Button>
                  )}
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table bordered hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Description</th>
                      <th style={{ width: 160 }}>Area (m²) — ref</th>
                      <th style={{ width: 180 }}>Weight Disposed (kg)</th>
                      <th className="text-end" style={{ width: 140 }}>CO₂e (kg)</th>
                      <th style={{ width: 60 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(site.disposalBatches || []).map((batch, batchIdx) => {
                      const weightKg = parseFloat(batch.weightKg) || 0;
                      const co2e = (weightKg / 1000) * DISPOSAL_EF_KG_PER_TONNE;
                      return (
                        <tr key={batchIdx}>
                          <td>
                            <Form.Control
                              size="sm"
                              type="text"
                              value={batch.description}
                              onChange={e => updateBatch(siteIdx, batchIdx, 'description', e.target.value)}
                              placeholder="e.g. Finished leather Apr–Mar"
                            />
                          </td>
                          <td>
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              step="0.01"
                              value={batch.areaM2}
                              onChange={e => updateBatch(siteIdx, batchIdx, 'areaM2', e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              step="0.01"
                              value={batch.weightKg}
                              onChange={e => updateBatch(siteIdx, batchIdx, 'weightKg', e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td className="text-muted small text-end">{co2e.toFixed(4)}</td>
                          <td className="text-center">
                            {site.disposalBatches.length > 1 && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="px-1 py-0"
                                onClick={() => removeBatch(siteIdx, batchIdx)}
                              >
                                <i className="ph ph-x" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="table-secondary fw-semibold">
                      <td colSpan={2}>Total</td>
                      <td>{siteWeightKg.toFixed(3)} kg ({(siteWeightKg / 1000).toFixed(4)} t)</td>
                      <td className="text-end">{siteCO2e.toFixed(4)} kgCO₂e</td>
                      <td />
                    </tr>
                  </tfoot>
                </Table>
              </div>
              <Button variant="outline-secondary" size="sm" className="mt-2" onClick={() => addBatch(siteIdx)}>
                <i className="ph ph-plus me-1" />Add Row
              </Button>
            </Card.Body>
          </Card>
        );
      })}

      {/* Add Group */}
      <div className="mt-3">
        <Button variant="outline-secondary" onClick={addSite}>
          <i className="ph ph-plus me-1" />
          Add Disposal Group
        </Button>
      </div>

      {/* Actions */}
      <Card className="mt-3">
        <Card.Body>
          <div className="d-flex gap-3 justify-content-end">
            {existing && (
              <Button variant="outline-danger" onClick={handleClear}>
                <i className="ph ph-trash me-1" />Clear Data
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
