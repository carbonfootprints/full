import PropTypes from 'prop-types';
// react-bootstrap
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';

const pricingOptions = [
  {
    title: 'Starter',
    price: 'Free',
    features: ['1 organization site', 'Up to 3 emission categories', 'Monthly data entry', 'Basic dashboard & reports'],
    link: '/login'
  },
  {
    title: 'Professional',
    price: '₹2,999/yr',
    features: ['Up to 5 sites', 'All 15+ emission categories', 'Full Scope 1, 2 & 3 tracking', 'Priority support'],
    link: '/login',
    buttonClass: 'btn-primary',
    label: 'Popular'
  },
  {
    title: 'Enterprise',
    price: 'Custom',
    features: ['Unlimited sites', 'Custom emission factors', 'Dedicated account manager', 'Audit-ready exports & compliance'],
    link: '/login'
  }
];

// ==============================|| PRICING CARD ||============================== //

function PricingCard({ title, price, features, link, buttonClass = 'btn-outline-light', label }) {
  return (
    <Col md={6} xl={4} className="mb-4">
      <div className="price-card">
        {label && <div className="price-label text-white bg-primary">{label}</div>}
        <h3 className="h4 f-w-400 mb-0 text-white text-opacity-75">{title}</h3>
        <span className="price text-white">{price}</span>
        <ul className="list-unstyled text-start text-white text-opacity-50">
          {features.map((feature, index) => (
            <ListGroup.Item key={index} className="my-2">
              <i className="me-1 ti ti-check text-success" /> {feature}
            </ListGroup.Item>
          ))}
        </ul>
        <div className="d-grid">
          <Button
            variant={buttonClass.includes('outline') ? 'outline-light' : 'primary'}
            href={link}
            className={buttonClass}
          >
            Get Started
          </Button>
        </div>
      </div>
    </Col>
  );
}

// ==============================|| LANDING - PRICING SECTION ||============================== //

export default function PricingBlock() {
  return (
    <section className="bg-dark">
      <Container>
        <Row className="align-items-center">
          <Col lg={4} className="my-3 text-center text-sm-start">
            <div className="title mb-4">
              <h2 className="text-white mb-3">
                Simple <strong className="landing-background-image">Pricing</strong>
              </h2>
            </div>
            <p className="mb-4 text-white text-opacity-50">
              Choose a plan that fits your organization&apos;s size and reporting needs. All plans include access to the carbon calculator
              and dashboard. Contact us for a custom enterprise quote.
            </p>
          </Col>
          <Col lg={8} className="my-3">
            <Row className="justify-content-center">
              {pricingOptions.map((option, index) => (
                <PricingCard key={index} {...option} />
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

PricingCard.propTypes = {
  title: PropTypes.string,
  price: PropTypes.string,
  features: PropTypes.array,
  link: PropTypes.string,
  buttonClass: PropTypes.string,
  label: PropTypes.string
};
