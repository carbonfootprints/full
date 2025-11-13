import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MainCard from 'components/MainCard';
import VisitCard from './VisitCard';
import VisitEditModal from './VisitEditModel';

function Visit() {
  const { id: structureId } = useParams();
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);

  const fetchVisits = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/admin/structures/${structureId}/getvisits`);
      console.log('Visits Response:', res.data);

      // ✅ Correct path to your visit array
      setVisits(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching visits:', err);
      setVisits([]);
    }
  };

  console.log('visits', visits);

  useEffect(() => {
    if (structureId) fetchVisits();
  }, [structureId]);

  // Add visit (opens modal)
  const handleAdd = () => {
    setEditingVisit(null);
    setModalOpen(true);
  };

  const handleEdit = (visitId) => {
    const visit = visits.find((v) => v._id === visitId);
    setEditingVisit(visit);
    setModalOpen(true);
  };

  const handleDelete = async (visitId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This visit will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8000/api/admin/structures/${structureId}/visits/${visitId}`);
      Swal.fire('Deleted!', 'Visit deleted successfully.', 'success');
      fetchVisits();
    } catch (err) {
      console.error('Delete error:', err);
      Swal.fire('Error!', 'Failed to delete visit.', 'error');
    }
  };

  const handleClose = () => setModalOpen(false);

  const handleView = (visitId) => {
    navigate(`/calculate/category/${structureId}/${visitId}`);
  };

  /**
   * ✅ handleSave — Admin creates visit templates
   * - When admin saves, we store their fields in `dataTemplate`
   * - Not in `dataValues`
   */
  const handleSave = async (visitData) => {
    try {
      // Use admin-entered template directly
      const filledTemplate = visitData.dataTemplate;

      if (!visitData._id) {
        // Create new visit template
        await axios.post(`http://localhost:8000/api/admin/structures/${structureId}/visits`, {
          dataTemplate: filledTemplate,
          dataValues: {}, // user will fill later
          status: visitData.status || 'pending'
        });
        Swal.fire('Created!', 'Visit template created successfully.', 'success');
      } else {
        // Update existing visit template
        await axios.put(`http://localhost:8000/api/admin/structures/${structureId}/visits/${visitData._id}`, {
          dataTemplate: filledTemplate,
          dataValues: {}
        });
        Swal.fire('Updated!', 'Visit template updated successfully.', 'success');
      }

      setModalOpen(false);
      fetchVisits();
    } catch (err) {
      console.error('Error saving visit:', err.response?.data || err.message);
      Swal.fire('Error!', 'Something went wrong while saving.', 'error');
    }
  };

  return (
    <Row className="g-3">
      {visits.length > 0 ? (
        visits.map((visit) => (
          <Col key={visit._id} xs={12} md={6} lg={4}>
            <VisitCard
              visit={visit}
              onView={() => handleView(visit._id)}
              onEdit={() => handleEdit(visit._id)}
              onDelete={() => handleDelete(visit._id)}
            />
          </Col>
        ))
      ) : (
        <Col>
          <p className="text-muted">No visits available. Click below to create one.</p>
        </Col>
      )}

      {/* Add Visit Button */}
      <Col xs={12} md={6} lg={4}>
        <MainCard
          className="rounded-lg shadow cursor-pointer"
          bodyClassName="p-4 d-flex flex-column align-items-center justify-content-center"
          onClick={handleAdd}
        >
          <i className="ti ti-plus text-dark mb-2" style={{ fontSize: '24px' }} />
          <h6 className="fw-bold text-dark">Add Visit Template</h6>
        </MainCard>
      </Col>

      {modalOpen && <VisitEditModal show={modalOpen} visit={editingVisit} onClose={handleClose} onSave={handleSave} />}
    </Row>
  );
}

export default Visit;
