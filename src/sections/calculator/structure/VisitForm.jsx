import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import VisitShowTemplate from './VisitShowTemplate';

function VisitForm({ structureId }) {
  console.log('structureId:', structureId);
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [existingVisit, setExistingVisit] = useState(null);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/admin/structures/${structureId}/getvisits`);
        console.log('res', res);

        const visitList = res.data?.data?.data || res.data?.data;
        if (visitList && visitList.length > 0) {
          const visit = visitList[0];
          setExistingVisit(visit);

          // ✅ Use values of dataTemplate (eeerr, yyy, etc.) as labels
          const mergedForm = {};
          Object.entries(visit.dataTemplate || {}).forEach(([key, label]) => {
            mergedForm[label] = visit.dataValues?.[label] ?? ''; // key = label now
          });

          setForm(mergedForm);
        } else {
          console.warn('No visits found for this structure.');
        }
      } catch (error) {
        console.error('Error fetching visit:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load visit data.'
        });
      }
    };

    if (structureId) fetchVisit();
  }, [structureId]);

  // ✅ Update form value
  const handleChange = (label, value) => {
    setForm((prev) => ({
      ...prev,
      [label]: value
    }));
  };

  // ✅ Save back to DB
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!existingVisit?._id) {
        Swal.fire({
          icon: 'error',
          title: 'No visit template found',
          text: 'Please make sure the visit is created by admin first.'
        });
        return;
      }

      // Convert back to original template key-value pair mapping
      const reversedDataValues = {};
      Object.entries(existingVisit.dataTemplate || {}).forEach(([key, label]) => {
        reversedDataValues[label] = form[label] ?? '';
      });

      const updatedData = {
        dataTemplate: existingVisit.dataTemplate, // keep admin template
        dataValues: reversedDataValues, // user-entered values
        status: 'pending'
      };

      await axios.put(`http://localhost:8000/api/admin/structures/${structureId}/visits/${existingVisit._id}`, updatedData);

      Swal.fire({
        icon: 'success',
        title: 'Visit data saved successfully!',
        showConfirmButton: false,
        timer: 1200
      });

      navigate(`/categories/${existingVisit._id}`);
    } catch (err) {
      console.error('Error saving visit:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong while saving the visit.'
      });
    }
  };

  return (
    <div className="container mt-4">
      {existingVisit ? (
        <VisitShowTemplate
          visit={existingVisit}
          formData={form}
          setFormData={setForm}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
        />
      ) : (
        <div className="text-center mt-5">
          <h6>Loading visit data...</h6>
        </div>
      )}
    </div>
  );
}

export default VisitForm;
