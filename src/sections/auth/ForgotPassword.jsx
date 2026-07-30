import PropTypes from 'prop-types';
import { useState } from 'react';
import axiosServices from 'utils/axios';
import { useNavigate, Link } from 'react-router-dom';

// react-bootstrap
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Stack from 'react-bootstrap/Stack';
import Alert from 'react-bootstrap/Alert';
import Swal from 'sweetalert2';

// third-party
import { useForm } from 'react-hook-form';

// project-imports
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';
import { ThemeMode } from 'config';
import { emailSchema } from 'utils/validationSchema';
import { getResolvedTheme, setResolvedTheme } from 'components/setResolvedTheme';

// assets
import LightLogo from 'assets/images/logo-white.svg';
import DarkLogo from 'assets/images/logo-dark.svg';

// ==============================|| FORGOT PASSWORD FORM ||============================== //

export default function ForgotPasswordForm({ className, loginLink }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { mode } = useConfig();
  const resolvedTheme = getResolvedTheme(mode);
  setResolvedTheme(mode);

  const logo = resolvedTheme === ThemeMode.DARK ? LightLogo : DarkLogo;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axiosServices.post(`${apiUrl}/api/user/forgot-password`, data);

      if (res.data.message) {
        setSuccess(res.data.message);
        Swal.fire({
          icon: 'success',
          title: 'Email Sent!',
          text: res.data.message,
          confirmButtonText: 'Go to Login'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login');
          }
        });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset email. Please try again.';
      setError(message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard className="mb-0">
      <div className="text-center">
        <Link to="/">
          <Image src={logo} alt="img" />
        </Link>
      </div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <h4 className={`text-center f-w-500 mt-4 mb-2 ${className}`}>Forgot Password?</h4>
        <p className={`text-center mb-4 ${className ? className : 'text-muted'}`}>
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-3">
            {success}
          </Alert>
        )}

        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label className={className}>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            {...register('email', emailSchema)}
            isInvalid={!!errors.email}
            className={className && 'bg-transparent border-white text-white border-opacity-25 '}
          />
          <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
        </Form.Group>

        <div className="text-center mt-4">
          <Button type="submit" className="shadow px-sm-4" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </div>

        <Stack direction="horizontal" className="justify-content-center align-items-center mt-4">
          <a href={loginLink ?? '/login'} className={`link-primary f-w-400`}>
            <i className="ti ti-arrow-left me-1" />
            Back to Login
          </a>
        </Stack>
      </Form>
    </MainCard>
  );
}

ForgotPasswordForm.propTypes = {
  className: PropTypes.string,
  loginLink: PropTypes.string
};
