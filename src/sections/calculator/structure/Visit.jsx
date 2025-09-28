import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import VisitCard from './VisitCard';
import MainCard from 'components/MainCard';
import VisitEditModal from './VisitEditModel';

function Visit() {
  const { id: structureId } = useParams(); // clearer name
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]); // always an array
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);

  // Fetch visits for the structure
  const fetchVisits = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/admin/structures/${structureId}/visits`);
      console.log('response', response);
      setVisits(response.data?.data?.filter((v) => v !== null) || []);
    } catch (error) {
      console.error('Error fetching visits:', error);
      setVisits([]); // prevent map error
    }
  };

  useEffect(() => {
    if (structureId) fetchVisits();
  }, [structureId]);

  // Delete
  const handleDelete = async (visitId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this action!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8000/api/admin/structures/${structureId}/visits/${visitId}`);
          fetchVisits();
          Swal.fire('Deleted!', 'The visit has been deleted.', 'success');
        } catch (err) {
          console.error('Delete error:', err);
          Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
        }
      }
    });
  };

  // Edit
  const handleEdit = (visitId) => {
    const visit = visits.find((v) => v._id === visitId);
    console.log('Editing visit:', visit);
    setEditingVisit(visit);
    setModalOpen(true);
  };

  // Add
  const handleAdd = () => {
    setEditingVisit(null);
    setModalOpen(true);
  };

  const handleClose = () => setModalOpen(false);
  const handleView = (visitId) => {
    console.log('view', visitId);
    navigate(`/calculate/category/${structureId}/${visitId}`);
  };

  // Save (Create / Update)
  const handleSave = async (data) => {
    try {
      let coordinates = [0, 0];

      if (typeof data.coordinates === 'string') {
        // user typed "12.34,56.78"
        coordinates = data.coordinates.split(',').map((c) => Number(c.trim()));
      } else if (Array.isArray(data.coordinates)) {
        // already array from backend
        coordinates = data.coordinates.map(Number);
      }
      const payload = {
        organisationname: data.organisationname || data.name,
        sitename: data.sitename || data.siteName,
        registernumber: data.registernumber || data.companyRegNo,
        address: data.address,
        contactperson: data.contactperson || data.contactPerson,
        email: data.email,
        phonenumber: data.phonenumber || data.phone,
        noofemployees: Number(data.noofemployees || data.noOfEmployees) || 0,
        description: data.description || '',
        status: data.status || 'pending',
        coordinates,
        categories: data.categories || []
      };

      if (data._id) {
        await axios.put(`http://localhost:8000/api/admin/structures/${structureId}/visits/${data._id}`, payload);
      } else {
        await axios.post(`http://localhost:8000/api/admin/structures/${structureId}/visits`, payload);
      }

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Visit saved successfully',
        showConfirmButton: false,
        timer: 1500
      });

      setModalOpen(false);
      fetchVisits();
    } catch (error) {
      console.error('Error saving visit:', error);

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong while saving!'
      });
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
              className="rounded-lg shadow"
            />
          </Col>
        ))
      ) : (
        <Col>
          <p>No visits available for this structure.</p>
        </Col>
      )}

      {/* Add Visit Card */}
      <Col xs={12} md={6} lg={4}>
        <MainCard
          className="rounded-lg shadow cursor-pointer"
          bodyClassName="p-4 d-flex flex-column align-items-center justify-content-center"
          onClick={handleAdd}
        >
          <i className="ti ti-plus text-dark mb-2" style={{ fontSize: '24px' }} />
          <h6 className="fw-bold text-dark">Add Visit</h6>
        </MainCard>
      </Col>

      <VisitEditModal show={modalOpen} onClose={handleClose} onSave={handleSave} visit={editingVisit} />
    </Row>
  );
}

export default Visit;
