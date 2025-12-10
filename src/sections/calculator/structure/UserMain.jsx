import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ReferenceHeader from 'components/ReferenceHeader';
import VisitForm from './VisitForm';
import CategoryForm from './CategoryForm';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function UserMain() {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const visitId = queryParams.get('visitId');
  const [visitData, setVisitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Category form lock/unlock
  const [categoriesEnabled, setCategoriesEnabled] = useState(false);

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/admin/structures/${id}/getvisits`);

        const list = res.data?.data || [];

        let visit;

        if (visitId) {
          visit = list.find((v) => v._id === visitId);
        } else {
          visit = list[0];
        }

        setVisitData(visit);

        // AUTO-Unlock if categories exist
        if (visit?.categories && visit.categories.length > 0) {
          setCategoriesEnabled(true);
        }
      } catch (err) {
        console.error('Error fetching visit:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisit();
  }, [id, visitId]);

  if (loading) return <p>Loading visit data...</p>;
  if (!visitData) return <p>No visit found.</p>;

  return (
    <>
      <ReferenceHeader caption="Ready to go green? Fill out the forms below to assess your carbon footprint" link="#" />
      <div className="mb-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i> Back
        </button>
      </div>

      {/* Visit Form */}
      <Row>
        <Col md={12}>
          <VisitForm structureId={id} visitId={visitId} enableCategories={() => setCategoriesEnabled(true)} />
        </Col>
      </Row>

      {/* Category Form Section (Blurred + Locked Initially) */}
      <Row className="position-relative mt-4">
        <Col md={12}>
          <div className={!categoriesEnabled ? 'blur-overlay' : ''}>
            <CategoryForm categories={visitData.categories} disabled={!categoriesEnabled} />
          </div>

          {!categoriesEnabled && (
            <div className="lock-overlay">
              <i className="bi bi-lock-fill fs-1 text-secondary"></i>
              <p className="text-muted mt-2">Complete the Visit Form to continue</p>
            </div>
          )}
        </Col>
      </Row>
    </>
  );
}

export default UserMain;
