import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// react-bootstrap
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

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
    <Navbar expand="md" className="navbar-planetcare top-nav-collapse default" ref={navbarRef}>
      <Container>
        <Navbar.Brand href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="14" fill="#5ABA75" fillOpacity="0.15" stroke="#5ABA75" strokeWidth="1.5" />
            <path d="M15 6C15 6 21.5 10.5 21.5 17C21.5 21.5 18.5 24.5 15 26C11.5 24.5 8.5 21.5 8.5 17C8.5 10.5 15 6 15 6Z" fill="#5ABA75" />
            <line x1="15" y1="26" x2="15" y2="28.5" stroke="#5ABA75" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
            <span style={{ color: '#ffffff' }}>Planet</span>
            <span style={{ color: '#5ABA75' }}>Care</span>
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarTogglerDemo01" />
        <Navbar.Collapse id="navbarTogglerDemo01">
          <Nav className="ms-auto mb-2 mb-md-0 align-items-center gap-2">
            <Nav.Item>
              <Link to="/login">
                <Button variant="light" size="sm">
                  <i className="ph ph-sign-in me-1" />
                  Login
                </Button>
              </Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
