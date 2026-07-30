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

// LCA-based carbon intensity for leather finishing chemicals
const CHEMICAL_EF = 3.2785; // kg CO2e / kg

const makeChemicalRow = () => ({ chemicalName: '', quantityKg: '' });
const makeDefaultRows = () => [makeChemicalRow(), makeChemicalRow(), makeChemicalRow()];

const makeSite = (name = '') => ({
  siteName: name,
  chemicals: makeDefaultRows(),
});

const calcRowCO2e = (quantityKg) => (parseFloat(quantityKg) || 0) * CHEMICAL_EF;

const calcSiteCO2e = (chemicals) =>
  chemicals.reduce((sum, row) => sum + calcRowCO2e(row.quantityKg), 0);

// ==============================|| CATEGORY 4.2.b FORM ||============================== //

export default function Category4_2bForm() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const [sites, setSites] = useState([makeSite('BAB Thirumudivakkam')]);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(false);

  const grandTotal = sites.reduce((sum, site) => sum + calcSiteCO2e(site.chemicals), 0);

  useEffect(() => {
    fetchExisting();
  }, []);

  const fetchExisting = async () => {
    try {
      const res = await axiosServices.get(`${apiUrl}/api/carbon/category/4.2.b`);
      if (res.data?.category?.sites?.length) {
        const loaded = res.data.category.sites.map((s) => ({
          siteName: s.siteName || '',
          chemicals: s.chemicals?.length
            ? s.chemicals.map((c) => ({
                chemicalName: c.chemicalName || '',
                quantityKg: c.quantityKg ?? '',
              }))
            : makeDefaultRows(),
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

  // ── Chemical row handlers ─────────────────────────────────────────────────────
  const addRow = (sIdx) =>
    setSites((prev) =>
      prev.map((s, i) =>
        i === sIdx ? { ...s, chemicals: [...s.chemicals, makeChemicalRow()] } : s
      )
    );

  const removeRow = (sIdx, rIdx) =>
    setSites((prev) =>
      prev.map((s, i) =>
        i === sIdx ? { ...s, chemicals: s.chemicals.filter((_, ri) => ri !== rIdx) } : s
      )
    );

  const updateRow = (sIdx, rIdx, field, value) =>
    setSites((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              chemicals: s.chemicals.map((r, ri) =>
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
          chemicals: s.chemicals
            .filter((r) => r.chemicalName.trim() || parseFloat(r.quantityKg) > 0)
            .map((r) => ({
              chemicalName: r.chemicalName,
              quantityKg: parseFloat(r.quantityKg) || 0,
            })),
        })),
      };

      await axiosServices.post(`${apiUrl}/api/carbon/category/4.2.b`, payload);

      await Swal.fire({
        icon: 'success',
        title: 'Data Saved',
        text: `Category 4.2.b upstream finishing chemicals data saved. Total CO₂e: ${grandTotal.toFixed(4)} kg`,
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
      text: 'This will permanently delete all Category 4.2.b upstream finishing chemicals data.',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      confirmButtonColor: '#d33',
    });
    if (!result.isConfirmed) return;

    try {
      await axiosServices.delete(`${apiUrl}/api/carbon/category/4.2.b`);
      setSites([makeSite('BAB Thirumudivakkam')]);
      setExisting(false);
      Swal.fire({ icon: 'success', title: 'Cleared', text: 'Category 4.2.b data removed.' });
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
                <h4 className="mb-1">Category 4.2.b — Upstream Finishing Chemicals</h4>
                <p className="text-muted mb-0 small">
                  Thirumudivakkam site · LCA-based EF: {CHEMICAL_EF} kg CO₂e/kg
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
          <strong>Formula:</strong> Sum of all finishing chemical quantities (kg) × {CHEMICAL_EF} kg
          CO₂e/kg &nbsp;·&nbsp; EF source: LCA-based carbon intensity for leather finishing
          chemicals.
        </Alert>
      </MainCard>

      {/* Grand total summary */}
      <MainCard className="mt-3">
        <Row className="text-center g-3">
          <Col md={6}>
            <div className="bg-light-primary rounded p-3">
              <h5 className="mb-1 text-primary">{sites.length}</h5>
              <small className="text-muted">Site(s)</small>
            </div>
          </Col>
          <Col md={6}>
            <div className="bg-light-success rounded p-3">
              <h5 className="mb-1 text-success">{grandTotal.toFixed(4)} kg CO₂e</h5>
              <small className="text-muted">Grand Total Emissions</small>
            </div>
          </Col>
        </Row>
      </MainCard>

      {/* Sites */}
      {sites.map((site, sIdx) => {
        const siteCO2e = calcSiteCO2e(site.chemicals);
        return (
          <Card className="mt-3" key={sIdx}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3 flex-grow-1">
                <h5 className="mb-0">
                  <i className="ph ph-factory me-2 text-warning" />
                  Site {sIdx + 1}
                </h5>
                <Form.Control
                  size="sm"
                  style={{ maxWidth: 260 }}
                  placeholder="Site name (e.g. BAB Thirumudivakkam)"
                  value={site.siteName}
                  onChange={(e) => updateSiteName(sIdx, e.target.value)}
                />
              </div>
              <div className="d-flex align-items-center gap-2">
                <Badge bg="warning" text="dark" className="px-3">
                  {siteCO2e.toFixed(4)} kg CO₂e
                </Badge>
                {sites.length > 1 && (
                  <Button variant="outline-danger" size="sm" onClick={() => removeSite(sIdx)}>
                    <i className="ph ph-trash" />
                  </Button>
                )}
              </div>
            </Card.Header>

            <Card.Body>
              <div className="table-responsive">
                <Table bordered hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Chemical Name</th>
                      <th style={{ width: 180 }}>Quantity (kg)</th>
                      <th style={{ width: 180 }}>CO₂e (kg)</th>
                      <th style={{ width: 60 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {site.chemicals.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td>
                          <Form.Control
                            size="sm"
                            placeholder="e.g. Finishing resin"
                            value={row.chemicalName}
                            onChange={(e) =>
                              updateRow(sIdx, rIdx, 'chemicalName', e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0"
                            value={row.quantityKg}
                            onChange={(e) => updateRow(sIdx, rIdx, 'quantityKg', e.target.value)}
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            readOnly
                            tabIndex={-1}
                            className="bg-light text-success fw-semibold"
                            value={calcRowCO2e(row.quantityKg).toFixed(4)}
                          />
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeRow(sIdx, rIdx)}
                          >
                            <i className="ph ph-x" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-secondary fw-semibold">
                      <td>Site Subtotal</td>
                      <td>
                        {site.chemicals
                          .reduce((s, r) => s + (parseFloat(r.quantityKg) || 0), 0)
                          .toFixed(3)}{' '}
                        kg
                      </td>
                      <td className="text-success">{siteCO2e.toFixed(4)} kg CO₂e</td>
                      <td />
                    </tr>
                  </tfoot>
                </Table>
              </div>
              <Button variant="outline-warning" size="sm" onClick={() => addRow(sIdx)}>
                <i className="ph ph-plus me-1" />
                Add Chemical
              </Button>
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
