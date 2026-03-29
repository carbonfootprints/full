import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// react-bootstrap
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import InputGroup from 'react-bootstrap/InputGroup';
import Stack from 'react-bootstrap/Stack';
import Swal from 'sweetalert2';

// third-party
import { useForm } from 'react-hook-form';

// project-imports
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';
import { ThemeMode } from 'config';
import { emailSchema, passwordSchema } from 'utils/validationSchema';
import { getResolvedTheme, setResolvedTheme } from 'components/setResolvedTheme';

// assets
import LightLogo from 'assets/images/logo-white.svg';
import DarkLogo from 'assets/images/logo-dark.svg';

// ==============================|| AUTH LOGIN FORM ||============================== //

export default function AuthLoginForm({ className, link, resetLink }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { mode } = useConfig();
  const resolvedTheme = getResolvedTheme(mode);
  setResolvedTheme(mode);

  const logo = resolvedTheme === ThemeMode.DARK ? LightLogo : DarkLogo;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setValue('email', savedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${apiUrl}/api/user/login`, data);

      if (res.data.token) {
        // Handle Remember Me — store only email, never the password
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', data.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        localStorage.setItem('token', res.data.token);
        if (res.data.refreshToken) {
          localStorage.setItem('refreshToken', res.data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('userType', 'admin');

        const userRole = res.data.user?.role;
        const redirectPath =
          userRole === 'admin' || userRole === 'superadmin'
            ? '/admin-panel/orgusers/list'
            : '/calculate/helpdesk/ticket/list';

        Swal.fire({
          icon: 'success',
          title: 'Welcome back!',
          text: `Logged in as ${res.data.user?.name || res.data.user?.email}`,
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          navigate(redirectPath, { replace: true });
        });
      } else {
        setError('Login failed, please try again.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      setError(message);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard className="mb-0">
      <div className="text-center mb-2">
        <a>
          <Image src={logo} alt="logo" />
        </a>
      </div>

      <h4 className={`text-center f-w-500 mt-3 mb-1 ${className}`}>Admin Login</h4>
      <p className={`text-center mb-4 ${className ? className : 'text-muted'}`} style={{ fontSize: '0.875rem' }}>
        Sign in to manage your platform
      </p>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label className={className}>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="admin@example.com"
            {...register('email', emailSchema)}
            isInvalid={!!errors.email}
            className={className && 'bg-transparent border-white text-white border-opacity-25'}
          />
          <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label className={className}>Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...register('password', passwordSchema)}
              isInvalid={!!errors.password}
              className={className && 'bg-transparent border-white text-white border-opacity-25'}
            />
            <Button variant="outline-secondary" onClick={togglePasswordVisibility} tabIndex={-1}>
              {showPassword ? <i className="ti ti-eye" /> : <i className="ti ti-eye-off" />}
            </Button>
          </InputGroup>
          <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
        </Form.Group>

        <Stack direction="horizontal" className="mt-1 justify-content-between align-items-center">
          <Form.Group controlId="rememberMe">
            <Form.Check
              type="checkbox"
              label="Remember me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={`input-primary ${className ? className : 'text-muted'}`}
            />
          </Form.Group>
          <Link to={resetLink ?? '/auth/forgot-password'} className={`text-secondary f-w-400 mb-0 ${className}`}>
            Forgot Password?
          </Link>
        </Stack>

        <div className="d-grid mt-4">
          <Button type="submit" size="lg" className="shadow" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </div>
      </Form>

    </MainCard>
  );
}

AuthLoginForm.propTypes = { className: PropTypes.string, link: PropTypes.string, resetLink: PropTypes.string };
