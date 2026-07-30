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

import MainCard from 'components/MainCard';
import ResultsPendingCard from 'components/ResultsPendingCard';
import useResultsReleased from 'hooks/useResultsReleased';

// ——— Defra 2024 emission factors (kg CO2e/km) ———
const CAR_EF = {
  small:   0.14772,
  medium:  0.16640,
  large:   0.20769,
  average: 0.17050,
};
const AIR_EF = {
  'short-haul':  0.15505,
  'medium-haul': 0.16182,
  'long-haul':   0.19498,
};

const newCarGroup = () => ({
  description: '',
  vehicleType: 'medium',
  numberOfCars: 1,
  tripsPerMonth: 0,
  oneWayDistanceKm: 0,
  roundTrip: true,
});

const newAirGroup = () => ({
  description: '',
  haulType: 'long-haul',
  numberOfTrips: 0,
  oneWayDistanceKm: 0,
});

const r4 = (n) => parseFloat((n || 0).toFixed(4));

function calcCarPreview(car) {
  const ef = CAR_EF[car.vehicleType] || CAR_EF.medium;
  const annualKm =
    (car.numberOfCars || 1) *
    (car.tripsPerMonth || 0) *
    12 *
    (car.oneWayDistanceKm || 0) *
    (car.roundTrip !== false ? 2 : 1);
  return { annualKm: r4(annualKm), co2e: r4(annualKm * ef) };
}

function calcAirPreview(air) {
  const ef = AIR_EF[air.haulType] || AIR_EF['long-haul'];
  const totalKm = (air.numberOfTrips || 0) * (air.oneWayDistanceKm || 0);
  return { totalKm: r4(totalKm), co2e: r4(totalKm * ef) };
}

// ==============================|| CATEGORY 3.6 FORM ||============================== //

export default function Category3_6Form() {
  const navigate = useNavigate();
  const [carGroups, setCarGroups] = useState([newCarGroup()]);
  const [airGroups, setAirGroups] = useState([newAirGroup()]);
  const [saving, setSaving] = useState(false);
  const [calculations, setCalculations] = useState(null);
  const resultsReleased = useResultsReleased();

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axiosServices.get(`${apiUrl}/api/carbon/category/3.6`);
      if (res.data.category) {
        const cat = res.data.category;
        if (cat.carGroups?.length) setCarGroups(cat.carGroups);
        if (cat.airGroups?.length) setAirGroups(cat.airGroups);
        if (cat.calculations) setCalculations(cat.calculations);
      }
    } catch {
      // start with defaults
    }
  };

  // ——— Car group handlers ———
  const updateCar = (i, field, value) => {
    const next = [...carGroups];
    if (field === 'numberOfCars' || field === 'tripsPerMonth' || field === 'oneWayDistanceKm') {
      next[i][field] = parseFloat(value) || 0;
    } else if (field === 'roundTrip') {
      next[i][field] = value;
    } else {
      next[i][field] = value;
    }
    setCarGroups(next);
  };

  const addCar = () => setCarGroups([...carGroups, newCarGroup()]);
  const removeCar = (i) => setCarGroups(carGroups.filter((_, idx) => idx !== i));

  // ——— Air group handlers ———
  const updateAir = (i, field, value) => {
    const next = [...airGroups];
    if (field === 'numberOfTrips' || field === 'oneWayDistanceKm') {
      next[i][field] = parseFloat(value) || 0;
    } else {
      next[i][field] = value;
    }
    setAirGroups(next);
  };

  const addAir = () => setAirGroups([...airGroups, newAirGroup()]);
  const removeAir = (i) => setAirGroups(airGroups.filter((_, idx) => idx !== i));

  // ——— Live totals ———
  const totalCarCO2ePreview = carGroups.reduce((sum, c) => sum + calcCarPreview(c).co2e, 0);
  const totalAirCO2ePreview = airGroups.reduce((sum, a) => sum + calcAirPreview(a).co2e, 0);
  const totalCO2ePreview = r4(totalCarCO2ePreview + totalAirCO2ePreview);

  // ——— Save ———
  const handleSave = async () => {
    setSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axiosServices.post(`${apiUrl}/api/carbon/category/3.6`, {
        carGroups,
        airGroups,
      });
      if (res.data.category?.calculations) setCalculations(res.data.category.calculations);
      Swal.fire({
        icon: 'success',
        title: 'Data Saved',
        text: 'Category 3.6 data saved successfully. Results will be available once reviewed by the administrator.',
        timer: 2500,
      });
      return true;
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save data', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (await handleSave()) navigate('/calculate/carbon-footprint');
  };

  return (
    <>
      {/* Header */}
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate('/calculate/carbon-footprint')}
              className="mb-2"
            >
              <i className="ph ph-arrow-left me-2" />
              Back to Categories
            </Button>
            <h4 className="mb-1">Category 3.6 — Business Travel</h4>
            <p className="text-muted mb-0">
              Enter car and air travel data for employee business trips
            </p>
          </Col>
          <Col xs="auto">
            <Badge bg="info" className="px-3 py-2">
              <i className="ph ph-airplane me-2" />
              Scope 3
            </Badge>
          </Col>
        </Row>
      </MainCard>

      {/* Methodology note */}
      <MainCard className="mt-3">
        <Alert variant="info" className="mb-0 small">
          <i className="ph ph-info me-2" />
          <strong>Defra 2024 Emission Factors</strong> — Cars: Small 0.14772 · Medium 0.16640 · Large 0.20769 · Average 0.17050 kg CO₂e/km &nbsp;|&nbsp;
          Air: Short-haul 0.15505 · Medium-haul 0.16182 · Long-haul 0.19498 kg CO₂e/passenger/km
        </Alert>
      </MainCard>

      {/* ————————————————— CARS SECTION ————————————————— */}
      <MainCard className="mt-3">
        <Stack direction="horizontal" className="justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            <i className="ph ph-car me-2 text-primary" />
            Car Travel
          </h5>
          <Button variant="outline-primary" size="sm" onClick={addCar}>
            <i className="ph ph-plus me-1" />
            Add Car Group
          </Button>
        </Stack>

        {carGroups.map((car, i) => {
          const preview = calcCarPreview(car);
          return (
            <Card key={i} className="mb-3 border">
              <Card.Header className="bg-light d-flex justify-content-between align-items-center py-2">
                <span className="fw-semibold small">Car Group {i + 1}</span>
                {carGroups.length > 1 && (
                  <Button variant="outline-danger" size="sm" onClick={() => removeCar(i)}>
                    <i className="ph ph-trash" />
                  </Button>
                )}
              </Card.Header>
              <Card.Body>
                <Row className="g-2">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small mb-1">Description</Form.Label>
                      <Form.Control
                        type="text"
                        size="sm"
                        placeholder="e.g. Sales team cars"
                        value={car.description}
                        onChange={(e) => updateCar(i, 'description', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small mb-1">Vehicle Type</Form.Label>
                      <Form.Select
                        size="sm"
                        value={car.vehicleType}
                        onChange={(e) => updateCar(i, 'vehicleType', e.target.value)}
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="average">Average</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small mb-1">No. of Cars</Form.Label>
                      <Form.Control
                        type="number"
                        size="sm"
                        min="1"
                        step="1"
                        value={car.numberOfCars}
                        onChange={(e) => updateCar(i, 'numberOfCars', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small mb-1">Trips/Month</Form.Label>
                      <Form.Control
                        type="number"
                        size="sm"
                        min="0"
                        value={car.tripsPerMonth}
                        onChange={(e) => updateCar(i, 'tripsPerMonth', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small mb-1">One-way km</Form.Label>
                      <Form.Control
                        type="number"
                        size="sm"
                        min="0"
                        step="0.1"
                        value={car.oneWayDistanceKm}
                        onChange={(e) => updateCar(i, 'oneWayDistanceKm', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Form.Check
                      type="checkbox"
                      id={`roundTrip-${i}`}
                      label="Round trip"
                      className="small"
                      checked={car.roundTrip !== false}
                      onChange={(e) => updateCar(i, 'roundTrip', e.target.checked)}
                    />
                  </Col>
                  <Col md={4}>
                    <div className="border rounded p-2 bg-light text-center">
                      <div className="small text-muted">Annual km</div>
                      <div className="fw-bold">{preview.annualKm.toLocaleString()} km</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="border rounded p-2 bg-primary bg-opacity-10 text-center">
                      <div className="small text-muted">Estimated CO₂e</div>
                      <div className="fw-bold text-primary">{preview.co2e.toFixed(2)} kg</div>
                      <div className="small text-muted">EF: {CAR_EF[car.vehicleType] || CAR_EF.medium} kg/km</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })}

        <div className="border rounded p-3 bg-primary bg-opacity-10 text-center">
          <span className="me-3 text-muted small">Total Cars CO₂e:</span>
          <strong className="text-primary">{r4(totalCarCO2ePreview).toFixed(2)} kg CO₂e/year</strong>
        </div>
      </MainCard>

      {/* ————————————————— AIR TRAVEL SECTION ————————————————— */}
      <MainCard className="mt-3">
        <Stack direction="horizontal" className="justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            <i className="ph ph-airplane me-2 text-info" />
            Air Travel
          </h5>
          <Button variant="outline-info" size="sm" onClick={addAir}>
            <i className="ph ph-plus me-1" />
            Add Flight Group
          </Button>
        </Stack>

        {airGroups.map((air, i) => {
          const preview = calcAirPreview(air);
          return (
            <Card key={i} className="mb-3 border">
              <Card.Header className="bg-light d-flex justify-content-between align-items-center py-2">
                <span className="fw-semibold small">Flight Group {i + 1}</span>
                {airGroups.length > 1 && (
                  <Button variant="outline-danger" size="sm" onClick={() => removeAir(i)}>
                    <i className="ph ph-trash" />
                  </Button>
                )}
              </Card.Header>
              <Card.Body>
                <Row className="g-2">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small mb-1">Description</Form.Label>
                      <Form.Control
                        type="text"
                        size="sm"
                        placeholder="e.g. Flights to USA"
                        value={air.description}
                        onChange={(e) => updateAir(i, 'description', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small mb-1">Haul Type</Form.Label>
                      <Form.Select
                        size="sm"
                        value={air.haulType}
                        onChange={(e) => updateAir(i, 'haulType', e.target.value)}
                      >
                        <option value="short-haul">Short-haul (&lt;1500 km)</option>
                        <option value="medium-haul">Medium-haul (1500–3700 km)</option>
                        <option value="long-haul">Long-haul (&gt;3700 km)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small mb-1">No. of Trips</Form.Label>
                      <Form.Control
                        type="number"
                        size="sm"
                        min="0"
                        step="1"
                        value={air.numberOfTrips}
                        onChange={(e) => updateAir(i, 'numberOfTrips', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small mb-1">One-way km</Form.Label>
                      <Form.Control
                        type="number"
                        size="sm"
                        min="0"
                        step="1"
                        value={air.oneWayDistanceKm}
                        onChange={(e) => updateAir(i, 'oneWayDistanceKm', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <div className="border rounded p-2 bg-light text-center">
                      <div className="small text-muted">Total km</div>
                      <div className="fw-bold">{preview.totalKm.toLocaleString()} km</div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="border rounded p-2 bg-info bg-opacity-10 text-center">
                      <div className="small text-muted">Estimated CO₂e</div>
                      <div className="fw-bold text-info">{preview.co2e.toFixed(2)} kg</div>
                      <div className="small text-muted">EF: {AIR_EF[air.haulType] || AIR_EF['long-haul']} kg/km</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })}

        <div className="border rounded p-3 bg-info bg-opacity-10 text-center">
          <span className="me-3 text-muted small">Total Air CO₂e:</span>
          <strong className="text-info">{r4(totalAirCO2ePreview).toFixed(2)} kg CO₂e/year</strong>
        </div>
      </MainCard>

      {/* Grand total preview */}
      <MainCard className="mt-3">
        <div className="border rounded p-3 bg-success bg-opacity-10 text-center">
          <span className="me-3 text-muted small">Grand Total Business Travel CO₂e:</span>
          <strong className="text-success fs-5">{totalCO2ePreview.toFixed(2)} kg CO₂e/year</strong>
          <div className="small text-muted mt-1">
            Cars: {r4(totalCarCO2ePreview).toFixed(2)} + Air: {r4(totalAirCO2ePreview).toFixed(2)}
          </div>
        </div>
      </MainCard>

      {/* Calculation Results — only visible after admin releases results */}
      {calculations && !resultsReleased && <ResultsPendingCard />}
      {calculations && resultsReleased && (
        <MainCard className="mt-3">
          <h5 className="mb-3">
            <i className="ph ph-chart-bar me-2 text-success" />
            Calculation Results
            <Badge bg="info" className="ms-2 px-3">Category 3.6</Badge>
          </h5>

          <Alert variant="light" className="border mb-3 small">
            <strong>Defra 2024 Emission Factors (Defra GHG Conversion Factors 2024)</strong>
          </Alert>

          {/* Car results */}
          {calculations.carCalculations?.length > 0 && (
            <Card className="mb-3 border">
              <Card.Header className="bg-light fw-semibold">Car Travel</Card.Header>
              <Card.Body className="p-0">
                <Table bordered size="sm" className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Description</th>
                      <th>Vehicle Type</th>
                      <th className="text-end">EF (kg/km)</th>
                      <th className="text-end">Annual km</th>
                      <th className="text-end">CO₂e (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.carCalculations.map((row, i) => (
                      <tr key={i}>
                        <td>{row.description || `Group ${i + 1}`}</td>
                        <td className="text-capitalize">{row.vehicleType}</td>
                        <td className="text-end">{row.ef}</td>
                        <td className="text-end">{row.annualKm?.toLocaleString()}</td>
                        <td className="text-end fw-semibold">{row.co2e?.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="table-primary fw-bold">
                      <td colSpan={4}>Total Car CO₂e</td>
                      <td className="text-end">{calculations.totalCarCO2e?.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Air results */}
          {calculations.airCalculations?.length > 0 && (
            <Card className="mb-3 border">
              <Card.Header className="bg-light fw-semibold">Air Travel</Card.Header>
              <Card.Body className="p-0">
                <Table bordered size="sm" className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Description</th>
                      <th>Haul Type</th>
                      <th className="text-end">EF (kg/km)</th>
                      <th className="text-end">Trips</th>
                      <th className="text-end">One-way km</th>
                      <th className="text-end">Total km</th>
                      <th className="text-end">CO₂e (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.airCalculations.map((row, i) => (
                      <tr key={i}>
                        <td>{row.description || `Group ${i + 1}`}</td>
                        <td>{row.haulType}</td>
                        <td className="text-end">{row.ef}</td>
                        <td className="text-end">{row.numberOfTrips}</td>
                        <td className="text-end">{row.oneWayDistanceKm?.toLocaleString()}</td>
                        <td className="text-end">{row.totalKm?.toLocaleString()}</td>
                        <td className="text-end fw-semibold">{row.co2e?.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="table-info fw-bold">
                      <td colSpan={6}>Total Air CO₂e</td>
                      <td className="text-end">{calculations.totalAirCO2e?.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Grand total */}
          <Card className="border-success">
            <Card.Header className="bg-success text-white fw-semibold">
              Grand Total — Category 3.6 Business Travel
            </Card.Header>
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Source</th>
                    <th className="text-end">CO₂e (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Car Travel</td>
                    <td className="text-end">{calculations.totalCarCO2e?.toFixed(2) ?? '—'}</td>
                  </tr>
                  <tr>
                    <td>Air Travel</td>
                    <td className="text-end">{calculations.totalAirCO2e?.toFixed(2) ?? '—'}</td>
                  </tr>
                  <tr className="table-success fw-bold">
                    <td>Grand Total</td>
                    <td className="text-end text-success">{calculations.totalCO2e?.toFixed(2) ?? '—'}</td>
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
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/calculate/carbon-footprint')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button variant="outline-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save & Calculate'}
          </Button>
          <Button variant="primary" onClick={handleSaveAndNext} disabled={saving}>
            {saving ? 'Saving...' : (
              <>
                <span>Save & Finish</span>
                <i className="ph ph-check ms-2" />
              </>
            )}
          </Button>
        </Stack>
      </MainCard>
    </>
  );
}
