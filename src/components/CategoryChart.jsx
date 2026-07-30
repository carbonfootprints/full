import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

// Colour palette consistent with the project's chart style
const COLORS = ['#04a9f5', '#1de9b6', '#f4c22b', '#f44236', '#13c2c2', '#7759de', '#e91e63', '#ff9800'];

const BASE_OPTIONS = {
  chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f0f0f0' },
  legend: { position: 'bottom', offsetY: 4 },
  tooltip: { y: { formatter: (v) => `${(+v || 0).toFixed(3)} kgCO₂e` } }
};

// ==============================|| CATEGORY CHART ||============================== //
// Renders the appropriate ApexChart based on the category code and calculations.
// Used in every category form after admin releases results.

export default function CategoryChart({ code, calculations }) {
  const config = useMemo(() => buildChart(code, calculations), [code, calculations]);
  if (!config) return null;
  return (
    <ReactApexChart
      options={config.options}
      series={config.series}
      type={config.type}
      height={config.height || 300}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Builder — returns { options, series, type, height } for each category
// ─────────────────────────────────────────────────────────────────────────────

function buildChart(code, calc) {
  if (!calc) return null;
  const sites = calc.siteCalculations || [];

  switch (code) {
    // ── 1.1  Wood & Diesel combustion ────────────────────────────────────────
    case '1.1': {
      const siteNames = sites.map((s) => s.siteName || '?');
      return {
        type: 'bar',
        height: 320,
        series: [
          { name: 'Wood CO₂e (kg)', data: sites.map((s) => +(s.woodenPalletsAndWood?.totalCO2e || 0).toFixed(3)) },
          { name: 'Diesel CO₂e (kg)', data: sites.map((s) => +(s.diesel?.totalCO2e || 0).toFixed(3)) }
        ],
        options: {
          ...BASE_OPTIONS,
          chart: { ...BASE_OPTIONS.chart, stacked: true },
          colors: ['#1de9b6', '#04a9f5'],
          xaxis: { categories: siteNames },
          plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
          yaxis: { title: { text: 'kgCO₂e' } },
          title: { text: 'CO₂e by Site & Fuel Type', align: 'left', style: { fontSize: '13px' } }
        }
      };
    }

    // ── 1.2  LPG combustion ──────────────────────────────────────────────────
    case '1.2': {
      const siteNames = sites.map((s) => s.siteName || '?');
      return {
        type: 'bar',
        height: 300,
        series: [
          { name: 'CO₂ (kg)', data: sites.map((s) => +(s.co2 || 0).toFixed(3)) },
          { name: 'N₂O CO₂e (kg)', data: sites.map((s) => +(s.n2o || 0).toFixed(3)) },
          { name: 'CH₄ CO₂e (kg)', data: sites.map((s) => +(s.ch4 || 0).toFixed(3)) }
        ],
        options: {
          ...BASE_OPTIONS,
          chart: { ...BASE_OPTIONS.chart, stacked: true },
          colors: ['#04a9f5', '#f4c22b', '#1de9b6'],
          xaxis: { categories: siteNames },
          plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
          yaxis: { title: { text: 'kgCO₂e' } },
          title: { text: 'LPG Emissions by Gas & Site', align: 'left', style: { fontSize: '13px' } }
        }
      };
    }

    // ── 1.3  Refrigerant leaks ───────────────────────────────────────────────
    case '1.3': {
      const siteNames = sites.map((s) => s.siteName || '?');
      const siteCO2e = sites.map((s) => +(s.totalCO2e || 0).toFixed(3));
      return {
        type: 'bar',
        height: 300,
        series: [{ name: 'Refrigerant CO₂e (kg)', data: siteCO2e }],
        options: {
          ...BASE_OPTIONS,
          colors: ['#7759de'],
          xaxis: { categories: siteNames },
          plotOptions: { bar: { horizontal: sites.length > 4, columnWidth: '50%', borderRadius: 4 } },
          yaxis: { title: { text: 'kgCO₂e' } },
          title: { text: 'Refrigerant Leakage by Site', align: 'left', style: { fontSize: '13px' } }
        }
      };
    }

    // ── 1.4  CO₂ fire extinguishers ──────────────────────────────────────────
    case '1.4': {
      const siteNames = sites.map((s) => s.siteName || '?');
      return {
        type: 'bar',
        height: 300,
        series: [{ name: 'CO₂ Refilled (kg)', data: sites.map((s) => +(s.totalKgRefilled || 0).toFixed(2)) },
                 { name: 'CO₂e Emissions (kg)', data: sites.map((s) => +(s.totalCO2e || 0).toFixed(3)) }],
        options: {
          ...BASE_OPTIONS,
          colors: ['#13c2c2', '#f44236'],
          xaxis: { categories: siteNames },
          plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 3 } },
          yaxis: { title: { text: 'kg' } },
          tooltip: { y: { formatter: (v, { seriesIndex }) => seriesIndex === 0 ? `${(+v).toFixed(2)} kg` : `${(+v).toFixed(3)} kgCO₂e` } },
          title: { text: 'CO₂ Extinguisher Refills vs Emissions', align: 'left', style: { fontSize: '13px' } }
        }
      };
    }

    // ── 1.5  Tree plantation (carbon sink) ───────────────────────────────────
    case '1.5': {
      const siteNames = sites.map((s) => s.siteName || '?');
      return {
        type: 'bar',
        height: 300,
        series: [
          { name: 'Trees Planted', data: sites.map((s) => +(s.trees || 0)) },
          { name: 'Carbon Sink (kgCO₂e)', data: sites.map((s) => +Math.abs(s.totalCarbonSink || 0).toFixed(1)) }
        ],
        options: {
          ...BASE_OPTIONS,
          colors: ['#1de9b6', '#04a9f5'],
          xaxis: { categories: siteNames },
          plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 3 } },
          yaxis: { title: { text: 'Count / kgCO₂e' } },
          tooltip: { y: { formatter: (v, { seriesIndex }) => seriesIndex === 0 ? `${v} trees` : `${(+v).toFixed(1)} kgCO₂e absorbed` } },
          title: { text: 'Carbon Sink by Site', align: 'left', style: { fontSize: '13px' } }
        }
      };
    }

    // ── 2   Purchased electricity ─────────────────────────────────────────────
    case '2': {
      const siteNames = sites.map((s) => s.siteName || '?');
      return {
        type: 'bar',
        height: 320,
        series: [
          { name: 'Electricity (kWh)', data: sites.map((s) => +((s.totalKWh || s.facilities?.filter(f => !f.isExcluded).reduce((a, f) => a + (f.totalKWh || 0), 0) || 0).toFixed(1))) },
          { name: 'CO₂ Emissions (kg)', data: sites.map((s) => +(s.totalCO2 || 0).toFixed(2)) }
        ],
        options: {
          ...BASE_OPTIONS,
          colors: ['#f4c22b', '#f44236'],
          xaxis: { categories: siteNames },
          plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
          yaxis: { title: { text: 'kWh / kgCO₂' } },
          tooltip: { y: { formatter: (v, { seriesIndex }) => seriesIndex === 0 ? `${(+v).toFixed(1)} kWh` : `${(+v).toFixed(2)} kgCO₂` } },
          title: { text: 'Electricity Consumption & Emissions by Site', align: 'left', style: { fontSize: '13px' } }
        }
      };
    }

    // ── 3.1  Transport diesel ─────────────────────────────────────────────────
    case '3.1': {
      const siteNames = sites.map((s) => s.siteName || '?');
      return {
        type: 'bar',
        height: 320,
        series: [
          { name: 'CO₂ (kg)', data: sites.map((s) => +(s.co2 || 0).toFixed(3)) },
          { name: 'N₂O (kg)', data: sites.map((s) => +(s.n2o || 0).toFixed(3)) },
          { name: 'CH₄ (kg)', data: sites.map((s) => +(s.ch4 || 0).toFixed(3)) }
        ],
        options: {
          ...BASE_OPTIONS,
          chart: { ...BASE_OPTIONS.chart, stacked: true },
          colors: ['#04a9f5', '#f4c22b', '#1de9b6'],
          xaxis: { categories: siteNames },
          plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
          yaxis: { title: { text: 'kg' } },
          tooltip: { y: { formatter: (v) => `${(+v).toFixed(3)} kg` } },
          title: { text: 'Transport Emissions by Gas & Site', align: 'left', style: { fontSize: '13px' } }
        }
      };
    }

    // ── 3.2, 3.3.1, 3.3.2, 3.5.1  Weight + tonne-km + CO₂e ─────────────────
    case '3.2':
    case '3.3.1':
    case '3.3.2':
    case '3.5.1': {
      const siteNames = sites.map((s) => s.siteName || '?');
      return {
        type: 'bar',
        height: 300,
        series: [
          { name: 'Tonne·km', data: sites.map((s) => +(s.totalTonneKm || 0).toFixed(2)) },
          { name: 'CO₂e (kg)', data: sites.map((s) => +(s.totalCO2e || 0).toFixed(3)) }
        ],
        options: {
          ...BASE_OPTIONS,
          colors: ['#13c2c2', '#f44236'],
          xaxis: { categories: siteNames },
          plotOptions: { bar: { horizontal: sites.length > 4, columnWidth: '50%', borderRadius: 3 } },
          tooltip: { y: { formatter: (v, { seriesIndex }) => seriesIndex === 0 ? `${(+v).toFixed(2)} t·km` : `${(+v).toFixed(3)} kgCO₂e` } },
          title: { text: 'Transport Activity & Emissions by Site', align: 'left', style: { fontSize: '13px' } }
        }
      };
    }

    // ── 3.2.3a, 3.2.3b  Weight (tonnes) + tonne-km ───────────────────────────
    case '3.2.3a':
    case '3.2.3b': {
      const siteNames = sites.map((s) => s.siteName || '?');
      return {
        type: 'bar',
        height: 300,
        series: [
          { name: 'Tonne·km', data: sites.map((s) => +(s.totalTonneKm || 0).toFixed(2)) },
          { name: 'CO₂e (kg)', data: sites.map((s) => +(s.totalCO2e || 0).toFixed(3)) }
        ],
        options: {
          ...BASE_OPTIONS,
          colors: ['#e91e63', '#7759de'],
          xaxis: { categories: siteNames },
          plotOptions: { bar: { horizontal: sites.length > 4, columnWidth: '50%', borderRadius: 3 } },
          tooltip: { y: { formatter: (v, { seriesIndex }) => seriesIndex === 0 ? `${(+v).toFixed(2)} t·km` : `${(+v).toFixed(3)} kgCO₂e` } },
          title: { text: 'Upstream Transport Activity & Emissions by Site', align: 'left', style: { fontSize: '13px' } }
        }
      };
    }

    // ── 3.4.1, 3.4.2, 3.5.2  CO2 + CH4 + N2O breakdown ─────────────────────
    case '3.4.1':
    case '3.4.2':
    case '3.5.2': {
      const siteNames = sites.map((s) => s.siteName || '?');
      return {
        type: 'bar',
        height: 320,
        series: [
          { name: 'CO₂ (kg)', data: sites.map((s) => +(s.co2 || 0).toFixed(3)) },
          { name: 'CH₄ CO₂e (kg)', data: sites.map((s) => +(s.ch4 || 0).toFixed(3)) },
          { name: 'N₂O CO₂e (kg)', data: sites.map((s) => +(s.n2o || 0).toFixed(3)) }
        ],
        options: {
          ...BASE_OPTIONS,
          chart: { ...BASE_OPTIONS.chart, stacked: true },
          colors: ['#04a9f5', '#1de9b6', '#f4c22b'],
          xaxis: { categories: siteNames },
          plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
          yaxis: { title: { text: 'kgCO₂e' } },
          title: { text: 'Emission Gas Breakdown by Site', align: 'left', style: { fontSize: '13px' } }
        }
      };
    }

    default:
      return null;
  }
}
