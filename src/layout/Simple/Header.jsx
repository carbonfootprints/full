import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// react-bootstrap
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

// assets
import Logo from 'assets/images/logo-white.svg';

// ==============================|| SIMPLE - HEADER ||============================== //

export default function HeaderSection() {
  const navbarRef = useRef(null); // ✅ Explicit type

  const handleScroll = useCallback(() => {
    if (navbarRef.current) {
      navbarRef.current.classList.toggle('default', window.scrollY === 0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <Navbar expand="md" className="navbar-Datta top-nav-collapse default" ref={navbarRef}>
      <Container>
        <Navbar.Brand href="/">
          <svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0, 10)">
              <path d="M16 16C16 8 24 0 32 0C32 8 24 16 16 16Z" fill="#5ABA75" />
              <path d="M16 16C16 24 8 32 0 32C0 24 8 16 16 16Z" fill="#5ABA75" />
              <line x1="16" y1="16" x2="16" y2="40" stroke="white" stroke-width="2" stroke-linecap="round" />
            </g>
            <text x="50" y="38" fill="#FFFFFF" font-family="'Roboto Mono', monospace" font-size="24">
              PlanetCare
            </text>
          </svg>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarTogglerDemo01" />
        <Navbar.Collapse id="navbarTogglerDemo01">
          <Nav className="ms-auto mb-2 mb-md-0 align-items-center gap-2">
            <Nav.Item>
              <Link to="/orguser/login">
                <Button variant="outline-light" size="sm">
                  <i className="ph ph-buildings me-1" />
                  Organization Login
                </Button>
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/auth/login">
                <Button variant="light" size="sm">
                  <i className="ph ph-shield-check me-1" />
                  Admin Login
                </Button>
              </Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
