import PropTypes from 'prop-types';
// react-bootstrap
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';

// project-imports
import MainCard from 'components/MainCard';

// ==============================|| VISIT CARD ||============================== //

export default function VisitCard({ visit, onView, onEdit, onDelete, className }) {
  const actionIcons = [
    { icon: 'ti ti-eye', name: 'View', color: 'text-primary', action: onView },
    { icon: 'ti ti-edit', name: 'Edit', color: 'text-success', action: onEdit },
    { icon: 'ti ti-trash', name: 'Delete', color: 'text-danger', action: onDelete }
  ];

  return (
    <MainCard className={`${className ? className : ''} rounded-lg shadow`} bodyClassName="p-3">
      {/* Header with action icons */}
      <Stack direction="horizontal" gap={3} className="align-items-center justify-content-end mb-2 border-bottom pb-2">
        {actionIcons.map((action) => (
          <i key={action.name} className={`${action.icon} cursor-pointer ${action.color}`} title={action.name} onClick={action.action} />
        ))}
      </Stack>

      {/* Body */}
      <Row>
        <Col xs={12}>
          <h6 className="fw-bold text-dark mb-2">{visit.organisationname}</h6>
          <p className="mb-1">
            <strong>Site:</strong> {visit.sitename}
          </p>
          <p className="mb-1">
            <strong>Register No:</strong> {visit.registernumber}
          </p>
          <p className="mb-1">
            <strong>Contact:</strong> {visit.contactperson} ({visit.phonenumber})
          </p>
          <p className="mb-1">
            <strong>Email:</strong> {visit.email}
          </p>
          <p className="mb-1">
            <strong>Employees:</strong> {visit.noofemployees}
          </p>
          <p className="mb-1">
            <strong>Status:</strong>
            <span className={`badge ${visit.status === 'pending' ? 'bg-warning' : 'bg-success'} ms-1`}>{visit.status}</span>
          </p>
          <p className="text-muted small">{visit.address}</p>
        </Col>
      </Row>
    </MainCard>
  );
}

VisitCard.propTypes = {
  visit: PropTypes.shape({
    _id: PropTypes.string,
    organisationname: PropTypes.string.isRequired,
    sitename: PropTypes.string.isRequired,
    registernumber: PropTypes.string,
    coordinates: PropTypes.array,
    address: PropTypes.string,
    contactperson: PropTypes.string,
    email: PropTypes.string,
    phonenumber: PropTypes.string,
    noofemployees: PropTypes.number,
    description: PropTypes.string,
    status: PropTypes.string
  }).isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string
};
