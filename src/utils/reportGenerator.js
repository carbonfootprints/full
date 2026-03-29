// ==============================|| CARBON REPORT GENERATOR ||============================== //
// Client-side PDF and Excel generation using jsPDF + xlsx (SheetJS)
// Called with data from: GET /api/orguser/report-data OR admin carbon data endpoint

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const SCOPE_COLORS = {
  1: [30, 136, 229],   // blue
  2: [67, 160, 71],    // green
  3: [255, 152, 0],    // orange
};

const safe = (n) => (parseFloat(n) || 0).toFixed(2);

// ==============================|| PDF GENERATOR ||============================== //

export function downloadCarbonReportPDF(orguser, categories, scopeTotals) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const orgName = orguser.organisationName || 'Organization';

  // ——— COVER PAGE ———
  doc.setFillColor(15, 76, 129);
  doc.rect(0, 0, W, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Carbon Footprint Report', W / 2, 28, { align: 'center' });
  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.text(orgName, W / 2, 40, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Reporting Period: Apr 2024 – Mar 2025', W / 2, 50, { align: 'center' });

  doc.setTextColor(50, 50, 50);
  let y = 75;

  // Org info box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, y, W - 28, 42, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Organization Details', 20, y + 8);
  doc.setFont('helvetica', 'normal');
  const info = [
    ['Contact Person', orguser.contactPerson || '-'],
    ['Email', orguser.email || '-'],
    ['Phone', orguser.contactNumber || '-'],
    ['Address', orguser.address || '-'],
    ['No. of Sites', String(orguser.numberOfSites || '-')],
    ['No. of Employees', String(orguser.numberOfEmployees || '-')],
  ];
  let ix = 0;
  for (const [k, v] of info) {
    const col = ix % 2 === 0 ? 20 : W / 2 + 5;
    const row = y + 16 + Math.floor(ix / 2) * 9;
    doc.setFont('helvetica', 'bold');
    doc.text(`${k}:`, col, row);
    doc.setFont('helvetica', 'normal');
    doc.text(v, col + 38, row);
    ix++;
  }

  y += 52;

  // Grand total highlight
  doc.setFillColor(15, 76, 129);
  doc.roundedRect(14, y, W - 28, 22, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total CO\u2082e Emissions', W / 2, y + 8, { align: 'center' });
  doc.setFontSize(16);
  doc.text(`${safe(scopeTotals?.grandTotal)} kgCO\u2082e`, W / 2, y + 18, { align: 'center' });

  y += 30;
  doc.setTextColor(50, 50, 50);

  // Scope summary table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Scope-wise Summary', 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [['Scope', 'Description', 'CO\u2082e (kg)']],
    body: [
      ['Scope 1', 'Direct Emissions (Combustion, Refrigerants, Trees)', safe(scopeTotals?.scope1)],
      ['Scope 2', 'Indirect Emissions (Purchased Electricity)', safe(scopeTotals?.scope2)],
      ['Scope 3', 'Other Indirect Emissions (Transportation)', safe(scopeTotals?.scope3)],
      ['GRAND TOTAL', '', safe(scopeTotals?.grandTotal)],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [15, 76, 129] },
    foot: [],
    columnStyles: { 2: { halign: 'right' } },
    didParseCell: (data) => {
      if (data.row.index === 3) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [230, 240, 255];
      }
    }
  });

  y = doc.lastAutoTable.finalY + 15;

  // ——— CATEGORY PAGES ———
  const scopeGroups = [
    { scope: 1, label: 'Scope 1 — Direct Emissions', cats: categories.filter(c => c.scope === 1) },
    { scope: 2, label: 'Scope 2 — Indirect Emissions (Electricity)', cats: categories.filter(c => c.scope === 2) },
    { scope: 3, label: 'Scope 3 — Other Indirect Emissions', cats: categories.filter(c => c.scope === 3) },
  ];

  for (const group of scopeGroups) {
    if (group.cats.length === 0) continue;
    doc.addPage();
    y = 20;

    const [r, g, b] = SCOPE_COLORS[group.scope];
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, W, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(group.label, W / 2, 10, { align: 'center' });
    doc.setTextColor(50, 50, 50);
    y = 22;

    for (const cat of group.cats) {
      if (y > 240) { doc.addPage(); y = 20; }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const isSink = cat.code === '1.5';
      doc.text(`Category ${cat.code} — ${cat.title}`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      y += 6;

      const co2e = cat.totalCO2e || 0;
      const label = isSink ? `Carbon Sink: ${safe(co2e)} kgCO\u2082e (negative)` : `Total CO\u2082e: ${safe(co2e)} kg`;
      doc.setTextColor(isSink ? 34 : 15, isSink ? 139 : 76, isSink ? 34 : 129);
      doc.text(label, 14, y);
      doc.setTextColor(50, 50, 50);
      y += 5;

      // Sites summary
      const sites = cat.sites || [];
      if (sites.length > 0) {
        const siteRows = sites.map(s => [
          s.siteName || '-',
          ...Object.entries(s)
            .filter(([k]) => k.startsWith('total') && k !== 'totalTreeCount')
            .map(([k, v]) => `${k.replace('total', '')}: ${safe(v)}`)
        ]);

        autoTable(doc, {
          startY: y,
          head: [['Site Name', 'Site Totals']],
          body: sites.map(s => [
            s.siteName || '-',
            Object.entries(s)
              .filter(([k, v]) => k.startsWith('total') && typeof v === 'number')
              .map(([k, v]) => `${k}: ${safe(v)}`)
              .join(' | ') || '-'
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [r, g, b] },
          margin: { left: 14, right: 14 },
        });
        y = doc.lastAutoTable.finalY + 6;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('No data entered', 14, y);
        doc.setTextColor(50, 50, 50);
        y += 8;
      }

      doc.setDrawColor(200, 200, 200);
      doc.line(14, y, W - 14, y);
      y += 5;
    }
  }

  // ——— FOOTER ON LAST PAGE ———
  doc.addPage();
  y = 30;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Emission Factor Sources', 14, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const sources = [
    '• IPCC 2006 Guidelines for National Greenhouse Gas Inventories — Wood, Diesel, LPG emission factors',
    '• IPCC AR6 WGI Chapter 7 (Table 7.15) — Refrigerant GWP values (HFC32=771, R134a=1526)',
    '• CEA CO₂ Baseline Database for the Indian Power Sector (Ver. 20, Dec 2024) — Electricity EF: 0.727 kgCO₂/kWh',
    '• Data.gov.in — CO₂ Emissions From Various Transport Modes In India — Road freight: 160 gm/tkm',
    '• UK Government GHG Conversion Factors for Company Reporting, 2025 — Sea freight EFs',
    '• IPCC EFDB (EF ID: 328656) — Tree carbon sequestration: 27.5 kgCO₂e/tree/year',
  ];
  for (const s of sources) {
    doc.text(s, 14, y, { maxWidth: W - 28 });
    y += 10;
  }

  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, y);
  doc.text('This report was generated by the Carbon Footprint Management System', 14, y + 6);

  // Add page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, W - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
    doc.text(orgName, 14, doc.internal.pageSize.getHeight() - 8);
  }

  doc.save(`${orgName.replace(/[^a-z0-9]/gi, '_')}_carbon_report.pdf`);
}


// ==============================|| EXCEL GENERATOR ||============================== //

export function downloadCarbonReportExcel(orguser, categories, scopeTotals) {
  const wb = XLSX.utils.book_new();
  const orgName = orguser.organisationName || 'Organization';

  // ——— Sheet 1: Summary ———
  const summaryData = [
    ['Carbon Footprint Report'],
    ['Organization:', orgName],
    ['Contact Person:', orguser.contactPerson || '-'],
    ['Email:', orguser.email || '-'],
    ['Phone:', orguser.contactNumber || '-'],
    ['Address:', orguser.address || '-'],
    ['Reporting Period:', 'Apr 2024 – Mar 2025'],
    ['Report Released:', orguser.reportReleasedAt ? new Date(orguser.reportReleasedAt).toLocaleDateString() : '-'],
    [],
    ['SCOPE SUMMARY'],
    ['Scope', 'Description', 'kgCO2e'],
    ['Scope 1', 'Direct Emissions (Combustion, Refrigerants, Trees)', scopeTotals?.scope1 || 0],
    ['Scope 2', 'Indirect Emissions (Purchased Electricity)', scopeTotals?.scope2 || 0],
    ['Scope 3', 'Other Indirect Emissions (Transportation)', scopeTotals?.scope3 || 0],
    ['GRAND TOTAL', '', scopeTotals?.grandTotal || 0],
    [],
    ['CATEGORY BREAKDOWN'],
    ['Category Code', 'Title', 'Scope', 'Data Entered', 'Calculated', 'kgCO2e'],
    ...categories.map(c => [
      c.code, c.title, `Scope ${c.scope}`,
      c.dataEntered ? 'Yes' : 'No',
      c.calculated ? 'Yes' : 'No',
      c.totalCO2e || 0
    ])
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  ws1['!cols'] = [{ wch: 20 }, { wch: 50 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

  // ——— Sheet per category ———
  for (const cat of categories) {
    const sheetName = `Cat_${cat.code.replace(/\./g, '_')}`;
    const rows = [
      [`Category ${cat.code} — ${cat.title}`],
      [`Scope ${cat.scope}`],
      [`Total CO2e: ${safe(cat.totalCO2e)} kgCO2e`],
      [],
    ];

    const sites = cat.sites || [];
    if (sites.length > 0) {
      rows.push(['Site Name', ...Object.keys(sites[0]).filter(k => k.startsWith('total'))]);
      for (const s of sites) {
        rows.push([
          s.siteName || '-',
          ...Object.entries(s)
            .filter(([k]) => k.startsWith('total'))
            .map(([, v]) => parseFloat(v) || 0)
        ]);
      }
      rows.push([]);
      rows.push(['Grand Totals']);
      const gt = cat.grandTotals || {};
      for (const [k, v] of Object.entries(gt)) {
        if (typeof v === 'number') rows.push([k, parseFloat(v.toFixed(4))]);
      }
    } else {
      rows.push(['No data entered for this category']);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  XLSX.writeFile(wb, `${orgName.replace(/[^a-z0-9]/gi, '_')}_carbon_report.xlsx`);
}
