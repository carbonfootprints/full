import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

// react-bootstrap
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Button from 'react-bootstrap/Button';

// project-imports
import MainCard from 'components/MainCard';

// Define all categories
const CATEGORIES = [
  {
    code: '1.1',
    title: 'Stationary combustion: Industrial use',
    description: 'Wood, Diesel consumption',
    scope: 'Scope 1',
    icon: 'ph-factory',
    color: 'primary'
  },
  {
    code: '1.2',
    title: 'Stationary combustion: Domestic use',
    description: 'LPG consumption',
    scope: 'Scope 1',
    icon: 'ph-house',
    color: 'info'
  },
  {
    code: '1.3',
    title: 'Refrigerant - use and leaks',
    description: 'AC & Refrigerator gas leakage',
    scope: 'Scope 1',
    icon: 'ph-snowflake',
    color: 'success'
  },
  {
    code: '1.4',
    title: 'Fire extinguishers',
    description: 'CO₂ extinguisher refills',
    scope: 'Scope 1',
    icon: 'ph-fire-extinguisher',
    color: 'warning'
  },
  {
    code: '1.5',
    title: 'GHG sink - Tree plantation',
    description: 'Carbon sequestration from trees',
    scope: 'Scope 1',
    icon: 'ph-tree',
    color: 'success'
  },
  {
    code: '2',
    title: 'Purchased energy',
    description: 'Electricity consumption',
    scope: 'Scope 2',
    icon: 'ph-lightning',
    color: 'warning'
  },
  {
    code: '3.1',
    title: 'Transport fuel combustion',
    description: 'Fuel used for inter-site transport',
    scope: 'Scope 3',
    icon: 'ph-truck',
    color: 'danger'
  },
  {
    code: '3.2',
    title: 'Upstream road transportation',
    description: 'Inbound freight and raw material logistics',
    scope: 'Scope 3',
    icon: 'ph-road-horizon',
    color: 'secondary'
  },
  {
    code: '3.3.1',
    title: 'Upstream chemicals (Site 1)',
    description: 'Chemical transportation — primary site',
    scope: 'Scope 3',
    icon: 'ph-flask',
    color: 'info'
  },
  {
    code: '3.3.2',
    title: 'Upstream chemicals (Site 2)',
    description: 'Chemical transportation — secondary site',
    scope: 'Scope 3',
    icon: 'ph-flask',
    color: 'info'
  },
  {
    code: '3.4.1',
    title: 'Upstream sea transportation',
    description: 'Chemicals by sea',
    scope: 'Scope 3',
    icon: 'ph-boat',
    color: 'primary'
  },
  {
    code: '3.5.1',
    title: 'Downstream road transportation',
    description: 'Outbound freight and finished goods logistics',
    scope: 'Scope 3',
    icon: 'ph-truck',
    color: 'success'
  },
  {
    code: '3.5.2',
    title: 'Downstream sea transportation',
    description: 'Export of finished goods by sea',
    scope: 'Scope 3',
    icon: 'ph-boat',
    color: 'primary'
  },
  {
    code: '3.2.3a',
    title: 'Waste transportation (Site 1)',
    description: 'Solid waste disposal — primary site',
    scope: 'Scope 3',
    icon: 'ph-trash',
    color: 'danger'
  },
  {
    code: '3.2.3b',
    title: 'Waste transportation (Site 2)',
    description: 'Solid waste disposal — secondary site',
    scope: 'Scope 3',
    icon: 'ph-trash',
    color: 'danger'
  }
];

// ==============================|| CATEGORY WIZARD ||============================== //

export default function CategoryWizard() {
  const navigate = useNavigate();
  const [categoryStatus, setCategoryStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryStatus();
  }, []);

  const fetchCategoryStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      // Fetch status of all categories
      const res = await axios.get(`${apiUrl}/api/carbon/categories/status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCategoryStatus(res.data.status || {});
    } catch (error) {
      console.error('Error fetching category status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    const total = CATEGORIES.length;
    const completed = Object.values(categoryStatus).filter(s => s.completed).length;
    return (completed / total) * 100;
  };

  const handleCategoryClick = (categoryCode) => {
    navigate(`/calculate/carbon-footprint/category/${categoryCode}`);
  };

  const groupedCategories = CATEGORIES.reduce((acc, category) => {
    if (!acc[category.scope]) {
      acc[category.scope] = [];
    }
    acc[category.scope].push(category);
    return acc;
  }, {});

  return (
    <>
      {/* Progress Card */}
      <MainCard>
        <Row className="align-items-center">
          <Col md={8}>
            <h4 className="mb-2">Carbon Footprint Calculator</h4>
            <p className="text-muted mb-0">
              Complete all categories to calculate your organization's carbon footprint
            </p>
          </Col>
          <Col md={4} className="text-end">
            <h5 className="mb-2">
              {Object.values(categoryStatus).filter(s => s.completed).length} of {CATEGORIES.length} Complete
            </h5>
            <ProgressBar
              now={getProgress()}
              label={`${Math.round(getProgress())}%`}
              variant="success"
              style={{ height: '25px' }}
            />
          </Col>
        </Row>
      </MainCard>

      {/* Categories by Scope */}
      {Object.entries(groupedCategories).map(([scope, categories]) => (
        <div key={scope} className="mt-4">
          <h5 className="mb-3">
            <Badge bg="light-secondary" className="me-2">{scope}</Badge>
            {scope === 'Scope 1' && 'Direct Emissions'}
            {scope === 'Scope 2' && 'Indirect Emissions (Energy)'}
            {scope === 'Scope 3' && 'Other Indirect Emissions'}
          </h5>

          <Row>
            {categories.map((category) => {
              const status = categoryStatus[category.code] || {};
              const isCompleted = status.completed;
              const isInProgress = status.dataEntered && !status.calculated;

              return (
                <Col key={category.code} md={6} lg={4} className="mb-3">
                  <Card
                    className={`category-card cursor-pointer h-100 ${isCompleted ? 'border-success' : ''}`}
                    onClick={() => handleCategoryClick(category.code)}
                    style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                  >
                    <Card.Body>
                      <div className="d-flex align-items-start">
                        <div
                          className={`category-icon bg-light-${category.color} rounded p-3 me-3`}
                          style={{ fontSize: '2rem' }}
                        >
                          <i className={`${category.icon} text-${category.color}`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">
                              Category {category.code}
                            </h6>
                            {isCompleted && (
                              <Badge bg="success" className="ms-2">
                                <i className="ph ph-check me-1" />
                                Complete
                              </Badge>
                            )}
                            {isInProgress && !isCompleted && (
                              <Badge bg="warning">
                                <i className="ph ph-clock me-1" />
                                In Progress
                              </Badge>
                            )}
                          </div>
                          <h5 className="mb-2">{category.title}</h5>
                          <p className="text-muted mb-3 small">{category.description}</p>

                          <Button
                            size="sm"
                            variant={isCompleted ? 'outline-success' : 'primary'}
                            className="w-100"
                          >
                            {isCompleted ? (
                              <>
                                <i className="ph ph-pencil me-1" />
                                Edit Data
                              </>
                            ) : isInProgress ? (
                              <>
                                <i className="ph ph-arrow-right me-1" />
                                Continue
                              </>
                            ) : (
                              <>
                                <i className="ph ph-plus me-1" />
                                Enter Data
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      ))}

      {/* Submit for Review — shown when all 15 categories have data entered */}
      {!loading && CATEGORIES.every((cat) => categoryStatus[cat.code]?.dataEntered) && (
        <div className="mt-4">
          <Card className="border-success bg-light-success">
            <Card.Body className="text-center py-4">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center bg-success mb-3"
                style={{ width: 64, height: 64 }}
              >
                <i className="ph ph-check-circle text-white" style={{ fontSize: '2rem' }}></i>
              </div>
              <h5 className="mb-2 text-success">All Categories Completed!</h5>
              <p className="text-muted mb-4">
                You have entered data for all {CATEGORIES.length} categories. Your carbon footprint data is ready for
                admin review. Visit your dashboard to check the report status.
              </p>
              <Button
                variant="success"
                size="lg"
                onClick={() => {
                  Swal.fire({
                    icon: 'success',
                    title: 'Data Submitted for Review',
                    text: 'Your carbon footprint data has been recorded. The admin will review and release your report.',
                    confirmButtonText: 'Go to Dashboard'
                  }).then(() => {
                    navigate('/orguser/dashboard');
                  });
                }}
              >
                <i className="ph ph-paper-plane-right me-2"></i>
                Go to Dashboard
              </Button>
            </Card.Body>
          </Card>
        </div>
      )}

      <style jsx>{`
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
