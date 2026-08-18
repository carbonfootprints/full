import { useLocation, Link, useNavigate } from 'react-router-dom';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

// ==============================|| DYNAMIC BREADCRUMBS ||============================== //

/**
 * Returns the home path based on the logged-in user type.
 */
function getHomePath() {
  const userType = localStorage.getItem('userType');
  return userType === 'orguser' ? '/orguser/dashboard' : '/admin-panel/orgusers/list';
}

/**
 * Route pattern → breadcrumb trail definition.
 * Each entry: { pattern: RegExp, crumbs: (match) => Array<{ label, to }> }
 * The last crumb always has to: null (current page, not a link).
 */
const ROUTE_CRUMBS = [
  // ── Admin: Org Users ──────────────────────────────────
  {
    pattern: /^\/admin-panel\/orgusers\/list$/,
    crumbs: () => [
      { label: 'Organizations', to: null }
    ]
  },
  {
    pattern: /^\/admin-panel\/orgusers\/create$/,
    crumbs: () => [
      { label: 'Organizations', to: '/admin-panel/orgusers/list' },
      { label: 'Create New', to: null }
    ]
  },

  // ── Admin: Carbon Reports ─────────────────────────────
  {
    pattern: /^\/admin-panel\/carbon-reports\/?$/,
    crumbs: () => [
      { label: 'Carbon Reports', to: null }
    ]
  },
  {
    pattern: /^\/admin-panel\/carbon-reports\/(.+)$/,
    crumbs: () => [
      { label: 'Carbon Reports', to: '/admin-panel/carbon-reports' },
      { label: 'View Report', to: null }
    ]
  },

  // ── Admin: Helpdesk ───────────────────────────────────
  {
    pattern: /^\/admin-panel\/helpdesk\/ticket\/list$/,
    crumbs: () => [
      { label: 'Support Tickets', to: null }
    ]
  },
  {
    pattern: /^\/admin-panel\/helpdesk\/ticket\/details\/.+$/,
    crumbs: () => [
      { label: 'Support Tickets', to: '/admin-panel/helpdesk/ticket/list' },
      { label: 'Ticket Details', to: null }
    ]
  },
  {
    pattern: /^\/admin-panel\/helpdesk\/dashboard$/,
    crumbs: () => [
      { label: 'Support', to: null }
    ]
  },

  // ── Calculate (admin): Structure & Org ───────────────
  {
    pattern: /^\/calculate\/structure$/,
    crumbs: () => [
      { label: 'Structure', to: null }
    ]
  },
  {
    pattern: /^\/calculate\/orguser$/,
    crumbs: () => [
      { label: 'Organizations', to: '/calculate/alluser' },
      { label: 'Create New', to: null }
    ]
  },
  {
    pattern: /^\/calculate\/alluser$/,
    crumbs: () => [
      { label: 'Organizations', to: null }
    ]
  },
  {
    pattern: /^\/calculate\/list$/,
    crumbs: () => [
      { label: 'Organizations', to: null }
    ]
  },
  {
    pattern: /^\/calculate\/visit\/(.+)$/,
    crumbs: () => [
      { label: 'Organizations', to: '/calculate/alluser' },
      { label: 'Organization Detail', to: null }
    ]
  },
  {
    pattern: /^\/calculate\/usermain\/(.+)$/,
    crumbs: () => [
      { label: 'Organizations', to: '/calculate/alluser' },
      { label: 'User Dashboard', to: null }
    ]
  },
  {
    pattern: /^\/calculate\/structureview$/,
    crumbs: () => [
      { label: 'Structure', to: '/calculate/structure' },
      { label: 'Structure View', to: null }
    ]
  },
  {
    pattern: /^\/calculate\/category\/(.+)\/(.+)$/,
    crumbs: (m) => [
      { label: 'Carbon Footprint', to: '/calculate/carbon-footprint' },
      { label: `Category ${m[2]}`, to: null }
    ]
  },

  // ── Calculate: Carbon Footprint ──────────────────────
  {
    pattern: /^\/calculate\/carbon-footprint\/?$/,
    crumbs: () => [
      { label: 'Carbon Footprint', to: null }
    ]
  },
  {
    pattern: /^\/calculate\/carbon-footprint\/category\/(.+)$/,
    crumbs: (m) => [
      { label: 'Carbon Footprint', to: '/calculate/carbon-footprint' },
      { label: `Category ${m[1]}`, to: null }
    ]
  },
  {
    pattern: /^\/calculate\/carbon-footprint\/report$/,
    crumbs: () => [
      { label: 'Carbon Footprint', to: '/calculate/carbon-footprint' },
      { label: 'Report', to: null }
    ]
  },

  // ── Calculate: Helpdesk ───────────────────────────────
  {
    pattern: /^\/calculate\/helpdesk\/ticket\/list$/,
    crumbs: () => [
      { label: 'Support Tickets', to: null }
    ]
  },
  {
    pattern: /^\/calculate\/helpdesk\/ticket\/create$/,
    crumbs: () => [
      { label: 'Support Tickets', to: '/calculate/helpdesk/ticket/list' },
      { label: 'New Ticket', to: null }
    ]
  },
  {
    pattern: /^\/calculate\/helpdesk\/ticket\/details\/.+$/,
    crumbs: () => [
      { label: 'Support Tickets', to: '/calculate/helpdesk/ticket/list' },
      { label: 'Ticket Details', to: null }
    ]
  },
  {
    pattern: /^\/calculate\/helpdesk\/dashboard$/,
    crumbs: () => [
      { label: 'Support', to: null }
    ]
  },

  // ── Orguser routes ────────────────────────────────────
  {
    pattern: /^\/orguser\/dashboard$/,
    crumbs: () => [
      { label: 'Dashboard', to: null }
    ]
  },
  {
    pattern: /^\/orguser\/organization-setup$/,
    crumbs: () => [
      { label: 'Organization Setup', to: null }
    ]
  },
  {
    pattern: /^\/orguser\/sites$/,
    crumbs: () => [
      { label: 'Sites', to: null }
    ]
  },
  {
    pattern: /^\/orguser\/carbon-footprint$/,
    crumbs: () => [
      { label: 'Carbon Footprint', to: null }
    ]
  },
  {
    pattern: /^\/orguser\/report$/,
    crumbs: () => [
      { label: 'Reports', to: null }
    ]
  },
  {
    pattern: /^\/orguser\/goals$/,
    crumbs: () => [
      { label: 'Emission Goals', to: null }
    ]
  }
];

/**
 * Resolve breadcrumb trail for the current pathname.
 * Returns null if no match (suppress breadcrumb).
 */
function resolveCrumbs(pathname) {
  for (const entry of ROUTE_CRUMBS) {
    const match = pathname.match(entry.pattern);
    if (match) return entry.crumbs(match);
  }
  return null;
}

// ==============================|| COMPONENT ||============================== //

export default function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();

  const crumbs = resolveCrumbs(location.pathname);
  if (!crumbs || crumbs.length === 0) return null;

  const pageTitle = crumbs[crumbs.length - 1].label;
  const homePath  = getHomePath();

  return (
    <div className="page-header">
      <div className="page-block">
        <Row className="align-items-center">
          <Col md={12} className="page-header-title text-capitalize">
            <h5>{pageTitle}</h5>
          </Col>
          <Col md={12}>
            <Breadcrumb listProps={{ style: { marginBottom: 0 } }}>
              {/* Home — always navigates to the correct dashboard */}
              <Breadcrumb.Item
                onClick={() => navigate(homePath)}
                style={{ cursor: 'pointer' }}
              >
                Home
              </Breadcrumb.Item>

              {/* Intermediate crumbs */}
              {crumbs.slice(0, -1).map((crumb, i) =>
                crumb.to ? (
                  <Breadcrumb.Item
                    key={i}
                    onClick={() => navigate(crumb.to)}
                    style={{ cursor: 'pointer' }}
                    className="text-capitalize"
                  >
                    {crumb.label}
                  </Breadcrumb.Item>
                ) : (
                  <Breadcrumb.Item key={i} className="text-capitalize" active>
                    {crumb.label}
                  </Breadcrumb.Item>
                )
              )}

              {/* Current page — not clickable */}
              <Breadcrumb.Item active className="text-capitalize">
                {pageTitle}
              </Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>
      </div>
    </div>
  );
}
