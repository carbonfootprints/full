import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// react-bootstrap
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import Stack from 'react-bootstrap/Stack';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';

// project-imports
import MainCard from 'components/MainCard';
import SimpleBarScroll from 'components/third-party/SimpleBar';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import useConfig from 'hooks/useConfig';
import { setResolvedTheme } from 'components/setResolvedTheme';
import { ThemeMode } from 'config';

// assets
import Img1 from 'assets/images/user/avatar-1.png';
import Img2 from 'assets/images/user/avatar-2.png';
import Img3 from 'assets/images/user/avatar-3.png';
import Img4 from 'assets/images/user/avatar-4.png';
import Img5 from 'assets/images/user/avatar-5.png';

const notifications = [
  {
    id: 1,
    avatar: Img1,
    time: '2 min ago',
    title: 'New Support Ticket',
    description: 'A new support ticket has been submitted by an organisation user.',
    date: 'Today'
  },
  {
    id: 2,
    avatar: Img2,
    time: '1 hour ago',
    title: 'Carbon Data Submitted',
    description: 'An organisation has submitted carbon footprint data for review.',
    date: 'Today'
  },
  {
    id: 3,
    avatar: Img3,
    time: '2 hours ago',
    title: 'New Organisation Registered',
    description: 'A new organisation user has completed their registration.',
    date: 'Yesterday'
  },
  {
    id: 4,
    avatar: Img4,
    time: '5 hours ago',
    title: 'Report Ready',
    description: 'The carbon footprint report is ready and awaiting release approval.',
    date: 'Yesterday'
  },
  {
    id: 5,
    avatar: Img5,
    time: '12 hours ago',
    title: 'Incomplete Data Alert',
    description: 'One organisation has incomplete emission data for the current reporting period.',
    date: 'Yesterday'
  }
];

// =============================|| MAIN LAYOUT - HEADER ||============================== //

export default function Header() {
  const { i18n, onChangeLocalization, onChangeMode, mode } = useConfig();

  // Read real user from localStorage
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const displayName = storedUser?.name || storedUser?.contactPerson || 'User';
  const displayEmail = storedUser?.email || '';

  useEffect(() => {
    setResolvedTheme(mode);
  }, [mode]);

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;

  const handleListItemClick = (lang) => {
    onChangeLocalization(lang);
  };
  const navigate = useNavigate();

  // ── Change Password Modal ───────────────────────────────────────────────────
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const openChangePwd = () => {
    setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPwdErrors({});
    setShowChangePwd(true);
  };

  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPwdForm((prev) => ({ ...prev, [name]: value }));
    setPwdErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validatePwd = () => {
    const errs = {};
    if (!pwdForm.oldPassword) errs.oldPassword = 'Current password is required.';
    if (!pwdForm.newPassword) errs.newPassword = 'New password is required.';
    else if (pwdForm.newPassword.length < 8) errs.newPassword = 'Must be at least 8 characters.';
    if (!pwdForm.confirmPassword) errs.confirmPassword = 'Please confirm your new password.';
    else if (pwdForm.newPassword !== pwdForm.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleChangePwdSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePwd();
    if (Object.keys(errs).length) { setPwdErrors(errs); return; }

    setPwdLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const userType = localStorage.getItem('userType');
      const endpoint = userType === 'orguser'
        ? `${API_URL}/api/orguser/change-password`
        : `${API_URL}/api/user/change-password`;

      await axiosServices.put(endpoint, {
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
      });

      setShowChangePwd(false);
      await Swal.fire({
        icon: 'success',
        title: 'Password Changed',
        text: 'Your password has been changed successfully. Please log in again.',
        timer: 2000,
        showConfirmButton: false
      });

      // Force re-login after password change
      localStorage.clear();
      navigate('/login', { replace: true });
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message
        || error.response?.data?.error
        || (status ? `Server error (${status}). Please try again.` : 'Unable to connect to server. Please check if the server is running.');
      setPwdErrors({ api: msg });
    } finally {
      setPwdLoading(false);
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    try {
      // Determine user type before clearing localStorage
      const userType = localStorage.getItem('userType');
      const userData = localStorage.getItem('user');
      let userRole = null;

      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          userRole = parsedUser.role;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // Call logout API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axiosServices.post(`${apiUrl}/api/user/logout`, null);

      // Clear all localStorage
      localStorage.clear();

      Swal.fire({
        icon: 'success',
        title: 'Logged out',
        text: 'You have been logged out successfully.',
        timer: 1500,
        showConfirmButton: false
      });

      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();

      Swal.fire({
        icon: 'warning',
        title: 'Logged out',
        text: 'You have been logged out.'
      });

      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="pc-header">
      <div className="header-wrapper">
        <div className="me-auto pc-mob-drp">
          <Nav className="list-unstyled">
            <Nav.Item className="pc-h-item pc-sidebar-collapse">
              <Nav.Link
                as={Link}
                to="#"
                className="pc-head-link ms-0"
                id="sidebar-hide"
                onClick={() => {
                  handlerDrawerOpen(!drawerOpen);
                }}
              >
                <i className="ph ph-list" />
              </Nav.Link>
            </Nav.Item>

            <Nav.Item className="pc-h-item pc-sidebar-popup">
              <Nav.Link as={Link} to="#" className="pc-head-link ms-0" id="mobile-collapse" onClick={() => handlerDrawerOpen(!drawerOpen)}>
                <i className="ph ph-list" />
              </Nav.Link>
            </Nav.Item>

            <Dropdown className="pc-h-item dropdown">
              <Dropdown.Toggle variant="link" className="pc-head-link arrow-none m-0 trig-drp-search" id="dropdown-search">
                <i className="ph ph-magnifying-glass" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="pc-h-dropdown drp-search">
                <Form className="px-3 py-2">
                  <Form.Control type="search" placeholder="Search here. . ." className="border-0 shadow-none" />
                </Form>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </div>
        <div className="ms-auto">
          <Nav className="list-unstyled">
            <Dropdown className="pc-h-item" align="end">
              <Dropdown.Toggle className="pc-head-link me-0 arrow-none" variant="link" id="dropdown-basic" aria-label="Change theme">
                <i className="ph ph-sun-dim" />
              </Dropdown.Toggle>

              <Dropdown.Menu className="pc-h-dropdown">
                <Dropdown.Item onClick={() => onChangeMode(ThemeMode.DARK)}>
                  <i className="ph ph-moon" />
                  Dark
                </Dropdown.Item>

                <Dropdown.Item onClick={() => onChangeMode(ThemeMode.LIGHT)}>
                  <i className="ph ph-sun" />
                  Light
                </Dropdown.Item>
                <Dropdown.Item onClick={() => onChangeMode(ThemeMode.AUTO)}>
                  <i className="ph ph-cpu" />
                  Default
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown className="pc-h-item d-none d-md-inline-flex" align="end">
              <Dropdown.Toggle className="pc-head-link head-link-primary me-0 arrow-none" variant="link" id="language-dropdown" aria-label="Change language">
                <i className="ph ph-translate" />
              </Dropdown.Toggle>

              <Dropdown.Menu className="pc-h-dropdown lng-dropdown">
                <Dropdown.Item active={i18n === 'en'} onClick={() => handleListItemClick('en')}>
                  <span>
                    English <small>(UK)</small>
                  </span>
                </Dropdown.Item>
                <Dropdown.Item active={i18n === 'fr'} onClick={() => handleListItemClick('fr')}>
                  <span>
                    français <small>(French)</small>
                  </span>
                </Dropdown.Item>
                <Dropdown.Item active={i18n === 'ro'} onClick={() => handleListItemClick('ro')}>
                  <span>
                    Română <small>(Romanian)</small>
                  </span>
                </Dropdown.Item>
                <Dropdown.Item active={i18n === 'zh'} onClick={() => handleListItemClick('zh')}>
                  <span>
                    中国人 <small>(Chinese)</small>
                  </span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown className="pc-h-item" align="end">
              <Dropdown.Toggle className="pc-head-link me-0 arrow-none" variant="link" id="settings-dropdown" aria-label="Settings">
                <i className="ph ph-diamonds-four" />
              </Dropdown.Toggle>

              <Dropdown.Menu className="pc-h-dropdown">
                <Dropdown.Item>
                  <i className="ph ph-user"></i>
                  My Account
                </Dropdown.Item>
                <Dropdown.Item>
                  <i className="ph ph-gear" />
                  Settings
                </Dropdown.Item>
                <Dropdown.Item>
                  <i className="ph ph-lifebuoy" />
                  Support
                </Dropdown.Item>
                <Dropdown.Item>
                  <i className="ph ph-lock-key" />
                  Lock Screen
                </Dropdown.Item>
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="ph ph-power" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown className="pc-h-item" align="end">
              <Dropdown.Toggle className="pc-head-link me-0 arrow-none" variant="link" id="notification-dropdown" aria-label="Notifications">
                <i className="ph ph-bell" />
                {notifications.length > 0 && (
                  <span className="badge bg-success pc-h-badge">{notifications.length}</span>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown-notification pc-h-dropdown">
                <Dropdown.Header className="d-flex align-items-center justify-content-between">
                  <h5 className="m-0">Notifications</h5>
                  <button className="btn btn-link btn-sm" onClick={() => {}}>
                    Mark All Read
                  </button>
                </Dropdown.Header>
                <SimpleBarScroll style={{ maxHeight: 'calc(100vh - 215px)' }}>
                  <div className="dropdown-body text-wrap position-relative">
                    {notifications.map((notification, index) => (
                      <React.Fragment key={notification.id}>
                        {index === 0 || notifications[index - 1].date !== notification.date ? (
                          <p className="text-span">{notification.date}</p>
                        ) : null}
                        <MainCard className="mb-0">
                          <Stack direction="horizontal" gap={3}>
                            <Image className="img-radius avatar rounded-0" src={notification.avatar} alt="Generic placeholder image" />
                            <div>
                              <span className="float-end text-sm text-muted">{notification.time}</span>
                              <h5 className="text-body mb-2">{notification.title}</h5>
                              <p className="mb-0">{notification.description}</p>
                              {notification.actions && (
                                <div className="mt-2">
                                  <Button variant="outline-secondary" size="sm" className="me-2">
                                    Decline
                                  </Button>
                                  <Button variant="primary" size="sm">
                                    Accept
                                  </Button>
                                </div>
                              )}
                            </div>
                          </Stack>
                        </MainCard>
                      </React.Fragment>
                    ))}
                  </div>
                </SimpleBarScroll>

                <div className="text-center py-2">
                  <button className="btn btn-link link-danger p-0" onClick={() => {}}>
                    Clear All Notifications
                  </button>
                </div>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown className="pc-h-item" align="end">
              <Dropdown.Toggle
                className="pc-head-link arrow-none me-0"
                variant="link"
                id="user-profile-dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i className="ph ph-user-circle" />
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown-user-profile pc-h-dropdown p-0 overflow-hidden">
                <Dropdown.Header className="bg-primary">
                  <Stack direction="horizontal" gap={3} className="my-2">
                    <div className="flex-shrink-0">
                      <Image src={Img2} alt="user-avatar" className="user-avatar wid-35" roundedCircle />
                    </div>
                    <Stack gap={1}>
                      <h6 className="text-white mb-0">{displayName}</h6>
                      <span className="text-white text-opacity-75" style={{ fontSize: '0.8rem' }}>{displayEmail}</span>
                    </Stack>
                  </Stack>
                </Dropdown.Header>

                <div className="dropdown-body">
                  <div className="profile-notification-scroll position-relative" style={{ maxHeight: 'calc(100vh - 225px)' }}>
                    <Dropdown.Item as={Link} to="#" className="justify-content-start">
                      <i className="ph ph-gear me-2" />
                      Settings
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="#" className="justify-content-start">
                      <i className="ph ph-share-network me-2" />
                      Share
                    </Dropdown.Item>
                    <Dropdown.Item as="button" className="justify-content-start" onClick={openChangePwd}>
                      <i className="ph ph-lock-key me-2" />
                      Change Password
                    </Dropdown.Item>
                    <div className="d-grid my-2">
                      <Button onClick={handleLogout}>
                        <i className="ph ph-sign-out align-middle me-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </div>
      </div>
      {/* ── Change Password Modal ─────────────────────────────────────────── */}
      <Modal show={showChangePwd} onHide={() => setShowChangePwd(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleChangePwdSubmit}>
          <Modal.Body>
            {pwdErrors.api && (
              <div className="alert alert-danger py-2">{pwdErrors.api}</div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <div className="input-group">
                <Form.Control
                  type={showOld ? 'text' : 'password'}
                  name="oldPassword"
                  value={pwdForm.oldPassword}
                  onChange={handlePwdChange}
                  isInvalid={!!pwdErrors.oldPassword}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
                <Button variant="outline-secondary" type="button" onClick={() => setShowOld((v) => !v)}>
                  <i className={`ph ${showOld ? 'ph-eye' : 'ph-eye-slash'}`} />
                </Button>
                <Form.Control.Feedback type="invalid">{pwdErrors.oldPassword}</Form.Control.Feedback>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <div className="input-group">
                <Form.Control
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  value={pwdForm.newPassword}
                  onChange={handlePwdChange}
                  isInvalid={!!pwdErrors.newPassword}
                  placeholder="Enter new password (min. 8 characters)"
                  autoComplete="new-password"
                />
                <Button variant="outline-secondary" type="button" onClick={() => setShowNew((v) => !v)}>
                  <i className={`ph ${showNew ? 'ph-eye' : 'ph-eye-slash'}`} />
                </Button>
                <Form.Control.Feedback type="invalid">{pwdErrors.newPassword}</Form.Control.Feedback>
              </div>
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label>Confirm New Password</Form.Label>
              <div className="input-group">
                <Form.Control
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={pwdForm.confirmPassword}
                  onChange={handlePwdChange}
                  isInvalid={!!pwdErrors.confirmPassword}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
                <Button variant="outline-secondary" type="button" onClick={() => setShowConfirm((v) => !v)}>
                  <i className={`ph ${showConfirm ? 'ph-eye' : 'ph-eye-slash'}`} />
                </Button>
                <Form.Control.Feedback type="invalid">{pwdErrors.confirmPassword}</Form.Control.Feedback>
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowChangePwd(false)} disabled={pwdLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={pwdLoading}>
              {pwdLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </header>
  );
}
