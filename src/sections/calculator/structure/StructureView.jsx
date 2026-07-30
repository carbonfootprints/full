import React, { useEffect, useState } from 'react';
import axiosServices from 'utils/axios';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function StructureView() {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStructures = async () => {
    try {
      const res = await axiosServices.get('http://localhost:8000/api/admin/structures');
      const data = res.data.structures || res.data.data?.structures || res.data;
      setStructures(data);
    } catch (err) {
      console.error('Error fetching structures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  if (loading) return <div className="text-center my-5">Loading…</div>;

  // -----------------------------
  // OPEN EXISTING VISITS
  // -----------------------------
  const handleOpenExisting = (structure) => {
    navigate(`/calculate/list`);
    // navigate(`/calculate/list?structureId=${structure._id}`);
  };

  // -----------------------------
  // CREATE NEW VISIT
  // -----------------------------
  const handleCreateNewVisit = async (structure) => {
    try {
      // 🔥 Prevent crash if no base visit exists
      if (!structure.visits || structure.visits.length === 0) {
        Swal.fire('No Base Visit', 'Please create a base visit first.', 'warning');
        return;
      }

      // Ask for visit name
      const { value: visitName } = await Swal.fire({
        title: 'Enter Visit Name',
        input: 'text',
        inputPlaceholder: 'Visit name',
        showCancelButton: true,
        confirmButtonText: 'Create',
        inputValidator: (value) => {
          if (!value) {
            return 'Please enter a visit name';
          }
        }
      });

      if (!visitName) return;

      const res = await axiosServices.post(`http://localhost:8000/api/admin/structures/${structure._id}/visits`, { visitName });

      const newVisit = res.data.visit;

      Swal.fire({
        icon: 'success',
        title: 'Visit created!',
        timer: 1200,
        showConfirmButton: false
      });

      navigate(`/calculate/usermain/${structure._id}?visitId=${newVisit._id}`);
    } catch (err) {
      console.error('Error creating new visit:', err);
      Swal.fire('Error', 'Failed to create visit', 'error');
    }
  };

  return (
    <div className="container my-4">
      <h3 className="fw-bold mb-4 text-center">Select a Structure</h3>

      {structures.map((s) => (
        <Card key={s._id} className="mb-3 shadow-sm border">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="m-0">{s.name}</h5>
              <small className="text-muted">Visits: {s.visits?.length || 0}</small>
            </div>

            <div className="d-flex gap-2">
              {/* OPEN EXISTING VISITS */}
              <Button variant="secondary" onClick={() => handleOpenExisting(s)}>
                Open Existing Visit
              </Button>

              {/* CREATE NEW VISIT */}
              <Button variant="primary" onClick={() => handleCreateNewVisit(s)}>
                New Visit
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default StructureView;
