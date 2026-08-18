import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosServices from 'utils/axios';
import Swal from 'sweetalert2';
import './UnifiedLogin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ---- Leaf particle config ----
const LEAVES = [
  { left: '8%',  delay: '0s',   dur: '14s', size: 18, rotate: 20 },
  { left: '22%', delay: '3s',   dur: '18s', size: 13, rotate: -30 },
  { left: '38%', delay: '6s',   dur: '12s', size: 20, rotate: 15 },
  { left: '55%', delay: '1.5s', dur: '16s', size: 14, rotate: -20 },
  { left: '72%', delay: '9s',   dur: '20s', size: 16, rotate: 25 },
  { left: '85%', delay: '4s',   dur: '13s', size: 11, rotate: -10 },
  { left: '14%', delay: '11s',  dur: '17s', size: 15, rotate: 35 },
  { left: '65%', delay: '7s',   dur: '15s', size: 19, rotate: -25 }
];

const FEATURES = [
  { icon: 'ph-chart-line-up',  label: 'Real-time emissions tracking' },
  { icon: 'ph-buildings',      label: 'Multi-site management' },
  { icon: 'ph-file-text',      label: 'PDF & Excel report exports' },
  { icon: 'ph-shield-check',   label: 'Role-based access control' }
];

const STATS = [
  { icon: 'ph-buildings',    label: '500+ Organisations' },
  { icon: 'ph-leaf',         label: '50K Tonnes Tracked' },
  { icon: 'ph-chart-bar',    label: '15+ Categories' }
];

// =============================================
// LEAF SVG
// =============================================
function LeafIcon({ size, color = 'rgba(110,231,183,0.6)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C12 2 19 7 19 14C19 18.4 15.9 21.5 12 23C8.1 21.5 5 18.4 5 14C5 7 12 2 12 2Z"
        fill={color}
      />
      <line x1="12" y1="23" x2="12" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function UnifiedLogin() {
  const navigate = useNavigate();

  const [formData, setFormData]     = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [focused, setFocused]       = useState({ email: false, password: false });

  const emailRef    = useRef(null);
  const passwordRef = useRef(null);

  // Auto-focus email on mount
  useEffect(() => { emailRef.current?.focus(); }, []);

  // ---- Helpers ----
  const hasValue = (field) => formData[field].length > 0;
  const isFocused = (field) => focused[field];

  const validate = () => {
    const errs = {};
    if (!formData.email)                        errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email.';
    if (!formData.password)                     errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleFocus  = (field) => () => setFocused((prev) => ({ ...prev, [field]: true }));
  const handleBlur   = (field) => () => setFocused((prev) => ({ ...prev, [field]: false }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axiosServices.post(`${API_URL}/api/user/unified-login`, formData);
      const { token, refreshToken, user, userType } = res.data;

      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userType', userType);

      const greeting = user.name || user.contactPerson || user.email;

      await Swal.fire({
        icon: 'success',
        title: 'Welcome back!',
        text: `Hello, ${greeting}!`,
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'rounded-4' }
      });

      navigate(userType === 'orguser' ? '/orguser/dashboard' : '/admin-panel/orgusers/list', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      const isPending = message.toLowerCase().includes('not registered') || message.toLowerCase().includes('pending');

      Swal.fire({
        icon: isPending ? 'info' : 'error',
        title: isPending ? 'Account Not Activated' : 'Login Failed',
        text: isPending
          ? 'Your account is not yet activated. Please check your email or contact your administrator.'
          : message,
        confirmButtonText: 'OK',
        customClass: { popup: 'rounded-4' }
      });
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // RENDER
  // =============================================
  return (
    <div className="ul-page">

      {/* ==================== LEFT PANEL ==================== */}
      <div className="ul-left">

        {/* Background elements */}
        <div className="ul-grid" />
        <div className="ul-orb ul-orb-1" />
        <div className="ul-orb ul-orb-2" />
        <div className="ul-orb ul-orb-3" />

        {/* Floating leaves */}
        {LEAVES.map((leaf, i) => (
          <div
            key={i}
            className="ul-leaf"
            style={{
              left: leaf.left,
              bottom: '-40px',
              animationDelay: leaf.delay,
              animationDuration: leaf.dur
            }}
          >
            <LeafIcon
              size={leaf.size}
              color={`rgba(110,231,183,${0.3 + (i % 3) * 0.1})`}
            />
          </div>
        ))}

        {/* Brand */}
        <div className="ul-brand">
          <div className="ul-brand-icon">
            <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="14" fill="rgba(110,231,183,0.15)" stroke="#6ee7b7" strokeWidth="1.5" />
              <path d="M15 6C15 6 21.5 10.5 21.5 17C21.5 21.5 18.5 24.5 15 26C11.5 24.5 8.5 21.5 8.5 17C8.5 10.5 15 6 15 6Z" fill="#6ee7b7" />
              <line x1="15" y1="26" x2="15" y2="28.5" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="ul-brand-name">
            Planet<span>Care</span>
          </div>
        </div>

        {/* Headline */}
        <div className="ul-headline">
          <h1>
            Track. Reduce.<br />
            <em>Sustain the Planet.</em>
          </h1>
          <p>
            A unified platform for monitoring carbon emissions across all your sites and categories — from Scope 1 to Scope 3.
          </p>
        </div>

        {/* Stats pills */}
        <div className="ul-stats">
          {STATS.map((s, i) => (
            <div className="ul-stat-pill" key={i}>
              <i className={`ph ${s.icon}`} />
              {s.label}
            </div>
          ))}
        </div>

        {/* Feature list */}
        <div className="ul-features">
          {FEATURES.map((f, i) => (
            <div className="ul-feature-item" key={i}>
              <div className="ul-feature-dot">
                <i className={`ph ${f.icon}`} />
              </div>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Live badge */}
        <div className="ul-badge">
          <div className="ul-badge-dot" />
          All systems operational
        </div>
      </div>

      {/* ==================== RIGHT PANEL ==================== */}
      <div className="ul-right">
        <div className="ul-card">

          {/* Form header */}
          <div className="ul-form-header">
            <div className="ul-form-icon">
              <i className="ph ph-sign-in" />
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to your PlanetCare account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* Email field */}
            <div className={`ul-field ${hasValue('email') || isFocused('email') ? 'has-value' : ''} ${isFocused('email') ? 'focused' : ''} ${errors.email ? 'error' : ''}`}>
              <i className="ph ph-envelope ul-field-icon" />
              <label>Email address</label>
              <input
                ref={emailRef}
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                onFocus={handleFocus('email')}
                onBlur={handleBlur('email')}
                autoComplete="email"
              />
              {errors.email && (
                <div className="ul-field-error">
                  <i className="ph ph-warning-circle" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password field */}
            <div className={`ul-field ${hasValue('password') || isFocused('password') ? 'has-value' : ''} ${isFocused('password') ? 'focused' : ''} ${errors.password ? 'error' : ''}`}>
              <i className="ph ph-lock ul-field-icon" />
              <label>Password</label>
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                onFocus={handleFocus('password')}
                onBlur={handleBlur('password')}
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                className="ul-eye-btn"
                onClick={() => setShowPassword((p) => !p)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`ph ${showPassword ? 'ph-eye' : 'ph-eye-slash'}`} />
              </button>
              {errors.password && (
                <div className="ul-field-error">
                  <i className="ph ph-warning-circle" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="ul-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="ul-spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  <i className="ph ph-sign-in" style={{ fontSize: 18 }} />
                  Sign In
                  <i className="ph ph-arrow-right" style={{ fontSize: 16, marginLeft: 4 }} />
                </>
              )}
            </button>
          </form>

          {/* Divider + back link */}
          <div className="ul-divider">
            <span>or</span>
          </div>

          <Link to="/" className="ul-back">
            <i className="ph ph-arrow-left" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
