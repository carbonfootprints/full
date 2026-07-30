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

// Defra GHG Conversion Factors 2024 (kg CO2e/km)
const CAR_EF = {
  small:  0.14772,
  medium: 0.16640,
  large:  0.20769,
};
const MOTO_EF = 0.08094; // kg CO2e/km

const makeCarRow = () => ({ description: '', vehicleType: 'medium', totalKm: '' });
const makeMotoRow = () => ({ description: '', totalKm: '' });

const makeDefaultCarRows = () => [makeCarRow()];
const makeDefaultMotoRows = () => [makeMotoRow()];

const makeSite = (name = '') => ({
  siteName: name,
  carGroups: makeDefaultCarRows(),
  motoGroups: makeDefaultMotoRows(),
});

const calcCarRowCO2e = (row) =>
  (parseFloat(row.totalKm) || 0) * (CAR_EF[row.vehicleType] || CAR_EF.medium);

const calcMotoRowCO2e = (row) => (parseFloat(row.totalKm) || 0) * MOTO_EF;

const calcSiteCarCO2e = (carGroups) =>
  carGroups.reduce((sum, r) => sum + calcCarRowCO2e(r), 0);

const calcSiteMotoCO2e = (motoGroups) =>
  motoGroups.reduce((sum, r) => sum + calcMotoRowCO2e(r), 0);

const calcSiteTotalCO2e = (site) =>
  calcSiteCarCO2e(site.carGroups) + calcSiteMotoCO2e(site.motoGroups);

// ==============================|| CATEGORY 4.6 FORM ||============================== //

export default function Category4_6Form() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const [sites, setSites] = useState([makeSite('BAB Pernambut')]);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(false);

  const grandTotal = sites.reduce((sum, site) => sum + calcSiteTotalCO2e(site), 0);
  const grandCarCO2e = sites.reduce((sum, site) => sum + calcSiteCarCO2e(site.carGroups), 0);
  const grandMotoCO2e = sites.reduce((sum, site) => sum + calcSiteMotoCO2e(site.motoGroups), 0);

  useEffect(() => {
    fetchExisting();
  }, []);

  const fetchExisting = async () => {
    try {
      const res = await axiosServices.get(`${apiUrl}/api/carbon/category/4.6`);
      if (res.data?.category?.sites?.length) {
        const loaded = res.data.category.sites.map((s) => ({
          siteName: s.siteName || '',
          carGroups: s.carGroups?.length
            ? s.carGroups.map((r) => ({
                description: r.description || '',
                vehicleType: r.vehicleType || 'medium',
                totalKm: r.totalKm ?? '',
              }))
            : makeDefaultCarRows(),
          motoGroups: s.motoGroups?.length
            ? s.motoGroups.map((r) => ({
                description: r.description || '',
                totalKm: r.totalKm ?? '',
              }))
            : makeDefaultMotoRows(),
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

  // ── Car row handlers ──────────────────────────────────────────────────────────
  const addCarRow = (sIdx) =>
    setSites((prev) =>
      prev.map((s, i) =>
        i === sIdx ? { ...s, carGroups: [...s.carGroups, makeCarRow()] } : s
      )
    );

  const removeCarRow = (sIdx, rIdx) =>
    setSites((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? { ...s, carGroups: s.carGroups.filter((_, ri) => ri !== rIdx) }
          : s
      )
    );

  const updateCarRow = (sIdx, rIdx, field, value) =>
    setSites((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              carGroups: s.carGroups.map((r, ri) =>
                ri === rIdx ? { ...r, [field]: value } : r
              ),
            }
          : s
      )
    );

  // ── Motorcycle row handlers ───────────────────────────────────────────────────
  const addMotoRow = (sIdx) =>
    setSites((prev) =>
      prev.map((s, i) =>
        i === sIdx ? { ...s, motoGroups: [...s.motoGroups, makeMotoRow()] } : s
      )
    );

  const removeMotoRow = (sIdx, rIdx) =>
    setSites((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? { ...s, motoGroups: s.motoGroups.filter((_, ri) => ri !== rIdx) }
          : s
      )
    );

  const updateMotoRow = (sIdx, rIdx, field, value) =>
    setSites((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              motoGroups: s.motoGroups.map((r, ri) =>
                ri === rIdx ? { ...r, [field]: value } : r
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
          carGroups: s.carGroups
            .filter((r) => r.description.trim() || parseFloat(r.totalKm) > 0)
            .map((r) => ({
              description: r.description,
              vehicleType: r.vehicleType,
              totalKm: parseFloat(r.totalKm) || 0,
            })),
          motoGroups: s.motoGroups
            .filter((r) => r.description.trim() || parseFloat(r.totalKm) > 0)
            .map((r) => ({
              description: r.description,
              totalKm: parseFloat(r.totalKm) || 0,
            })),
        })),
      };

      await axiosServices.post(`${apiUrl}/api/carbon/category/4.6`, payload);

      await Swal.fire({
        icon: 'success',
        title: 'Data Saved',
        text: `Category 4.6 purchased transport services data saved. Total CO₂e: ${grandTotal.toFixed(4)} kg`,
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
      text: 'This will permanently delete all Category 4.6 purchased transport services data.',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      confirmButtonColor: '#d33',
    });
    if (!result.isConfirmed) return;

    try {
      await axiosServices.delete(`${apiUrl}/api/carbon/category/4.6`);
      setSites([makeSite('BAB Pernambut')]);
      setExisting(false);
      Swal.fire({ icon: 'success', title: 'Cleared', text: 'Category 4.6 data removed.' });
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
                <h4 className="mb-1">Category 4.6 — Purchased Transport Services</h4>
                <p className="text-muted mb-0 small">
                  Cars &amp; motorcycles · EF source: Defra GHG Conversion Factors 2024
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

      {/* Methodology note */}
      <MainCard className="mt-3">
        <Alert variant="info" className="mb-0 small">
          <i className="ph ph-info me-2" />
          <strong>Defra GHG Conversion Factors 2024</strong> &nbsp;—&nbsp;
          Cars: Small {CAR_EF.small} · Medium {CAR_EF.medium} · Large {CAR_EF.large} kg CO₂e/km
          &nbsp;|&nbsp; Motorcycles: {MOTO_EF} kg CO₂e/km &nbsp;·&nbsp;
          <strong>Formula:</strong> Total km × applicable EF
        </Alert>
      </MainCard>

      {/* Grand total summary */}
      <MainCard className="mt-3">
        <Row className="text-center g-3">
          <Col md={3}>
            <div className="bg-light-primary rounded p-3">
              <h5 className="mb-1 text-primary">{sites.length}</h5>
              <small className="text-muted">Site(s)</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-info rounded p-3">
              <h5 className="mb-1 text-info">{grandCarCO2e.toFixed(4)} kg</h5>
              <small className="text-muted">Cars CO₂e</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-warning rounded p-3">
              <h5 className="mb-1 text-warning">{grandMotoCO2e.toFixed(4)} kg</h5>
              <small className="text-muted">Motorcycles CO₂e</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-light-success rounded p-3">
              <h5 className="mb-1 text-success">{grandTotal.toFixed(4)} kg CO₂e</h5>
              <small className="text-muted">Grand Total</small>
            </div>
          </Col>
        </Row>
      </MainCard>

      {/* Sites */}
      {sites.map((site, sIdx) => {
        const siteCarCO2e = calcSiteCarCO2e(site.carGroups);
        const siteMotoCO2e = calcSiteMotoCO2e(site.motoGroups);
        const siteTotalCO2e = siteCarCO2e + siteMotoCO2e;

        return (
          <Card className="mt-3" key={sIdx}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3 flex-grow-1">
                <h5 className="mb-0">
                  <i className="ph ph-car me-2 text-primary" />
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
              {/* ── Cars table ── */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">
                    <i className="ph ph-car me-1 text-info" />
                    Cars
                  </h6>
                  <Button variant="outline-info" size="sm" onClick={() => addCarRow(sIdx)}>
                    <i className="ph ph-plus me-1" />
                    Add Row
                  </Button>
                </div>
                <div className="table-responsive">
                  <Table bordered hover size="sm">
                    <thead className="table-light">
                      <tr>
                        <th>Description</th>
                        <th style={{ width: 160 }}>Vehicle Type</th>
                        <th style={{ width: 160 }}>Total km</th>
                        <th style={{ width: 160 }}>CO₂e (kg)</th>
                        <th style={{ width: 60 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {site.carGroups.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <td>
                            <Form.Control
                              size="sm"
                              placeholder="e.g. Staff commute — cars"
                              value={row.description}
                              onChange={(e) =>
                                updateCarRow(sIdx, rIdx, 'description', e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Form.Select
                              size="sm"
                              value={row.vehicleType}
                              onChange={(e) =>
                                updateCarRow(sIdx, rIdx, 'vehicleType', e.target.value)
                              }
                            >
                              <option value="small">Small (0.14772)</option>
                              <option value="medium">Medium (0.16640)</option>
                              <option value="large">Large (0.20769)</option>
                            </Form.Select>
                          </td>
                          <td>
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder="0"
                              value={row.totalKm}
                              onChange={(e) =>
                                updateCarRow(sIdx, rIdx, 'totalKm', e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              size="sm"
                              readOnly
                              tabIndex={-1}
                              className="bg-light text-info fw-semibold"
                              value={calcCarRowCO2e(row).toFixed(4)}
                            />
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeCarRow(sIdx, rIdx)}
                            >
                              <i className="ph ph-x" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-secondary fw-semibold">
                        <td colSpan={3}>Cars Subtotal</td>
                        <td className="text-info">{siteCarCO2e.toFixed(4)} kg CO₂e</td>
                        <td />
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </div>

              {/* ── Motorcycles table ── */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">
                    <i className="ph ph-motorcycle me-1 text-warning" />
                    Motorcycles
                  </h6>
                  <Button variant="outline-warning" size="sm" onClick={() => addMotoRow(sIdx)}>
                    <i className="ph ph-plus me-1" />
                    Add Row
                  </Button>
                </div>
                <div className="table-responsive">
                  <Table bordered hover size="sm">
                    <thead className="table-light">
                      <tr>
                        <th>Description</th>
                        <th style={{ width: 160 }}>Total km</th>
                        <th style={{ width: 160 }}>CO₂e (kg)</th>
                        <th style={{ width: 60 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {site.motoGroups.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <td>
                            <Form.Control
                              size="sm"
                              placeholder="e.g. Delivery motorcycles"
                              value={row.description}
                              onChange={(e) =>
                                updateMotoRow(sIdx, rIdx, 'description', e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder="0"
                              value={row.totalKm}
                              onChange={(e) =>
                                updateMotoRow(sIdx, rIdx, 'totalKm', e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              size="sm"
                              readOnly
                              tabIndex={-1}
                              className="bg-light text-warning fw-semibold"
                              value={calcMotoRowCO2e(row).toFixed(4)}
                            />
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeMotoRow(sIdx, rIdx)}
                            >
                              <i className="ph ph-x" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-secondary fw-semibold">
                        <td colSpan={2}>Motorcycles Subtotal</td>
                        <td className="text-warning">{siteMotoCO2e.toFixed(4)} kg CO₂e</td>
                        <td />
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </div>

              {/* Site totals summary */}
              <div className="d-flex gap-3 mt-3">
                <div className="border rounded p-2 text-center flex-fill">
                  <small className="text-muted d-block">Cars CO₂e</small>
                  <span className="fw-bold text-info">{siteCarCO2e.toFixed(4)} kg</span>
                </div>
                <div className="border rounded p-2 text-center flex-fill">
                  <small className="text-muted d-block">Motorcycles CO₂e</small>
                  <span className="fw-bold text-warning">{siteMotoCO2e.toFixed(4)} kg</span>
                </div>
                <div className="border rounded p-2 bg-success bg-opacity-10 text-center flex-fill">
                  <small className="text-muted d-block">Site Total CO₂e</small>
                  <span className="fw-bold text-success">{siteTotalCO2e.toFixed(4)} kg</span>
                </div>
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
