import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import avatar1 from 'assets/images/user/avatar-1.png';
import Stack from 'react-bootstrap/Stack';
import Swal from 'sweetalert2';

function AllUser() {
  const [Users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetcUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/admin/orguser');
      console.log('response:', res.data);

      // YOUR ARRAY IS IN res.data.data
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetcUsers();
  }, []);

  if (loading) return <p>Loading...</p>;

  const handleGenerateLink = async (user) => {
    try {
      const confirm = await Swal.fire({
        title: 'Generate Login Link?',
        text: `Do you want to generate a login link for ${user.email}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Generate',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d'
      });

      if (!confirm.isConfirmed) return;

      const res = await axios.post(`http://localhost:8000/api/admin/generate-link/${user._id}`);

      fetcUsers();

      const generatedLink = res.data.link;

      Swal.fire({
        title: 'Link Generated',
        html: `
        <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
          <a href="${generatedLink}" target="_blank">${generatedLink}</a>

          <button id="copyBtn" style="
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 18px;
          ">
            📋
          </button>
        </div>
      `,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#28a745',
        didOpen: () => {
          const copyBtn = document.getElementById('copyBtn');
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(generatedLink);

            // Show mini popup inside Swal
            Swal.showValidationMessage('Copied!');
            setTimeout(() => Swal.resetValidationMessage(), 1500);
          });
        }
      });
    } catch (error) {
      console.error('Error generating link', error);

      Swal.fire({
        title: 'Error',
        text: 'Failed to generate link. Try again!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <Row>
      <Col lg={12}>
        <Card className="user-profile-list">
          <Card.Body className="p-0">
            <div className="dt-responsive">
              <Table responsive hover className="nowrap">
                <thead>
                  <tr>
                    <th>Organisation Name</th>
                    <th>Employees</th>
                    <th>Sites</th>
                    <th>Address</th>
                    <th>Login Details</th>
                    <th>Data Entry URL</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {Users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <Stack direction="horizontal" className="align-items-center">
                          <Image src={avatar1} roundedCircle width={40} className="me-2" />
                          <div>
                            <h6 className="mb-0">{user.organisationName}</h6>
                            <p className="mb-0">{user.email}</p>
                          </div>
                        </Stack>
                      </td>
                      <td>{user.numberOfEmployees}</td>
                      <td>{user.numberOfSites}</td>
                      <td>{user.address}</td>
                      <td>Login Details</td>
                      <td>
                        <Button variant="outline-success" size="sm" onClick={() => handleGenerateLink(user)}>
                          Generate Link
                        </Button>
                      </td>

                      <td>
                        <Badge bg={user.status ? 'light-success' : 'light-danger'}>{user.status ? 'Active' : 'Inactive'}</Badge>
                        <div className="overlay-edit">
                          <Button variant="success" className="btn-icon">
                            <i className="ph ph-check-circle align-middle" />
                          </Button>
                          <Button variant="danger" className="btn-icon">
                            <i className="ph ph-trash align-middle" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <th>Organisation Name</th>
                    <th>Employees</th>
                    <th>Sites</th>
                    <th>Address</th>
                    <th>Login Details</th>
                    <th>Data Entry URL</th>
                    <th>Status</th>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default AllUser;
