import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';
import MainCard from 'components/MainCard';

// ==============================|| VISIT CARD ||============================== //

export default function VisitCard({ visit, onView, onEdit, onDelete, className }) {
  const actionIcons = [
    { icon: 'ti ti-eye', name: 'View', color: 'text-primary', action: onView },
    { icon: 'ti ti-edit', name: 'Edit', color: 'text-success', action: onEdit },
    { icon: 'ti ti-trash', name: 'Delete', color: 'text-danger', action: onDelete }
  ];

  // Convert Map (from Mongoose) into an array for rendering
  const dataEntries =
    visit.dataValues && Object.keys(visit.dataValues).length > 0
      ? Object.entries(visit.dataValues)
      : Object.entries(visit.dataTemplate || {});
  console.log('dataEntries', dataEntries);

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
          {/* If dataValues has fields */}
          {dataEntries.length > 0 ? (
            dataEntries.map(([key, value]) => (
              <p key={key} className="mb-1 text-truncate">
                <strong>{key}:</strong> {String(value)}
              </p>
            ))
          ) : (
            <p className="text-muted small mb-1">No visit data available.</p>
          )}

          {/* Status */}
          <p className="mb-1 mt-2">
            <strong>Status:</strong>
            <span
              className={`badge ${
                visit.status === 'pending' ? 'bg-warning' : visit.status === 'inprogress' ? 'bg-info' : 'bg-success'
              } ms-1`}
            >
              {visit.status}
            </span>
          </p>
        </Col>
      </Row>
    </MainCard>
  );
}

VisitCard.propTypes = {
  visit: PropTypes.shape({
    _id: PropTypes.string,
    dataTemplate: PropTypes.object,
    dataValues: PropTypes.object,
    status: PropTypes.string
  }).isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string
};
