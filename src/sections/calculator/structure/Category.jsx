import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import MainCard from 'components/MainCard';
import CategoryCard from './CategoryCard'; // similar to VisitCard
import CategoryEditModal from './CategoryEditModel';

function Category() {
  const { struid: structureId, id: visitId } = useParams();
  const [categories, setCategories] = useState([]);
  const [currentCategories, setCurrentCategories] = useState([]);
  const [parentCategory, setParentCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await axiosServices.get(`http://localhost:8000/api/admin/structures/${structureId}/visits/${visitId}/categories`);
      setCategories(response.data?.categories || []);
      setCurrentCategories(response.data?.categories || []);
      setParentCategory(null); // start at top-level
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setCurrentCategories([]);
    }
  };

  useEffect(() => {
    if (structureId) fetchCategories();
  }, [structureId]);

  const handleDelete = async (categoryId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Deleting this will remove its subcategories too!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosServices.delete(`http://localhost:8000/api/admin/structures/${structureId}/visits/${visitId}/categories/${categoryId}`);
          fetchCategories();
          Swal.fire('Deleted!', 'The category has been deleted.', 'success');
        } catch (err) {
          console.error('Delete error:', err);
          Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
        }
      }
    });
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleView = (category) => {
    setParentCategory(category);
    setCurrentCategories(category.children || []);
  };

  const handleBack = () => {
    if (parentCategory) {
      // go back to top-level
      setCurrentCategories(categories);
      setParentCategory(null);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleSave = async (categoryData, isTemplate = false) => {
    try {
      if (isTemplate) {
        // Template update
        const response = await axiosServices.put(
          `http://localhost:8000/api/admin/structures/${structureId}/visits/${visitId}/categories/${categoryData._id}/template`,
          { dataTemplate: categoryData.dataTemplate || categoryData.dataValues }
        );
        console.log('Template update response:', response.data);
        Swal.fire('Updated!', 'Template updated successfully.', 'success');
      } else {
        if (categoryData._id) {
          // Edit existing category
          await axiosServices.put(
            `http://localhost:8000/api/admin/structures/${structureId}/visits/${visitId}/categories/${categoryData._id}`,
            categoryData
          );
          Swal.fire('Updated!', 'Category updated successfully.', 'success');
        } else {
          // New category
          if (parentCategory) {
            // If adding under a parent, call addSubCategory route
            await axiosServices.post(
              `http://localhost:8000/api/admin/structures/${structureId}/visits/${visitId}/categories/${parentCategory._id}`,
              { name: categoryData.name }
            );
            Swal.fire('Created!', 'Subcategory added successfully.', 'success');
          } else {
            // Normal category creation
            await axiosServices.post(`http://localhost:8000/api/admin/structures/${structureId}/visits/${visitId}/categories`, categoryData);
            Swal.fire('Created!', 'Category created successfully.', 'success');
          }
        }
      }

      setModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category/template:', error);
      Swal.fire('Error!', 'Something went wrong while saving.', 'error');
    }
  };

  return (
    <>
      {parentCategory && (
        <Button variant="secondary" onClick={handleBack} className="mb-3">
          ← Back
        </Button>
      )}
      <Row className="g-3">
        {currentCategories.length > 0 ? (
          currentCategories.map((category) => (
            <Col key={category._id} xs={12} md={6} lg={4}>
              <CategoryCard
                category={category}
                onEdit={() => handleEdit(category)}
                onView={() => handleView(category)}
                onDelete={() => handleDelete(category._id)}
                onAddTemplate={(updatedCategory) => handleSave(updatedCategory, true)}
              />
            </Col>
          ))
        ) : (
          <Col>
            <p className="text-muted">No subcategories yet. You can add one below.</p>
          </Col>
        )}

        <Col xs={12} md={6} lg={4}>
          <MainCard
            className="rounded-lg shadow cursor-pointer"
            bodyClassName="p-4 d-flex flex-column align-items-center justify-content-center"
            onClick={handleAdd}
          >
            <i className="ti ti-plus text-dark mb-2" style={{ fontSize: '24px' }} />
            <h6 className="fw-bold text-dark">{parentCategory ? 'Add Subcategory' : 'Add Category'}</h6>
          </MainCard>
        </Col>
        {modalOpen && (
          <CategoryEditModal show={modalOpen} category={editingCategory} onClose={() => setModalOpen(false)} onSave={handleSave} />
        )}
      </Row>
    </>
  );
}

export default Category;
