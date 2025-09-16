import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Outlet } from 'react-router-dom';

import StructureCard from './StructureCard';
import MainCard from 'components/MainCard';
import StructureEditModal from './StructureEditModel';

function Structure() {
  const [structures, setStructures] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const navigate = useNavigate();

  const fetchStructures = () => {
    axios
      .get('http://localhost:8000/api/admin/structures')
      .then((response) => setStructures(response.data.structures))
      .catch((error) => console.error('Error fetching structures:', error));
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:8000/api/admin/structures/${id}`)
          .then(() => {
            fetchStructures();
            Swal.fire('Deleted!', 'The structure has been deleted.', 'success');
          })
          .catch((err) => {
            console.error('Delete error:', err);
            Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
          });
      }
    });
  };

  const handleEdit = (id) => {
    const structure = structures.find((s) => s._id === id);
    setEditingStructure(structure);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingStructure(null);
    setModalOpen(true);
  };

  const handleView = (id) => {
    console.log('view');
    navigate(`/calculate/visit/${id}`);
  };

  const handleClose = () => setModalOpen(false);

  const handleSave = async (data) => {
    try {
      if (data._id) {
        const response = await axios.put(`http://localhost:8000/api/admin/structures/${data._id}`, data);
        console.log('Updated structure:', response.data);
      } else {
        const response = await axios.post('http://localhost:8000/api/admin/structures', data);
        console.log('Created structure:', response.data);
      }

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Structure Name updated',
        showConfirmButton: false,
        timer: 1500
      });

      setModalOpen(false);
      fetchStructures();
    } catch (error) {
      console.error('Error saving structure:', error);

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong while saving!'
      });
    }
  };
  return (
    <>
      <Row className="g-3">
        {structures.map((structure) => (
          <Col key={structure._id} xs={12} md={6} lg={4}>
            <StructureCard
              name={structure.name}
              onEdit={() => handleEdit(structure._id)}
              onDelete={() => handleDelete(structure._id)}
              onView={() => handleView(structure._id)}
              className="rounded-lg shadow"
            />
          </Col>
        ))}

        {/* Final Add Structure Card */}
        <Col xs={12} md={6} lg={4}>
          <MainCard
            className="rounded-lg shadow cursor-pointer"
            bodyClassName="p-4 d-flex flex-column align-items-center justify-content-center"
            onClick={handleAdd}
          >
            <i className="ti ti-plus text-dark mb-2" style={{ fontSize: '24px' }} />
            <h6 className="fw-bold text-dark">Add Structure</h6>
          </MainCard>
        </Col>

        <StructureEditModal
          show={modalOpen}
          onClose={handleClose}
          onHide={() => setModalOpen(false)}
          onSave={handleSave}
          structure={editingStructure}
        />
      </Row>
      <Outlet />
    </>
  );
}

export default Structure;
