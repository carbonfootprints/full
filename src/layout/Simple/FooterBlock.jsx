// react-bootstrap
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';

// third-party
import { motion } from 'framer-motion';

// project-imports
import branding from 'branding.json';

const columns = [
  {
    title: 'Platform',
    links: [
      { text: 'Carbon Calculator', href: '/calculate/carbon-footprint' },
      { text: 'Login', href: '/login' }
    ],
    delay: '0.4s'
  },
  {
    title: 'Company',
    links: [
      { text: 'About Us', href: '/' },
      { text: 'Contact', href: 'mailto:support@planetcare.in' },
      { text: 'Privacy Policy', href: '/' }
    ],
    delay: '0.6s'
  },
  {
    title: 'Support',
    links: [
      { text: 'Help Center', href: 'mailto:support@planetcare.in' },
      { text: 'FAQ', href: '/' }
    ],
    delay: '0.8s'
  }
];

const footerLinks = [
  { href: '#', icon: 'ti ti-brand-linkedin-filled', delay: '0.4s' },
  { href: '#', icon: 'ti ti-brand-twitter-filled', delay: '0.5s' },
  { href: '#', icon: 'ti ti-brand-instagram', delay: '0.6s' }
];

// ==============================|| SIMPLE - FOOTER BLOCK ||============================== //

export default function FooterBlock() {
  return (
    <footer className="footer bg-dark">
      <Container>
        <Row>
          <Col md={4}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: 'easeOut'
              }}
            >
              <div className="mb-3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="15" r="14" fill="#5ABA75" fillOpacity="0.15" stroke="#5ABA75" strokeWidth="1.5" />
                  <path d="M15 6C15 6 21.5 10.5 21.5 17C21.5 21.5 18.5 24.5 15 26C11.5 24.5 8.5 21.5 8.5 17C8.5 10.5 15 6 15 6Z" fill="#5ABA75" />
                  <line x1="15" y1="26" x2="15" y2="28.5" stroke="#5ABA75" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
                  <span style={{ color: '#ffffff' }}>Planet</span>
                  <span style={{ color: '#5ABA75' }}>Care</span>
                </span>
              </div>
              <p className="mb-4 text-white text-opacity-50">
                We're on a mission to help businesses understand and reduce their carbon footprints. With {branding.brandName}, we're
                building a platform that simplifies sustainability reporting, encourages climate-conscious decisions, and supports
                organizations in their journey toward net-zero emissions. Though we're just getting started, our vision is clear — a greener
                future through smart technology.
              </p>
            </motion.div>
          </Col>

          <Col md={8}>
            <Row>
              {columns.map((column, index) => (
                <Col key={index} xs={6} sm={4}>
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: parseFloat(column.delay),
                      duration: 0.8,
                      ease: 'easeOut'
                    }}
                  >
                    <h5 className="mb-4 text-white f-16">{column.title}</h5>
                    <ul className="list-unstyled footer-link">
                      {column.links.map((link, linkIndex) => (
                        <ListGroup.Item key={linkIndex} as="li">
                          <a href={link.href} target="_blank" rel="noopener noreferrer">
                            {link.text}
                          </a>
                        </ListGroup.Item>
                      ))}
                    </ul>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>

      <div className="footer-bottom">
        <Container>
          <Row className="align-items-center">
            <Col className="my-1">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
              >
                <p className="mb-0">
                  &copy; {new Date().getFullYear()} PlanetCare. All rights reserved.
                </p>
              </motion.div>
            </Col>
            <Col xs="auto" className="my-1">
              <Stack direction="horizontal" className="list-inline footer-sos-link mb-0">
                {footerLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    className="list-inline-item"
                    initial={{ opacity: 0, y: 50 }}
                    viewport={{ once: true }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: parseFloat(link.delay), duration: 0.8, ease: 'easeOut' }}
                  >
                    <Nav.Link href={link.href} target="_blank" rel="noopener noreferrer">
                      <i className={link.icon} />
                    </Nav.Link>
                  </motion.li>
                ))}
              </Stack>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
}
