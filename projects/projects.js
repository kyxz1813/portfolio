import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { fetchJSON, renderProjects } from '../global.js';

// ⭐ NEW — load original data
const rawProjects = await fetchJSON('../lib/projects.json');

// ⭐ CHANGED — adjust both image and url for this /projects/ page
const projects = rawProjects.map(p => ({
  ...p,
  image: p.image && !p.image.startsWith('http')
    ? '../' + p.image          // from /projects → ../images/...
    : p.image,
  url: p.url && !p.url.startsWith('http')
    ? '../' + p.url            // from /projects → ../projects/...
    : p.url
}));

// ⭐ CHANGED — now use the adjusted list
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
// ⭐ END OF FIX

function countProjects(projects) {
    let count = `${projects.length} Projects`;
    document.querySelector('.projects-title').textContent = count;
}
countProjects(projects)

let query = '';
let selectedYear = null;
let searchInput = document.querySelector('.searchBar');

// Store original colors for each year
const colors = {
  "2021": "#8dd3c7",
  "2022": "#ffffb3",
  "2023": "#bebada",
  "2024": "#fb8072",
  "2025": "#80b1d3",
  "2026": "#fdb462",
  "2027": "#b3de69",
  "2028": "#fccde5",
  "2029": "#d9d9d9",
};

function renderPieChart(projectsGiven) {
  // Recalculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  // Recalculate data
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  // Create pie layout and arc generator
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  // Clear previous pie chart and legend
  let newSVG = d3.select('svg');
  newSVG.selectAll('*').remove();
  
  let newLegend = d3.select('.legend');
  newLegend.selectAll('*').remove();

  // Determine correct color for the pie chart
  let selectedColor = selectedYear ? colors[selectedYear] : null;

  // Append new pie slices
  newSVG
    .selectAll('path')
    .data(newArcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (d) => selectedYear ? selectedColor : colors[d.data.label]) 
    .on('click', function(event, d) {
      // Toggle selection state
      if (selectedYear === d.data.label) {
        selectedYear = null; // Deselect and show all
      } else {
        selectedYear = d.data.label; // Select year
      }

      updateFilteredProjects(); // Call function to re-filter and re-render
    });

  // Append new legends
  newData.forEach((d) => {
    newLegend.append('li')
      .attr('class', () => (d.label === selectedYear ? 'selected' : ''))
      .html(`<span class="swatch" style="background-color: ${colors[d.label]};"></span> 
             ${d.label} <em>(${d.value})</em>`);
  });
}

// Function to update filtered projects based on search and pie slice selection
function updateFilteredProjects() {
  let filteredProjects = projects;

  if (query) { // Apply search filter first
    filteredProjects = filteredProjects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query);
    });
  }

  if (selectedYear !== null) { // Apply pie slice filter
    filteredProjects = filteredProjects.filter((project) => project.year === selectedYear);
  }

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects); // Ensures pie chart updates
}

// Event listener for search input filtering
searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();
  updateFilteredProjects();
});

// Render the pie chart on page load
renderPieChart(projects);