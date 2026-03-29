/**
 * Category Form Generator
 *
 * This script generates React form components for all carbon footprint categories
 * based on the template pattern established in Category1_1Form.jsx and Category1_2Form.jsx
 *
 * Usage: node generate-category-forms.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Category configurations
const CATEGORIES = [
  {
    code: '1.3',
    title: 'Refrigerant - use and leaks',
    description: 'AC and refrigerator gas leakage data',
    scope: 'Scope 1',
    icon: 'ph-snowflake',
    color: 'success',
    fields: [
      { name: 'acUnits', label: 'AC Units', unit: 'count' },
      { name: 'refrigerators', label: 'Refrigerators', unit: 'count' },
      { name: 'gasLeakage', label: 'Gas Leakage', unit: 'kg' }
    ],
    nextCategory: '1.4'
  },
  {
    code: '1.4',
    title: 'Fire extinguishers',
    description: 'CO₂ fire extinguisher refill data',
    scope: 'Scope 1',
    icon: 'ph-fire-extinguisher',
    color: 'warning',
    fields: [
      { name: 'co2Refills', label: 'CO₂ Refills', unit: 'kg' }
    ],
    nextCategory: '1.5'
  },
  {
    code: '1.5',
    title: 'GHG sink - Tree plantation',
    description: 'Carbon sequestration from tree planting',
    scope: 'Scope 1',
    icon: 'ph-tree',
    color: 'success',
    fields: [
      { name: 'treeCount', label: 'Trees Planted', unit: 'count' }
    ],
    nextCategory: '2'
  },
  {
    code: '2',
    title: 'Purchased energy',
    description: 'Electricity consumption',
    scope: 'Scope 2',
    icon: 'ph-lightning',
    color: 'warning',
    fields: [
      { name: 'eb', label: 'Electricity Board', unit: 'kWh' },
      { name: 'dg', label: 'Diesel Generator', unit: 'kWh' }
    ],
    nextCategory: '3.1'
  },
  {
    code: '3.1',
    title: 'Transport fuel combustion',
    description: 'Fuel consumption between plants',
    scope: 'Scope 3',
    icon: 'ph-truck',
    color: 'danger',
    fields: [
      { name: 'diesel', label: 'Diesel', unit: 'L' },
      { name: 'petrol', label: 'Petrol', unit: 'L' }
    ],
    nextCategory: '3.2'
  },
  {
    code: '3.2',
    title: 'Upstream road transportation',
    description: 'Tanned leather transportation',
    scope: 'Scope 3',
    icon: 'ph-road-horizon',
    color: 'secondary',
    fields: [
      { name: 'distance', label: 'Distance', unit: 'km' },
      { name: 'weight', label: 'Weight', unit: 'kg' }
    ],
    nextCategory: '3.3.1'
  },
  {
    code: '3.3.1',
    title: 'Upstream chemicals (Pernambut)',
    description: 'Chemical transportation to Pernambut',
    scope: 'Scope 3',
    icon: 'ph-flask',
    color: 'info',
    fields: [
      { name: 'distance', label: 'Distance', unit: 'km' },
      { name: 'weight', label: 'Weight', unit: 'kg' }
    ],
    nextCategory: '3.3.2'
  },
  {
    code: '3.3.2',
    title: 'Upstream chemicals (Thirumudivakkam)',
    description: 'Chemical transportation to Thirumudivakkam',
    scope: 'Scope 3',
    icon: 'ph-flask',
    color: 'info',
    fields: [
      { name: 'distance', label: 'Distance', unit: 'km' },
      { name: 'weight', label: 'Weight', unit: 'kg' }
    ],
    nextCategory: '3.4.1'
  },
  {
    code: '3.4.1',
    title: 'Upstream sea transportation',
    description: 'Chemical import by sea',
    scope: 'Scope 3',
    icon: 'ph-boat',
    color: 'primary',
    fields: [
      { name: 'distance', label: 'Distance', unit: 'km' },
      { name: 'weight', label: 'Weight', unit: 'kg' }
    ],
    nextCategory: '3.5.1'
  },
  {
    code: '3.5.1',
    title: 'Downstream road transportation',
    description: 'Finished leather transportation',
    scope: 'Scope 3',
    icon: 'ph-truck',
    color: 'success',
    fields: [
      { name: 'distance', label: 'Distance', unit: 'km' },
      { name: 'weight', label: 'Weight', unit: 'kg' }
    ],
    nextCategory: '3.5.2'
  },
  {
    code: '3.5.2',
    title: 'Downstream sea transportation',
    description: 'Finished leather export by sea',
    scope: 'Scope 3',
    icon: 'ph-boat',
    color: 'primary',
    fields: [
      { name: 'distance', label: 'Distance', unit: 'km' },
      { name: 'weight', label: 'Weight', unit: 'kg' }
    ],
    nextCategory: '3.2.3a'
  },
  {
    code: '3.2.3a',
    title: 'Waste transportation (Pernambut)',
    description: 'Solid waste disposal from Pernambut',
    scope: 'Scope 3',
    icon: 'ph-trash',
    color: 'danger',
    fields: [
      { name: 'distance', label: 'Distance', unit: 'km' },
      { name: 'weight', label: 'Weight', unit: 'kg' }
    ],
    nextCategory: '3.2.3b'
  },
  {
    code: '3.2.3b',
    title: 'Waste transportation (Thirumudivakkam)',
    description: 'Solid waste disposal from Thirumudivakkam',
    scope: 'Scope 3',
    icon: 'ph-trash',
    color: 'danger',
    fields: [
      { name: 'distance', label: 'Distance', unit: 'km' },
      { name: 'weight', label: 'Weight', unit: 'kg' }
    ],
    nextCategory: null // Last category
  }
];

// Generate form component code
function generateFormComponent(config) {
  const componentName = `Category${config.code.replace(/\./g, '_')}Form`;
  const urlCode = config.code;

  // Generate monthly data fields
  const monthlyDataFields = config.fields.map(f => `${f.name}: 0`).join(',\n        ');

  // Generate total fields
  const totalFields = config.fields.map(f => {
    const capitalizedName = f.name.charAt(0).toUpperCase() + f.name.slice(1);
    return `total${capitalizedName}: 0`;
  }).join(',\n      ');

  // Generate calculation code
  const calculateTotals = config.fields.map(f => {
    const capitalizedName = f.name.charAt(0).toUpperCase() + f.name.slice(1);
    return `site.total${capitalizedName} = site.monthlyData.reduce((sum, m) => sum + m.${f.name}, 0);`;
  }).join('\n    ');

  // Generate table headers
  const tableHeaders = config.fields.map(f => `
                      <th style={{ minWidth: '150px' }}>
                        ${f.label} (${f.unit})
                        <i className="ph ph-info ms-1" title="${f.label}"></i>
                      </th>`).join('');

  // Generate table cells
  const tableCells = config.fields.map(f => `
                        <td>
                          <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            value={monthData.${f.name} || ''}
                            onChange={(e) =>
                              handleMonthlyDataChange(index, monthIndex, '${f.name}', e.target.value)
                            }
                            placeholder="0.00"
                          />
                        </td>`).join('');

  // Generate footer totals
  const footerTotals = config.fields.map(f => {
    const capitalizedName = f.name.charAt(0).toUpperCase() + f.name.slice(1);
    return `<th>{site.total${capitalizedName}.toFixed(2)} ${f.unit}</th>`;
  }).join('\n                      ');

  // Generate grand total cards
  const grandTotalCards = config.fields.map((f, idx) => {
    const capitalizedName = f.name.charAt(0).toUpperCase() + f.name.slice(1);
    const colors = ['primary', 'success', 'warning', 'info', 'danger'];
    const color = colors[idx % colors.length];
    return `
            <Col md={${12 / Math.min(config.fields.length, 3)}}>
              <Card className="border-${color}">
                <Card.Body className="text-center">
                  <h6 className="text-muted">Total ${f.label}</h6>
                  <h3 className="text-${color} mb-0">{grandTotals.${f.name}.toFixed(2)} ${f.unit}</h3>
                </Card.Body>
              </Card>
            </Col>`;
  }).join('');

  // Generate grand totals calculation
  const grandTotalsCalc = config.fields.map(f => {
    const capitalizedName = f.name.charAt(0).toUpperCase() + f.name.slice(1);
    return `${f.name}: sites.reduce((sum, site) => sum + site.total${capitalizedName}, 0)`;
  }).join(',\n      ');

  const nextNav = config.nextCategory
    ? `navigate('/calculate/carbon-footprint/category/${config.nextCategory}');`
    : `navigate('/calculate/carbon-footprint');`;

  return `import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

// react-bootstrap
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import Stack from 'react-bootstrap/Stack';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

// project-imports
import MainCard from 'components/MainCard';

const MONTHS = [
  'Apr-24', 'May-24', 'Jun-24', 'Jul-24', 'Aug-24', 'Sep-24',
  'Oct-24', 'Nov-24', 'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25'
];

// ==============================|| CATEGORY ${config.code} FORM ||============================== //

export default function ${componentName}() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [activeSiteIndex, setActiveSiteIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const res = await axios.get(\`\${apiUrl}/api/carbon/category/${urlCode}\`, {
        headers: {
          Authorization: \`Bearer \${token}\`
        }
      });

      if (res.data.category && res.data.category.sites && res.data.category.sites.length > 0) {
        setSites(res.data.category.sites);
      } else {
        addNewSite();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      addNewSite();
    } finally {
      setLoading(false);
    }
  };

  const addNewSite = () => {
    const newSite = {
      siteName: '',
      monthlyData: MONTHS.map(month => ({
        month,
        ${monthlyDataFields}
      })),
      ${totalFields}
    };
    setSites([...sites, newSite]);
    setActiveSiteIndex(sites.length);
  };

  const removeSite = (index) => {
    if (sites.length === 1) {
      Swal.fire('Error', 'You must have at least one site', 'error');
      return;
    }

    Swal.fire({
      title: 'Remove Site?',
      text: 'This will delete all data for this site.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it'
    }).then((result) => {
      if (result.isConfirmed) {
        const newSites = sites.filter((_, i) => i !== index);
        setSites(newSites);
        if (activeSiteIndex >= newSites.length) {
          setActiveSiteIndex(newSites.length - 1);
        }
        Swal.fire('Removed!', 'Site has been removed.', 'success');
      }
    });
  };

  const handleSiteNameChange = (index, value) => {
    const newSites = [...sites];
    newSites[index].siteName = value;
    setSites(newSites);
  };

  const handleMonthlyDataChange = (siteIndex, monthIndex, field, value) => {
    const newSites = [...sites];
    const numValue = parseFloat(value) || 0;
    newSites[siteIndex].monthlyData[monthIndex][field] = numValue;

    calculateSiteTotals(newSites[siteIndex]);
    setSites(newSites);
  };

  const calculateSiteTotals = (site) => {
    ${calculateTotals}
  };

  const getGrandTotals = () => {
    return {
      ${grandTotalsCalc}
    };
  };

  const handleSave = async () => {
    const invalidSite = sites.find(site => !site.siteName.trim());
    if (invalidSite) {
      Swal.fire('Error', 'Please enter a name for all sites', 'error');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      await axios.post(
        \`\${apiUrl}/api/carbon/category/${urlCode}\`,
        { sites },
        {
          headers: {
            Authorization: \`Bearer \${token}\`
          }
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Category ${config.code} data has been saved successfully.',
        timer: 2000
      });
    } catch (error) {
      console.error('Error saving data:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save data', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    await handleSave();
    ${nextNav}
  };

  const grandTotals = getGrandTotals();

  return (
    <>
      <MainCard>
        <Row className="align-items-center">
          <Col>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate('/calculate/carbon-footprint')}
              className="mb-2"
            >
              <i className="ph ph-arrow-left me-2" />
              Back to Categories
            </Button>
            <h4 className="mb-1">Category ${config.code} - ${config.title}</h4>
            <p className="text-muted mb-0">
              ${config.description}
            </p>
          </Col>
          <Col xs="auto">
            <Badge bg="${config.color}" className="px-3 py-2">
              <i className="${config.icon} me-2" />
              ${config.scope}
            </Badge>
          </Col>
        </Row>
      </MainCard>

      <MainCard className="mt-3">
        <Tabs
          activeKey={activeSiteIndex}
          onSelect={(k) => setActiveSiteIndex(parseInt(k))}
          className="mb-3"
        >
          {sites.map((site, index) => (
            <Tab
              key={index}
              eventKey={index}
              title={
                <span>
                  <i className="ph ph-map-pin me-1" />
                  {site.siteName || \`Site \${index + 1}\`}
                  {sites.length > 1 && (
                    <i
                      className="ph ph-x ms-2 text-danger"
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSite(index);
                      }}
                    />
                  )}
                </span>
              }
            >
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Site Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., BAB Pernambut"
                      value={site.siteName}
                      onChange={(e) => handleSiteNameChange(index, e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Alert variant="info" className="mb-3">
                <i className="ph ph-info me-2" />
                Enter monthly data. Values will be automatically totaled.
              </Alert>

              <div className="table-responsive">
                <Table bordered hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: '120px' }}>Month</th>${tableHeaders}
                    </tr>
                  </thead>
                  <tbody>
                    {site.monthlyData.map((monthData, monthIndex) => (
                      <tr key={monthIndex}>
                        <td className="fw-bold">{monthData.month}</td>${tableCells}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-secondary">
                    <tr>
                      <th>Site Total</th>
                      ${footerTotals}
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Tab>
          ))}
        </Tabs>

        <Button
          variant="outline-primary"
          onClick={addNewSite}
          className="mt-3"
        >
          <i className="ph ph-plus me-2" />
          Add Another Site
        </Button>
      </MainCard>

      {sites.length > 1 && (
        <MainCard className="mt-3 bg-light">
          <h5 className="mb-3">
            <i className="ph ph-chart-bar me-2" />
            Grand Total (All Sites)
          </h5>
          <Row>${grandTotalCards}
          </Row>
        </MainCard>
      )}

      <MainCard className="mt-3">
        <Stack direction="horizontal" gap={2} className="justify-content-end">
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/calculate/carbon-footprint')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="outline-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveAndNext}
            disabled={saving}
          >
            {saving ? 'Saving...' : (
              <>
                Save & Next
                <i className="ph ph-arrow-right ms-2" />
              </>
            )}
          </Button>
        </Stack>
      </MainCard>
    </>
  );
}
`;
}

// Main execution
console.log('🚀 Generating category forms...\n');

const outputDir = path.join(__dirname, 'src', 'sections', 'calculator', 'carbon-footprint');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

CATEGORIES.forEach(config => {
  const fileName = `Category${config.code.replace(/\./g, '_')}Form.jsx`;
  const filePath = path.join(outputDir, fileName);

  const componentCode = generateFormComponent(config);

  fs.writeFileSync(filePath, componentCode, 'utf8');

  console.log(`✅ Created: ${fileName}`);
});

console.log(`\n🎉 Successfully generated ${CATEGORIES.length} category forms!`);
console.log(`📁 Output directory: ${outputDir}`);
console.log(`\n📝 Next steps:`);
console.log(`1. Update CalculatorRoutes.jsx to import and route these forms`);
console.log(`2. Test each form to ensure it works correctly`);
console.log(`3. Customize forms as needed based on actual schema structures`);
