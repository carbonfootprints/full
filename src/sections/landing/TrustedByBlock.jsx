// react-bootstrap
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';

// third-party
import { motion } from 'framer-motion';

const standards = [
  {
    icon: 'ti ti-certificate',
    title: 'GHG Protocol',
    description: 'Calculations aligned with the GHG Protocol Corporate Standard.',
    delay: '0.3s'
  },
  {
    icon: 'ti ti-award',
    title: 'ISO 14064',
    description: 'Structured to support ISO 14064 greenhouse gas reporting requirements.',
    delay: '0.4s'
  },
  {
    icon: 'ti ti-world',
    title: 'UNFCCC Guidelines',
    description: 'Emission factors based on nationally approved UNFCCC guidelines.',
    delay: '0.5s'
  },
  {
    icon: 'ti ti-shield-check',
    title: 'Audit-Ready',
    description: 'Exportable reports designed for third-party verification and audits.',
    delay: '0.6s'
  }
];

// ===========================|| LANDING - STANDARDS BLOCK ||=========================== //

export default function TrustedBySection() {
  return (
    <section>
      <Container>
        <Row className="justify-content-center text-center">
          <Col md={8} xl={6} className="title">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: 'easeOut' }}
            >
              <strong className="landing-background-image">Standards</strong> We Follow
            </motion.h2>
            <motion.p
              className="mt-lg-4 mt-2"
              initial={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              PlanetCare is built around internationally recognized GHG reporting frameworks to ensure your data is credible, consistent,
              and compliant.
            </motion.p>
          </Col>
        </Row>
        <Row className="justify-content-center g-3">
          {standards.map((item, index) => (
            <Col key={index} lg={3} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: parseFloat(item.delay), duration: 0.8, ease: 'easeOut' }}
              >
                <Card className="text-center h-100">
                  <Card.Body className="p-4">
                    <i className={`${item.icon} text-primary f-36 mb-3 d-block`} />
                    <h5 className="f-w-600 mb-2">{item.title}</h5>
                    <p className="mb-0 text-muted">{item.description}</p>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
