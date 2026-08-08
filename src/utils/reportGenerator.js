// ==============================|| CARBON REPORT GENERATOR ||============================== //
// Client-side PDF and Excel generation using jsPDF + xlsx (SheetJS)
// Called with data from: GET /api/admin/orgusers/:id/carbon-data
//
// NOTE: jsPDF built-in Helvetica does NOT support Unicode subscript/superscript.
// All PDF text must use plain ASCII only: CO2e (not CO2e with subscript), m2 (not m²), etc.

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const SCOPE_COLORS = {
  1: [30, 136, 229],    // blue
  2: [67, 160, 71],     // green
  3: [255, 152, 0],     // orange
  4: [103, 58, 183],    // purple
  5: [0, 150, 136],     // teal
};

const SCOPE_LABELS = {
  1: 'Scope 1 - Direct Emissions',
  2: 'Scope 2 - Indirect Emissions (Purchased Electricity)',
  3: 'Scope 3 - Other Indirect Emissions (Transportation)',
  4: 'Scope 4 - Indirect Emissions from Products & Services Used',
  5: 'Scope 5 - Indirect GHG Emissions from Use of Products',
};

const safe = (n) => (parseFloat(n) || 0).toFixed(2);

// Build human-readable input summary from rawInputTotals
// Use only ASCII characters - no Unicode subscript/superscript
function getInputLines(code, ri = {}) {
  const n = (v, dec = 2) => (parseFloat(v) || 0).toFixed(dec);
  switch (code) {
    case '1.1': return [
      `Wood: ${n(ri.woodenPalletsKg)} kg pallets + ${n(ri.firewoodKg)} kg firewood`,
      `Diesel: ${n(ri.dieselL)} L`
    ];
    case '1.2': return [`LPG: ${n(ri.lpgKg)} kg`];
    case '1.3': return [
      `AC Units: ${ri.acUnits || 0}`,
      `Refrigerators: ${ri.refrigerators || 0}`,
      `Gas Leakage: ${n(ri.gasLeakageKg)} kg`
    ];
    case '1.4': return [`CO2 Refilled: ${n(ri.co2RefilledKg)} kg`];
    case '1.6': return [`Trees: ${ri.trees || 0}`];
    case '2':   return [`Electricity: ${n(ri.electricityKwh)} kWh`];
    case '3.1': return [`Diesel: ${n(ri.dieselL)} L`, `Trips: ${ri.trips || 0}`];
    case '3.2':
    case '3.5.1': return [`Weight: ${n(ri.weightKg)} kg`, `Tonne-km: ${n(ri.tonneKm)}`];
    case '3.3.1':
    case '3.3.2': return [`Quantity: ${n(ri.quantityKg)} kg`, `Tonne-km: ${n(ri.tonneKm)}`];
    case '3.4.1':
    case '3.4.2':
    case '3.5.2': return [`Weight: ${n(ri.weightTonnes)} t`, `Tonne-km: ${n(ri.tonneKm)}`];
    case '3.2.3a':
    case '3.2.3b': return [`Weight: ${n(ri.weightTonnes)} t`, `Tonne-km: ${n(ri.tonneKm)}`];
    case '3.6': return [`Car groups: ${ri.carGroups || 0}`, `Air groups: ${ri.airGroups || 0}`];
    case '4.1':
    case '4.7': return [`Area: ${n(ri.totalAreaM2)} m2`];
    case '4.2.a':
    case '4.2.b': return [`Chemicals: ${n(ri.totalChemicalsKg)} kg`];
    case '4.3': return [`Water: ${n(ri.totalPurchasedM3)} m3`];
    case '4.4': return [`Effluent: ${n(ri.totalEffluentM3)} m3`];
    case '4.5': return [`Waste: ${n(ri.totalWeightTonnes)} t`];
    case '4.6': return [`Car km: ${n(ri.totalCarKm)}`, `Moto km: ${n(ri.totalMotoKm)}`];
    case '5.1': return [`Electricity: ${n(ri.totalKWh)} kWh`];
    case '5.2': return [`Weight disposed: ${n(ri.totalWeightKg)} kg`];
    default: return [];
  }
}

// ==============================|| PDF GENERATOR ||============================== //

export function downloadCarbonReportPDF(orguser, categoriesByScope, scopeTotals) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const orgName = orguser?.organisationName || 'Organization';

  // Flatten all categories preserving scope number
  const allCats = [
    ...(categoriesByScope.scope1 || []).map(c => ({ ...c, scopeNum: 1 })),
    ...(categoriesByScope.scope2 || []).map(c => ({ ...c, scopeNum: 2 })),
    ...(categoriesByScope.scope3 || []).map(c => ({ ...c, scopeNum: 3 })),
    ...(categoriesByScope.scope4 || []).map(c => ({ ...c, scopeNum: 4 })),
    ...(categoriesByScope.scope5 || []).map(c => ({ ...c, scopeNum: 5 })),
  ];

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
  doc.text('Reporting Period: Apr 2024 - Mar 2025', W / 2, 50, { align: 'center' });

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
    ['Contact Person', orguser?.contactPerson || '-'],
    ['Email',          orguser?.email          || '-'],
    ['Phone',          orguser?.contactNumber   || '-'],
    ['Address',        orguser?.address         || '-'],
    ['No. of Sites',   String(orguser?.numberOfSites    || '-')],
    ['No. of Employees', String(orguser?.numberOfEmployees || '-')],
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

  // Grand total highlight — use ASCII only: kgCO2e not kgCO₂e
  doc.setFillColor(15, 76, 129);
  doc.roundedRect(14, y, W - 28, 22, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total CO2e Emissions', W / 2, y + 8, { align: 'center' });
  doc.setFontSize(16);
  doc.text(`${safe(scopeTotals?.grandTotal)} kgCO2e`, W / 2, y + 18, { align: 'center' });
  y += 30;

  doc.setTextColor(50, 50, 50);

  // Scope summary table — all 5 scopes
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Scope-wise Summary', 14, y);
  y += 5;

  const scopeRows = [
    ['Scope 1', 'Direct Emissions (Combustion, Refrigerants, Trees)',   safe(scopeTotals?.scope1)],
    ['Scope 2', 'Indirect Emissions (Purchased Electricity)',            safe(scopeTotals?.scope2)],
    ['Scope 3', 'Other Indirect Emissions (Transportation)',             safe(scopeTotals?.scope3)],
    ['Scope 4', 'Indirect Emissions from Products & Services Used',      safe(scopeTotals?.scope4)],
    ['Scope 5', 'Indirect GHG Emissions from Use of Products',          safe(scopeTotals?.scope5)],
    ['GRAND TOTAL', '',                                                   safe(scopeTotals?.grandTotal)],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Scope', 'Description', 'CO2e (kg)']],
    body: scopeRows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 76, 129] },
    columnStyles: { 2: { halign: 'right' } },
    didParseCell: (data) => {
      if (data.row.index === scopeRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [230, 240, 255];
      }
    }
  });

  y = doc.lastAutoTable.finalY + 15;

  // ——— CATEGORY PAGES — grouped by scope ———
  const scopeNums = [1, 2, 3, 4, 5];
  for (const scopeNum of scopeNums) {
    const cats = allCats.filter(c => c.scopeNum === scopeNum);
    if (cats.length === 0) continue;

    doc.addPage();
    y = 20;

    const [r, g, b] = SCOPE_COLORS[scopeNum];
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, W, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(SCOPE_LABELS[scopeNum], W / 2, 10, { align: 'center' });
    doc.setTextColor(50, 50, 50);
    y = 22;

    for (const cat of cats) {
      if (y > 240) {
        doc.addPage();
        y = 20;
        // Repeat scope header on continuation page
        doc.setFillColor(r, g, b);
        doc.rect(0, 0, W, 14, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(SCOPE_LABELS[scopeNum] + ' (continued)', W / 2, 10, { align: 'center' });
        doc.setTextColor(50, 50, 50);
        y = 22;
      }

      const isSink = cat.code === '1.6';

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Category ${cat.code} - ${cat.title}`, 14, y);
      y += 6;

      // CO2e value — plain ASCII
      const co2e = cat.totalCO2e || 0;
      const valueLabel = isSink
        ? `Carbon Sink: ${safe(co2e)} kgCO2e (negative)`
        : `Total CO2e: ${safe(co2e)} kgCO2e`;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(r, g, b);
      doc.text(valueLabel, 14, y);
      doc.setTextColor(50, 50, 50);
      y += 5;

      // Input quantities from rawInputTotals
      const ri = cat.rawInputTotals || {};
      const inputLines = getInputLines(cat.code, ri);

      if (cat.dataEntered && inputLines.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        inputLines.forEach(line => {
          doc.text(`  - ${line}`, 14, y);
          y += 4;
        });
        doc.setTextColor(50, 50, 50);
      } else if (!cat.dataEntered) {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('  No data entered', 14, y);
        doc.setTextColor(50, 50, 50);
        y += 4;
      }

      // Status
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      const statusText = cat.calculated
        ? 'Calculated [OK]'
        : cat.dataEntered ? 'Data entered - pending calculation' : 'Pending';
      doc.setTextColor(cat.calculated ? 40 : 150, cat.calculated ? 160 : 150, cat.calculated ? 71 : 150);
      doc.text(statusText, 14, y);
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      y += 4;

      doc.setDrawColor(210, 210, 210);
      doc.line(14, y, W - 14, y);
      y += 5;
    }

    // Scope subtotal
    const scopeKey = `scope${scopeNum}`;
    const scopeTotal = scopeTotals?.[scopeKey] || 0;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(r, g, b);
    doc.text(`Scope ${scopeNum} Total: ${safe(scopeTotal)} kgCO2e`, W - 14, y, { align: 'right' });
    doc.setTextColor(50, 50, 50);
  }

  // ——— EMISSION FACTOR SOURCES PAGE ———
  doc.addPage();
  y = 30;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Emission Factor Sources', 14, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // All plain ASCII — no Unicode subscript chars
  const sources = [
    '- IPCC 2006 Guidelines for National Greenhouse Gas Inventories',
    '  Wood, Diesel, LPG emission factors',
    '- IPCC AR6 WGI Chapter 7 (Table 7.15)',
    '  Refrigerant GWP values (HFC32=771, R134a=1526)',
    '- CEA CO2 Baseline Database for the Indian Power Sector (Ver. 20, Dec 2024)',
    '  Electricity EF: 0.727 kgCO2/kWh',
    '- Data.gov.in: CO2 Emissions From Various Transport Modes In India',
    '  Road freight: 160 gm/tkm',
    '- UK Government GHG Conversion Factors for Company Reporting, 2025',
    '  Sea freight emission factors',
    '- IPCC EFDB (EF ID: 328656)',
    '  Tree carbon sequestration: 27.5 kgCO2e/tree/year',
    '- Defra GHG Conversion Factors 2024',
    '  Waste disposal, clothing in landfills: 496.78228 kgCO2e/tonne',
    '- LWG LCA data: Tanned leather: 3.07 kgCO2e/m2',
    '- Defra GHG Conversion Factors 2025: Water supply: 0.149 kgCO2e/m3',
  ];

  for (const s of sources) {
    doc.text(s, 14, y, { maxWidth: W - 28 });
    y += 6;
  }

  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const genDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(`Generated: ${genDate}`, 14, y);
  doc.text('This report was generated by the Carbon Footprint Management System', 14, y + 5);

  // Page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      W - 14,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'right' }
    );
    doc.text(orgName, 14, doc.internal.pageSize.getHeight() - 8);
  }

  doc.save(`${orgName.replace(/[^a-z0-9]/gi, '_')}_carbon_report.pdf`);
}


// ==============================|| EXCEL GENERATOR ||============================== //

export function downloadCarbonReportExcel(orguser, categoriesByScope, scopeTotals) {
  const wb = XLSX.utils.book_new();
  const orgName = orguser?.organisationName || 'Organization';

  const allCats = [
    ...(categoriesByScope.scope1 || []).map(c => ({ ...c, scopeNum: 1 })),
    ...(categoriesByScope.scope2 || []).map(c => ({ ...c, scopeNum: 2 })),
    ...(categoriesByScope.scope3 || []).map(c => ({ ...c, scopeNum: 3 })),
    ...(categoriesByScope.scope4 || []).map(c => ({ ...c, scopeNum: 4 })),
    ...(categoriesByScope.scope5 || []).map(c => ({ ...c, scopeNum: 5 })),
  ];

  // ——— Sheet 1: Summary ———
  const summaryData = [
    ['Carbon Footprint Report'],
    ['Organization:', orgName],
    ['Contact Person:', orguser?.contactPerson || '-'],
    ['Email:', orguser?.email || '-'],
    ['Phone:', orguser?.contactNumber || '-'],
    ['Address:', orguser?.address || '-'],
    ['Reporting Period:', 'Apr 2024 - Mar 2025'],
    ['Report Released:', orguser?.reportReleasedAt
      ? new Date(orguser.reportReleasedAt).toLocaleDateString()
      : '-'],
    [],
    ['SCOPE SUMMARY'],
    ['Scope', 'Description', 'kgCO2e'],
    ['Scope 1', 'Direct Emissions (Combustion, Refrigerants, Trees)',   scopeTotals?.scope1    || 0],
    ['Scope 2', 'Indirect Emissions (Purchased Electricity)',            scopeTotals?.scope2    || 0],
    ['Scope 3', 'Other Indirect Emissions (Transportation)',             scopeTotals?.scope3    || 0],
    ['Scope 4', 'Indirect Emissions from Products & Services Used',      scopeTotals?.scope4    || 0],
    ['Scope 5', 'Indirect GHG Emissions from Use of Products',          scopeTotals?.scope5    || 0],
    ['GRAND TOTAL', '',                                                   scopeTotals?.grandTotal || 0],
    [],
    ['CATEGORY BREAKDOWN'],
    ['Category Code', 'Title', 'Scope', 'Data Entered', 'Calculated', 'kgCO2e'],
    ...allCats.map(c => [
      c.code,
      c.title,
      `Scope ${c.scopeNum}`,
      c.dataEntered ? 'Yes' : 'No',
      c.calculated  ? 'Yes' : 'No',
      c.totalCO2e   || 0
    ])
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  ws1['!cols'] = [{ wch: 20 }, { wch: 55 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

  // ——— Sheet per category ———
  for (const cat of allCats) {
    const sheetName = `Cat_${cat.code.replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`.slice(0, 31);
    const ri = cat.rawInputTotals || {};
    const inputLines = getInputLines(cat.code, ri);
    const gt = cat.grandTotals || {};

    const rows = [
      [`Category ${cat.code} - ${cat.title}`],
      [`Scope ${cat.scopeNum}`],
      [`Total CO2e: ${safe(cat.totalCO2e)} kgCO2e`],
      [`Data Entered: ${cat.dataEntered ? 'Yes' : 'No'}   Calculated: ${cat.calculated ? 'Yes' : 'No'}`],
      [],
    ];

    if (inputLines.length > 0) {
      rows.push(['Input Quantities:']);
      inputLines.forEach(line => rows.push(['  ' + line]));
      rows.push([]);
    }

    if (Object.keys(gt).length > 0) {
      rows.push(['Computed Totals:']);
      for (const [k, v] of Object.entries(gt)) {
        if (typeof v === 'number') rows.push([k, parseFloat(v.toFixed(4))]);
      }
    }

    if (!cat.dataEntered) {
      rows.push(['No data entered for this category']);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  XLSX.writeFile(wb, `${orgName.replace(/[^a-z0-9]/gi, '_')}_carbon_report.xlsx`);
}
