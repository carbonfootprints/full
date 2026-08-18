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
import Img2 from 'assets/images/user/avatar-2.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Icon map per notification type
const TYPE_ICON = {
  TICKET_CREATED:   { icon: 'ph-ticket',          bg: '#eff6ff', color: '#3b82f6' },
  TICKET_REPLIED:   { icon: 'ph-chat-dots',        bg: '#f0fdf4', color: '#22c55e' },
  ORG_REGISTERED:   { icon: 'ph-buildings',        bg: '#fefce8', color: '#eab308' },
  CARBON_SUBMITTED: { icon: 'ph-leaf',             bg: '#f0fdf4', color: '#16a34a' },
  REPORT_READY:     { icon: 'ph-file-text',        bg: '#faf5ff', color: '#a855f7' },
  ACCOUNT_ACTIVATED:{ icon: 'ph-check-circle',     bg: '#f0fdf4', color: '#22c55e' },
  DEFAULT:          { icon: 'ph-bell',             bg: '#f1f5f9', color: '#64748b' }
};

function formatTimeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString();
}

function getDateLabel(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 86400)  return 'Today';
  if (diff < 172800) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString();
}

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

  // ── Notifications ───────────────────────────────────────────────────────────
  const [notifications, setNotifications]   = useState([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [notifOpen, setNotifOpen]           = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await axiosServices.get(`${API_URL}/api/notifications`);
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch { /* silent — bell stays empty if backend unreachable */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleNotifToggle = async (isOpen) => {
    setNotifOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      // Mark all as read when dropdown opens
      try {
        await axiosServices.put(`${API_URL}/api/notifications/read-all`);
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch { /* silent */ }
    }
  };

  const handleClearAll = async () => {
    try {
      await axiosServices.delete(`${API_URL}/api/notifications/clear`);
      setNotifications([]);
      setUnreadCount(0);
    } catch { /* silent */ }
  };
  // ────────────────────────────────────────────────────────────────────────────

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
            <Dropdown className="pc-h-item" align="end" onToggle={handleNotifToggle}>
              <Dropdown.Toggle className="pc-head-link me-0 arrow-none" variant="link" id="notification-dropdown" aria-label="Notifications">
                <i className="ph ph-bell" />
                {unreadCount > 0 && (
                  <span className="badge bg-success pc-h-badge">{unreadCount}</span>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown-notification pc-h-dropdown">
                <Dropdown.Header className="d-flex align-items-center justify-content-between">
                  <h5 className="m-0">Notifications</h5>
                  {notifications.length > 0 && (
                    <button className="btn btn-link btn-sm p-0" onClick={handleClearAll}>
                      Clear All
                    </button>
                  )}
                </Dropdown.Header>

                <SimpleBarScroll style={{ maxHeight: 'calc(100vh - 215px)' }}>
                  <div className="dropdown-body text-wrap position-relative">
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <i className="ph ph-bell-slash" style={{ fontSize: 32, opacity: 0.4 }} />
                        <p className="mt-2 mb-0 small">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif, index) => {
                        const dateLabel  = getDateLabel(notif.createdAt);
                        const prevLabel  = index > 0 ? getDateLabel(notifications[index - 1].createdAt) : null;
                        const showLabel  = index === 0 || prevLabel !== dateLabel;
                        const iconStyle  = TYPE_ICON[notif.type] || TYPE_ICON.DEFAULT;

                        return (
                          <React.Fragment key={notif._id}>
                            {showLabel && <p className="text-span">{dateLabel}</p>}
                            <MainCard className={`mb-0 ${!notif.isRead ? 'border-start border-2 border-success' : ''}`}>
                              <Stack direction="horizontal" gap={3} className="align-items-start">
                                <div
                                  style={{
                                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                    background: iconStyle.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}
                                >
                                  <i className={`ph ${iconStyle.icon}`} style={{ fontSize: 20, color: iconStyle.color }} />
                                </div>
                                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                  <span className="float-end text-sm text-muted" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', marginLeft: 8 }}>
                                    {formatTimeAgo(notif.createdAt)}
                                  </span>
                                  <h5 className="text-body mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>{notif.title}</h5>
                                  <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>{notif.description}</p>
                                </div>
                              </Stack>
                            </MainCard>
                          </React.Fragment>
                        );
                      })
                    )}
                  </div>
                </SimpleBarScroll>
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
