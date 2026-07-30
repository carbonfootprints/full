import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosServices from 'utils/axios';

// react-bootstrap
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';

// third-party
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

// project-imports
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';
import { confirmPasswordSchema, emailSchema, firstNameSchema, lastNameSchema, passwordSchema } from 'utils/validationSchema';
import { ThemeMode } from 'config';
import { getResolvedTheme, setResolvedTheme } from 'components/setResolvedTheme';

// assets
import LightLogo from 'assets/images/logo-white.svg';
import DarkLogo from 'assets/images/logo-dark.svg';

// ==============================|| AUTH REGISTER FORM ||============================== //

export default function AuthRegisterForm({ className, link }) {
  const { mode } = useConfig();
  const resolvedTheme = getResolvedTheme(mode);
  setResolvedTheme(mode);
  const navigate = useNavigate();

  const logo = resolvedTheme === ThemeMode.DARK ? LightLogo : DarkLogo;

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors
  } = useForm();

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { type: 'manual', message: 'Passwords must match.' });
      return;
    }
    clearErrors('confirmPassword');

    try {
      setSubmitting(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axiosServices.post(`${apiUrl}/api/auth/register`, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password
      });
      reset();
      Swal.fire({
        icon: 'success',
        title: 'Account Created',
        text: 'Your account has been created successfully. Please log in.',
        confirmButtonText: 'Go to Login'
      }).then(() => navigate(link ?? '/auth/login'));
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      Swal.fire({ icon: 'error', title: 'Registration Failed', text: message });
    } finally {
      setSubmitting(false);
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
        <h4 className={`text-center f-w-500 mt-4 mb-3 ${className}`}>Sign Up</h4>
        <Row>
          <Col sm={6}>
            <Form.Group className="mb-3" controlId="formFirstName">
              <Form.Control
                type="text"
                placeholder="First Name"
                {...register('firstName', firstNameSchema)}
                isInvalid={!!errors.firstName}
                className={className && 'bg-transparent border-white text-white border-opacity-25 '}
              />
              <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group className="mb-3" controlId="formLastName">
              <Form.Control
                type="text"
                placeholder="Last Name"
                {...register('lastName', lastNameSchema)}
                isInvalid={!!errors.lastName}
                className={className && 'bg-transparent border-white text-white border-opacity-25 '}
              />
              <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Control
            type="email"
            placeholder="Email Address"
            {...register('email', emailSchema)}
            isInvalid={!!errors.email}
            className={className && 'bg-transparent border-white text-white border-opacity-25 '}
          />
          <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
          <InputGroup>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              {...register('password', passwordSchema)}
              isInvalid={!!errors.password}
              className={className && 'bg-transparent border-white text-white border-opacity-25 '}
            />
            <Button onClick={togglePasswordVisibility}>
              {showPassword ? <i className="ti ti-eye" /> : <i className="ti ti-eye-off" />}
            </Button>
            <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formConfirmPassword">
          <Form.Control
            type="password"
            placeholder="Confirm Password"
            {...register('confirmPassword', confirmPasswordSchema)}
            isInvalid={!!errors.confirmPassword}
            className={className && 'bg-transparent border-white text-white border-opacity-25 '}
          />
          <Form.Control.Feedback type="invalid">{errors.confirmPassword?.message}</Form.Control.Feedback>
        </Form.Group>
        <Stack direction="horizontal" className="mt-1 justify-content-between">
          <Form.Group controlId="customCheckc1">
            <Form.Check
              type="checkbox"
              label="I agree to all the Terms & Conditions"
              defaultChecked
              className={`input-primary ${className ? className : 'text-muted'} `}
            />
          </Form.Group>
        </Stack>
        <div className="text-center mt-4">
          <Button type="submit" className="shadow px-sm-4" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </div>
        <Stack direction="horizontal" className="justify-content-between align-items-end mt-4">
          <h6 className={`f-w-500 mb-0 ${className}`}>Already have an Account?</h6>
          <a href={link} className="link-primary">
            Login
          </a>
        </Stack>
      </Form>
    </MainCard>
  );
}

AuthRegisterForm.propTypes = { className: PropTypes.string, link: PropTypes.string };
