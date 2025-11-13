import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ReferenceHeader from 'components/ReferenceHeader';
import VisitForm from './VisitForm';
import CategoryForm from './CategoryForm';

function UserMain() {
  const { id } = useParams();
  const [visitData, setVisitData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/admin/structures/${id}/getvisits`);
        console.log('resss', res);
        const visit = res.data?.data[0];
        setVisitData(visit);
      } catch (err) {
        console.error('Error fetching visit:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisit();
  }, [id]);

  if (loading) return <p>Loading visit data...</p>;
  if (!visitData) return <p>No visit found.</p>;

  return (
    <>
      <ReferenceHeader caption="Ready to go green? Fill out the forms below to assess your carbon footprint" link="#" />
      <Row>
        <Col md={12}>
          <VisitForm structureId={id} />
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <CategoryForm categories={visitData.categories} />
        </Col>
      </Row>
    </>
  );
}

export default UserMain;
