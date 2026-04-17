import PropTypes from 'prop-types';
// react-bootstrap
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';

// project-imports
import branding from 'branding.json';

// third-party
import { motion } from 'framer-motion';

const scopeCards = [
  {
    scope: 'Scope 1',
    color: 'text-danger',
    Icon: 'ph ph-flame',
    title: 'Direct Emissions',
    description: 'Stationary combustion, mobile sources, process emissions, and fugitive releases from owned or controlled sources.',
    delay: '0.3s'
  },
  {
    scope: 'Scope 2',
    color: 'text-warning',
    Icon: 'ph ph-lightning',
    title: 'Indirect Energy',
    description: 'Purchased electricity, steam, heat, and cooling consumed by your organization from external providers.',
    delay: '0.4s'
  },
  {
    scope: 'Scope 3',
    color: 'text-primary',
    Icon: 'ph ph-arrows-out',
    title: 'Value Chain Emissions',
    description: 'Business travel, employee commuting, waste disposal, upstream procurement, and downstream use of sold products.',
    delay: '0.5s'
  },
  {
    scope: 'Reports',
    color: 'text-success',
    Icon: 'ph ph-chart-line-up',
    title: 'Emission Reports',
    description: 'Generate detailed GHG reports by scope, category, site, or time period — ready for disclosure and compliance.',
    delay: '0.6s'
  }
];

// ==============================|| LANDING - SCOPE CARD ||============================== //

function ScopeCard({ scope, color, Icon, title, description, delay }) {
  return (
    <Col lg={3} md={6}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: parseFloat(delay), duration: 0.8, ease: 'easeOut' }}
      >
        <Card className="mb-0 h-100">
          <Card.Body className="p-4">
            <Stack gap={3}>
              <div className="d-flex align-items-center gap-2">
                <i className={`${Icon} ${color} f-32`} />
                <span className={`badge bg-light ${color} f-w-600`}>{scope}</span>
              </div>
              <div>
                <h5 className="f-w-600 mb-2">{title}</h5>
                <p className="mb-0 text-muted">{description}</p>
              </div>
            </Stack>
          </Card.Body>
        </Card>
      </motion.div>
    </Col>
  );
}

// ==============================|| LANDING - SCOPES SECTION ||============================== //

export default function AppsSection() {
  return (
    <section className="communities-section">
      <Container>
        <Row className="justify-content-center text-center">
          <Col md={8} xl={6} className="title">
            <motion.h2
              className="section-title"
              initial={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
            >
              Full <strong className="landing-background-image">GHG Coverage</strong>
            </motion.h2>

            <motion.p
              className="mt-lg-4 mt-2"
              initial={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            >
              {branding.brandName} covers all three GHG scopes as defined by the GHG Protocol — giving you a complete and accurate picture
              of your organization&apos;s total carbon emissions.
            </motion.p>
          </Col>
        </Row>
        <Row className="g-3">
          {scopeCards.map((card) => (
            <ScopeCard key={card.scope} {...card} />
          ))}
        </Row>
      </Container>
    </section>
  );
}

ScopeCard.propTypes = {
  scope: PropTypes.string,
  color: PropTypes.string,
  Icon: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  delay: PropTypes.string
};
