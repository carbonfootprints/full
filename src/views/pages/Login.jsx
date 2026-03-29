// react-bootstrap
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

// project-imports
import AuthLoginForm from 'sections/auth/AuthLogin';

// ===========================|| ADMIN - LOGIN PAGE ||=========================== //

export default function Login() {
  return (
    <div className="auth-main">
      <div className="auth-wrapper v4">
        <div className="auth-form">
          <Card className="my-5 border-0 shadow-lg">
            <Row className="g-0">
              {/* Left brand panel */}
              <Col
                md={5}
                className="d-none d-md-flex flex-column align-items-center justify-content-center p-5 text-white"
                style={{
                  background: 'linear-gradient(135deg, #1a5276 0%, #2e86c1 60%, #1abc9c 100%)',
                  borderRadius: '0.375rem 0 0 0.375rem'
                }}
              >
                <div className="text-center">
                  <div
                    className="mb-4 d-flex align-items-center justify-content-center"
                    style={{
                      width: 80,
                      height: 80,
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      fontSize: 36
                    }}
                  >
                    <i className="ph ph-shield-check" />
                  </div>
                  <h3 className="fw-bold mb-3">Admin Portal</h3>
                  <p className="mb-4" style={{ opacity: 0.85, lineHeight: 1.6 }}>
                    Manage your organization's carbon footprint tracking, users, and support tickets from one place.
                  </p>
                  <div className="d-flex flex-column gap-3 text-start">
                    {[
                      { icon: 'ph-users-three', text: 'Manage organization users' },
                      { icon: 'ph-leaf', text: 'Monitor carbon reports' },
                      { icon: 'ph-headset', text: 'Handle support tickets' }
                    ].map((item, i) => (
                      <div key={i} className="d-flex align-items-center gap-2">
                        <i className={`ph ${item.icon}`} style={{ fontSize: 18, opacity: 0.9 }} />
                        <span style={{ opacity: 0.9, fontSize: '0.9rem' }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>

              {/* Right form panel */}
              <Col md={7} sm={12}>
                <AuthLoginForm link="/auth/register-v4" />
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </div>
  );
}
