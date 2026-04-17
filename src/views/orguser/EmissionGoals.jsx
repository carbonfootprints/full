import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

// react-bootstrap
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';

// project-imports
import MainCard from 'components/MainCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

// ==============================|| ORGUSER - EMISSION GOALS ||============================== //

export default function EmissionGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    targetYear: new Date().getFullYear() + 1,
    baselineYear: new Date().getFullYear() - 1,
    baselineEmissions: '',
    targetReductionPct: '',
    notes: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/orguser/goals`, { headers: authHeaders() });
      setGoals(res.data.goals || []);
    } catch {
      // Goals endpoint may not exist yet — show empty state
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.baselineEmissions || !form.targetReductionPct) {
      Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Please fill in all required fields.' });
      return;
    }
    try {
      setSaving(true);
      await axios.post(`${API_URL}/api/orguser/goals`, form, { headers: authHeaders() });
      setShowModal(false);
      setForm({ title: '', targetYear: new Date().getFullYear() + 1, baselineYear: new Date().getFullYear() - 1, baselineEmissions: '', targetReductionPct: '', notes: '' });
      fetchGoals();
      Swal.fire({ icon: 'success', title: 'Goal Saved', text: 'Your emission reduction goal has been saved.', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to save goal.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ icon: 'warning', title: 'Delete Goal?', text: 'This cannot be undone.', showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#d33' });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API_URL}/api/orguser/goals/${id}`, { headers: authHeaders() });
      fetchGoals();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete goal.' });
    }
  };

  const targetTonnes = (goal) =>
    goal.baselineEmissions - (goal.baselineEmissions * goal.targetReductionPct) / 100;

  const progressPct = (goal) => {
    if (!goal.currentEmissions || !goal.baselineEmissions) return 0;
    const reduced = goal.baselineEmissions - goal.currentEmissions;
    const needed = (goal.baselineEmissions * goal.targetReductionPct) / 100;
    return Math.min(100, Math.round((reduced / needed) * 100));
  };

  const statusBadge = (goal) => {
    const pct = progressPct(goal);
    if (pct >= 100) return <Badge bg="success">Achieved</Badge>;
    if (new Date().getFullYear() > goal.targetYear) return <Badge bg="danger">Overdue</Badge>;
    return <Badge bg="primary">In Progress</Badge>;
  };

  return (
    <MainCard title="Emission Reduction Goals">
      <Stack direction="horizontal" className="justify-content-between mb-4">
        <p className="text-muted mb-0">
          Set science-based targets to reduce your organisation&apos;s carbon footprint over time.
        </p>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <i className="ph ph-plus me-1" />
          Add Goal
        </Button>
      </Stack>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <Card className="text-center py-5 border-dashed">
          <Card.Body>
            <i className="ph ph-target text-muted" style={{ fontSize: '3rem' }} />
            <h5 className="mt-3">No Goals Set Yet</h5>
            <p className="text-muted">
              Create your first emission reduction goal to start tracking your progress toward net zero.
            </p>
            <Button onClick={() => setShowModal(true)}>
              <i className="ph ph-plus me-1" />
              Add First Goal
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {goals.map((goal) => (
            <Col md={6} key={goal._id}>
              <Card className="h-100">
                <Card.Body>
                  <Stack direction="horizontal" className="justify-content-between mb-2">
                    <h6 className="mb-0 f-w-600">{goal.title}</h6>
                    {statusBadge(goal)}
                  </Stack>
                  <p className="text-muted small mb-3">
                    Baseline: <strong>{goal.baselineYear}</strong> &mdash; Target Year: <strong>{goal.targetYear}</strong>
                  </p>
                  <div className="mb-2">
                    <Stack direction="horizontal" className="justify-content-between mb-1">
                      <small className="text-muted">Reduction progress</small>
                      <small className="text-muted">{progressPct(goal)}%</small>
                    </Stack>
                    <ProgressBar now={progressPct(goal)} variant={progressPct(goal) >= 100 ? 'success' : 'primary'} style={{ height: '6px' }} />
                  </div>
                  <Row className="g-2 mt-1">
                    <Col xs={6}>
                      <div className="bg-light rounded p-2 text-center">
                        <small className="text-muted d-block">Baseline</small>
                        <strong>{Number(goal.baselineEmissions).toLocaleString()} tCO₂e</strong>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="bg-light rounded p-2 text-center">
                        <small className="text-muted d-block">Target ({goal.targetReductionPct}% reduction)</small>
                        <strong>{Math.round(targetTonnes(goal)).toLocaleString()} tCO₂e</strong>
                      </div>
                    </Col>
                  </Row>
                  {goal.notes && <p className="text-muted small mt-3 mb-0">{goal.notes}</p>}
                  <div className="text-end mt-3">
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(goal._id)}>
                      <i className="ph ph-trash me-1" />
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add Goal Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Emission Reduction Goal</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Goal Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                placeholder="e.g. Reduce Scope 1 emissions by 30%"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Form.Group>
            <Row className="g-2 mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Baseline Year</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.baselineYear}
                    onChange={(e) => setForm({ ...form, baselineYear: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Target Year</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.targetYear}
                    onChange={(e) => setForm({ ...form, targetYear: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-2 mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Baseline Emissions (tCO₂e) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    value={form.baselineEmissions}
                    onChange={(e) => setForm({ ...form, baselineEmissions: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Reduction Target (%) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 30"
                    value={form.targetReductionPct}
                    onChange={(e) => setForm({ ...form, targetReductionPct: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Optional notes about this goal..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Goal'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </MainCard>
  );
}
