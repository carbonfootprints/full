import PropTypes from 'prop-types';
// react-bootstrap
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';

// project-imports
import MainCard from 'components/MainCard';

// ==============================|| STRUCTURE CARD ||============================== //

export default function StructureCard({ name, onEdit, onDelete, onView, className }) {
  const actionIcons = [
    { icon: 'ti ti-eye', name: 'View', color: 'text-primary' }, // blue
    { icon: 'ti ti-edit', name: 'Edit', color: 'text-success' }, // green
    { icon: 'ti ti-trash', name: 'Delete', color: 'text-danger' } // red
  ];

  const handleAction = (action) => {
    if (action === 'View') onView?.();
    if (action === 'Edit') onEdit?.();
    if (action === 'Delete') onDelete?.();
  };

  return (
    <MainCard className={`${className ? className : ''} rounded-lg shadow`} bodyClassName="p-4">
      {/* Header with action icons */}
      <Stack direction="horizontal" gap={3} className="align-items-center justify-content-end mb-2">
        {actionIcons.map((action) => (
          <i
            key={action.name}
            className={`${action.icon} cursor-pointer ${action.color}`}
            title={action.name}
            onClick={() => handleAction(action.name)}
          />
        ))}
      </Stack>

      {/* Body with structure name */}
      <Row>
        <Col xs={12}>
          <h6 className="text-center fw-bold f-18 mt-2 text-dark">{name}</h6>
        </Col>
      </Row>
    </MainCard>
  );
}

StructureCard.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  className: PropTypes.string
};
