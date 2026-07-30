import React, { useState, useEffect } from 'react';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';
import { Form, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import CategoryShowTemplate from './CategoryShowTemplate';

function CategoryForm({ categories: initialCategories }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState(initialCategories || []);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch latest visit categories if not passed as props
  useEffect(() => {
    const fetchCategories = async () => {
      if (!initialCategories) {
        setLoading(true);
        try {
          const res = await axiosServices.get(`http://localhost:8000/api/admin/structures/${id}/getvisits`);
          const visit = res.data?.data?.data?.[0];
          if (visit?.categories) {
            setCategories(visit.categories);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCategories();
  }, [id, initialCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosServices.put(`http://localhost:8000/api/admin/visits/${id}/updateCategories`, {
        dataValues: formData
      });

      Swal.fire({
        icon: 'success',
        title: 'Categories data saved successfully!',
        showConfirmButton: false,
        timer: 1200
      });

      navigate(`/summary/${id}`);
    } catch (error) {
      console.error('Error saving categories:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not save categories.'
      });
    }
  };

  if (loading) return <p>Loading categories...</p>;

  return (
    <div className="container mt-4">
      <Form onSubmit={handleSubmit}>
        <h3 className="fw-bold mb-4 text-center">Category Details</h3>
        {categories.map((category) => (
          <CategoryShowTemplate key={category._id || category.name} category={category} formData={formData} setFormData={setFormData} />
        ))}
        <div className="text-center mt-4">
          <Button variant="success" type="submit">
            Save & Continue
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default CategoryForm;
