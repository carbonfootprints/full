import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function StructureView() {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Recursive function to count all nested subcategories
  const countSubcategories = (category) => {
    if (!category.children || category.children.length === 0) return 0;
    let count = category.children.length;
    category.children.forEach((child) => {
      count += countSubcategories(child); // recursive count
    });
    return count;
  };

  const fetchStructures = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/admin/structures');
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

  const handleOpen = (structure) => {
    let totalCategories = 0;
    let totalSubcategories = 0;
    let totalSubSubcategories = 0;

    structure.visits?.forEach((visit) => {
      visit?.categories?.forEach((cat) => {
        totalCategories++;
        const subCount = cat.children?.length || 0;
        totalSubcategories += subCount;

        // Count sub-subcategories recursively
        cat.children?.forEach((child) => {
          totalSubSubcategories += countSubcategories(child);
        });
      });
    });

    // Send counts as params
    navigate(
      `/calculate/usermain/${structure._id}?categories=${totalCategories}&subcategories=${totalSubcategories}&subsub=${totalSubSubcategories}`
    );
  };

  return (
    <div className="container my-4">
      <h3 className="fw-bold mb-4 text-center">Select a Structure</h3>
      {structures.map((s) => {
        // Precalculate for UI display
        let catCount = 0,
          subCount = 0,
          subSubCount = 0;

        s.visits?.forEach((v) => {
          v?.categories?.forEach((c) => {
            catCount++;
            subCount += c.children?.length || 0;
            c.children?.forEach((child) => {
              subSubCount += countSubcategories(child);
            });
          });
        });

        return (
          <Card key={s._id} className="mb-3 shadow-sm border">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="m-0">{s.name}</h5>
                <small className="text-muted">
                  Categories: {catCount} | Subcategories: {subCount} | Nested Subs: {subSubCount}
                </small>
              </div>
              <Button variant="primary" onClick={() => handleOpen(s)}>
                Open
              </Button>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
}

export default StructureView;
