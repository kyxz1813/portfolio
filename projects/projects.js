import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

function countProjects(projects) {
    let count = `${projects.length} Projects`;
    document.querySelector('.projects-title').textContent = count;
}
countProjects(projects)

/* lab 05 */
let query = '';
let selectedYear = null; // Track selected year
let searchInput = document.querySelector('.searchBar');

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

  // Define colors
  let colors = ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"];

  // Determine fill color for entire pie chart
  let pieColor = selectedYear
    ? colors[newData.findIndex(d => d.label === selectedYear) % colors.length]
    : null; // Use specific slice color if filtered

  // Append new pie slices
  newSVG
    .selectAll('path')
    .data(newArcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (d, idx) => selectedYear ? pieColor : colors[idx % colors.length]) // ✅ If filtered, show only selected color
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
  newData.forEach((d, idx) => {
    newLegend.append('li')
      .attr('class', () => (d.label === selectedYear ? 'selected' : ''))
      .html(`<span class="swatch" style="background-color: ${colors[idx]};"></span> 
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

  if (selectedYear !== null) { // Then apply pie slice filter
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