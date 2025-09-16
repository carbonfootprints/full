import PropTypes from 'prop-types';
// react-bootstrap
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';

// project-imports
import branding from 'branding.json';

// third-party
import { motion } from 'framer-motion';

const features = [
  {
    icon: 'ti ti-leaf',
    title: 'Environmental Impact Tracking',
    description: 'Track carbon emissions across all aspects of your operations in one intuitive dashboard.',
    delay: '0.2s'
  },
  {
    icon: 'ti ti-dashboard',
    title: 'Real-time GHG Calculation',
    description: `Accurate and dynamic greenhouse gas calculations tailored to your industry with ${branding.brandName}.`,
    delay: '0.4s'
  },
  {
    icon: 'ti ti-chart-bar',
    title: 'Visualized Carbon Reports',
    description: 'Interactive charts and reports to analyze emissions and make data-driven decisions.',
    delay: '0.6s'
  },
  {
    icon: 'ti ti-target',
    title: 'Set & Monitor Goals',
    description: 'Set emission reduction goals and track your progress toward sustainability targets.',
    delay: '0.4s'
  },
  {
    icon: 'ti ti-refresh',
    title: 'Automated Data Updates',
    description: 'Integrated data collection and regular updates ensure your footprint is always accurate.',
    delay: '0.6s'
  },
  {
    icon: 'ti ti-book',
    title: 'Guided Documentation',
    description: 'Step-by-step guidance and support to help your team stay compliant with reporting standards.',
    delay: '0.8s'
  }
];

// ==============================|| FEATURE CARD ||============================== //

function FeatureCard({ icon, title, description, delay }) {
  return (
    <Col lg={4} md={6}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: parseFloat(delay), duration: 0.8, ease: 'easeOut' }}
      >
        <Stack direction="horizontal" className="align-items-start">
          <div className="flex-shrink-0">
            <i className={`${icon} text-primary f-32`} />
          </div>
          <div className="flex-grow-1 ms-3">
            <h5>
              <strong>{title}</strong>
            </h5>
            <p>{description}</p>
          </div>
        </Stack>
      </motion.div>
    </Col>
  );
}

// ==============================|| LANDING - FEATURE BLOCK ||============================== //

export default function FeatureBlock() {
  return (
    <section>
      <Container>
        <Row className="title justify-content-center text-center">
          <Col lg={6} md={10}>
            <h2>
              Why <strong className="landing-background-image">{branding.brandName}?</strong>
            </h2>
            <p className="mb-0">
              Empower your organization to measure, monitor, and reduce its carbon footprint with our all-in-one GHG calculation platform.
            </p>
          </Col>
        </Row>
        <Row className="g-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </Row>
      </Container>
    </section>
  );
}

FeatureCard.propTypes = { icon: PropTypes.any, title: PropTypes.any, description: PropTypes.any, delay: PropTypes.any };
