import Alert from 'react-bootstrap/Alert';

// ==============================|| RESULTS PENDING CARD ||============================== //
// Shown in every category form when data has been saved but the admin
// has not yet released the calculated results to this user.

export default function ResultsPendingCard() {
  return (
    <Alert variant="info" className="mt-3 d-flex align-items-start gap-3 mb-0">
      <i className="ph ph-hourglass-medium" style={{ fontSize: '1.75rem', flexShrink: 0, marginTop: 2 }} />
      <div>
        <strong>Data submitted — awaiting admin review</strong>
        <p className="mb-0 mt-1 small">
          Your data has been saved and sent for verification. Once the administrator reviews and approves
          your submission, the calculated CO₂e results will be visible here.
        </p>
      </div>
    </Alert>
  );
}
