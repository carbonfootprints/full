import PropTypes from 'prop-types';
// react-bootstrap
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

// third-party
import { motion } from 'framer-motion';

// project-imports
import MainCard from 'components/MainCard';
import branding from 'branding.json';

const productCards = [
  { href: '/calculate/carbon-footprint', Icon: 'ph ph-flame', title: 'Stationary Combustion', delay: '0.5s' },
  { href: '/calculate/carbon-footprint', Icon: 'ph ph-truck', title: 'Mobile Sources', delay: '0.6s' },
  { href: '/calculate/carbon-footprint', Icon: 'ph ph-factory', title: 'Process Emissions', delay: '0.7s' },
  { href: '/calculate/carbon-footprint', Icon: 'ph ph-lightning', title: 'Purchased Electricity', delay: '0.8s' },
  { href: '/calculate/carbon-footprint', Icon: 'ph ph-airplane', title: 'Business Travel', delay: '0.9s' },
  { href: '/calculate/carbon-footprint', Icon: 'ph ph-trash', title: 'Waste & Water', delay: '1.0s' }
];

// ==============================|| PRODUCT CARD ||============================== //

function ProductCard({ href, Icon, title, delay }) {
  return (
    <Col xl={2} md={3} xs={6}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: parseFloat(delay), duration: 0.8, ease: 'easeOut' }}
      >
        <a href={href} className="card">
          <MainCard>
            <i className={`${Icon} text-primary`} />
            <h5 className="mt-3 mb-0">{title}</h5>
          </MainCard>
        </a>
      </motion.div>
    </Col>
  );
}

// ==============================|| LANDING - HELP FULL BLOCK ||============================== //

export default function HelpFullComponent() {
  return (
    <section className="bg-dark product-section pb-0">
      <Container>
        <Row className="justify-content-center text-center title">
          <Col xl={10}>
            <motion.h2
              className="text-white section-title mb-0"
              initial={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
            >
              Emission <strong className="landing-background-image">Categories</strong>
            </motion.h2>
          </Col>
          <Col md={8} xl={6}>
            <motion.p
              className="text-white text-opacity-75 mt-lg-4 mt-2 mb-4 mb-md-5"
              initial={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            >
              {branding.brandName} tracks emissions across all major GHG sources — from direct combustion to indirect supply chain activities
              — giving you a complete picture of your carbon footprint.
            </motion.p>
          </Col>
        </Row>
        <Row className="justify-content-center product-cards-block">
          <Col xl={10}>
            <Row className="justify-content-center text-center gy-sm-4 gy-3">
              {productCards.map((card, index) => (
                <ProductCard key={index} href={card.href} Icon={card.Icon} title={card.title} delay={card.delay} />
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

ProductCard.propTypes = { href: PropTypes.string, Icon: PropTypes.string, title: PropTypes.string, delay: PropTypes.string };
