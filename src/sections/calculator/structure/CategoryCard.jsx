import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';
import MainCard from 'components/MainCard';
import { useState } from 'react';

import CategoryTemplateModal from './CategoryTemplateModal';

export default function CategoryCard({ category, onView, onEdit, onDelete, onAddTemplate, className }) {
  const [modalOpen, setModalOpen] = useState(false);

  const actionIcons = [
    { icon: 'ti ti-eye', name: 'View', color: 'text-primary', action: onView },
    { icon: 'ti ti-edit', name: 'Edit', color: 'text-success', action: onEdit },
    { icon: 'ti ti-trash', name: 'Delete', color: 'text-danger', action: onDelete },
    { icon: 'ti ti-plus', name: 'Add Template', color: 'text-warning', action: () => setModalOpen(true) }
  ];

  return (
    <>
      <MainCard
        className={`${className ? className : ''} rounded-lg shadow`}
        bodyClassName="p-3 d-flex flex-column justify-content-between"
        style={{ minHeight: '150px' }}
      >
        <Stack direction="horizontal" gap={3} className="align-items-center justify-content-end mb-2 border-bottom pb-2">
          {actionIcons.map((action) => (
            <i key={action.name} className={`${action.icon} cursor-pointer ${action.color}`} title={action.name} onClick={action.action} />
          ))}
        </Stack>

        <Row className="flex-grow-1">
          <Col xs={12}>
            <h6 className="fw-bold text-dark mb-2 text-truncate">{category.name}</h6>
            <p className="text-muted small mb-1">Subcategories: {category.children ? category.children.length : 0}</p>
            <p className="text-muted small mb-0 text-truncate">
              Template Fields:{' '}
              {category.dataTemplate && Object.keys(category.dataTemplate).length > 0
                ? Object.values(category.dataTemplate).join(', ')
                : 'None'}
            </p>
          </Col>
        </Row>
      </MainCard>

      {/* Template Modal */}
      {modalOpen && (
        <CategoryTemplateModal
          show={modalOpen}
          category={category}
          onClose={() => setModalOpen(false)}
          onSave={(data) => {
            onAddTemplate(data); // parent handler
            setModalOpen(false); // close modal
          }}
        />
      )}
    </>
  );
}

CategoryCard.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    dataTemplate: PropTypes.object,
    dataValues: PropTypes.object,
    children: PropTypes.array
  }).isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onAddTemplate: PropTypes.func,
  className: PropTypes.string
};
