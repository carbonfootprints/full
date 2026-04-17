import { Link } from 'react-router-dom';

// react-bootstrap
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';

// project-imports
import branding from 'branding.json';

// third-party
import { motion } from 'framer-motion';

// assets
import MainHeaderImg from 'assets/images/landing/img-header-main.jpg';
import ImgWave from 'assets/images/landing/img-wave.svg';

// ==============================|| LANDING - HEADER BLOCK ||============================== //

export default function HeaderBlock() {
  return (
    <>
      <Container>
        <Row className="justify-content-center">
          <Col md={10} className="text-center">
            <motion.h1
              className="text-white mb-4"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
            >
              Carbon Footprint <strong className="hero-text-gradient">Management Platform</strong>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Row className="justify-content-center">
                <Col md={8}>
                  <p className="text-white text-opacity-75 f-16 mb-0">
                    Track, manage, and reduce your organization&apos;s carbon emissions with real-time data, reports, and expert support.
                  </p>
                </Col>
              </Row>
            </motion.div>
            <motion.div
              className="my-4 my-sm-5"
              initial={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Link to="/auth/login" className="btn btn-light me-3 px-4">
                <i className="ph ph-shield-check me-2" />
                Admin Login
              </Link>
              <Link to="/orguser/login" className="btn btn-outline-light px-4">
                <i className="ph ph-buildings me-2" />
                Organization Login
              </Link>
            </motion.div>
            <motion.div
              className="mt-4 mt-sm-5"
              initial={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Image src={MainHeaderImg} alt="Carbon Footprint Management Dashboard" className="img-fluid img-header" />
            </motion.div>
          </Col>
        </Row>
      </Container>
      <Image src={ImgWave} alt="" role="presentation" className="img-wave" />
    </>
  );
}
