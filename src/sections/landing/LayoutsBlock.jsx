import PropTypes from 'prop-types';

// react-bootstrap
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

// third-party
import { motion } from 'framer-motion';

const modules = [
  {
    icon: 'ti ti-calculator',
    title: 'Carbon Calculator',
    description: 'Enter monthly emission data across 15+ categories covering Scope 1, 2, and 3 with automatic GHG calculations.',
    delay: '0.2s'
  },
  {
    icon: 'ti ti-chart-dots-2',
    title: 'Analytics Dashboard',
    description: 'Visualize your organization\'s carbon footprint with interactive charts, trend analysis, and category breakdowns.',
    delay: '0.4s'
  },
  {
    icon: 'ti ti-building-skyscraper',
    title: 'Multi-Site Management',
    description: 'Manage emission data across multiple locations and consolidate reports at an organizational level.',
    delay: '0.6s'
  },
  {
    icon: 'ti ti-target',
    title: 'Goal Tracking',
    description: 'Set science-based emission reduction targets and monitor progress with real-time status indicators.',
    delay: '0.8s'
  }
];

// ==============================|| MODULE CARD ||============================== //

function ModuleCard({ icon, title, description, delay }) {
  return (
    <Col lg={3} md={6}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: parseFloat(delay), duration: 0.8, ease: 'easeOut' }}
      >
        <Card className="mb-0 h-100">
          <Card.Body className="text-center p-4">
            <div className="mb-3">
              <i className={`${icon} text-primary f-40`} />
            </div>
            <h5 className="f-w-600 mb-2">{title}</h5>
            <p className="mb-0 text-muted">{description}</p>
          </Card.Body>
        </Card>
      </motion.div>
    </Col>
  );
}

// ==============================|| LANDING - PLATFORM MODULES BLOCK ||============================== //

export default function LayoutsBlock() {
  return (
    <section className="bg-body">
      <Container>
        <Row className="title justify-content-center text-center">
          <Col lg={6} md={10}>
            <h2>
              Platform <strong className="landing-background-image">Modules</strong>
            </h2>
            <p className="mb-0">
              Everything you need to measure, manage, and reduce your organization&apos;s carbon emissions — in one integrated platform.
            </p>
          </Col>
        </Row>
        <Row className="g-3 justify-content-center">
          {modules.map((module, index) => (
            <ModuleCard key={index} {...module} />
          ))}
        </Row>
      </Container>
    </section>
  );
}

ModuleCard.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  delay: PropTypes.string
};
