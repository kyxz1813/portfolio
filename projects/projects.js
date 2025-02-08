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

/* Search */
// let query = '';
// let searchInput = document.querySelector('.searchBar');
// searchInput.addEventListener('change', (event) => {
//   // update query value
//   query = event.target.value;
//   // filter projects
//   let filteredProjects = projects.filter((project) => {
//     let values = Object.values(project).join('\n').toLowerCase();
//     return values.includes(query.toLowerCase());
//   });
//   // render filtered projects
//   renderProjects(filteredProjects, projectsContainer, 'h2');
// });

/* Pie Chart */
// let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// let rolledData = d3.rollups(
//   projects,
//   (v) => v.length,
//   (d) => d.year,
// );

// let data = rolledData.map(([year, count]) => {
//   return { value: count, label: year };
// });
// let total = 0;

// for (let d of data) {
//   total += d;
// }

// let angle = 0;
// let sliceGenerator = d3.pie().value((d) => d.value);
// let arcData = sliceGenerator(data);

// for (let d of data) {
//   let endAngle = angle + (d / total) * 2 * Math.PI;
//   arcData.push({ startAngle: angle, endAngle });
//   angle = endAngle;
// }

// let arcs = arcData.map((d) => arcGenerator(d));

// let colors = ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"];

// arcs.forEach((arc, idx) => {
//     // TODO, fill in step for appending path to svg using D3
//     d3.select('svg')
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', colors[idx % colors.length])
//   })

// let legend = d3.select('.legend');
// data.forEach((d, idx) => {
//     legend.append('li')
//           .attr('style', `--color:${colors[idx]}`) // set the style attribute while passing in parameters
//           .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
// })

let query = '';
let selectedIndex = -1;
let selectedYear = null;
let searchInput = document.querySelector('.searchBar');

function renderPieChart(projectsGiven) {
  // re-calculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  // re-calculate data
  let newData = newRolledData.map(([year, count]) => {
    return {value: count, label: year}; // TODO
  });
  
  // re-calculate slice generator, arc data, arc, etc.
  let newSliceGenerator = d3.pie().value((d) => d.value);;
  let newArcData = newSliceGenerator(newData);
  let newArcs = d3.arc().innerRadius(0).outerRadius(50);

  // TODO: clear up paths and legends
  let newSVG = d3.select('svg');
  newSVG.selectAll('path').remove();
  let newLegend = d3.select('.legend');
  newLegend.selectAll('*').remove();
  
  // update paths and legends, refer to steps 1.4 and 2.2
  let colors = ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"];

  newSVG
    .selectAll('path')
    .data(newArcData)
    .enter()
    .append('path')
    .attr('class', (d, idx) => (
      // TODO: filter idx to find correct pie slice and apply CSS from above
      idx === selectedIndex ? 'selected' : ''
    ))
    .attr('d', newArcs)
    .attr('fill', (d, idx) => colors[idx % colors.length])
    .on('click', function(event, d) { // Passed 'd' correctly
      if (selectedYear === d.data.label) {
        selectedYear = null; // Deselect
        selectedIndex = -1;
      } else {
        selectedYear = d.data.label; // Select year
        selectedIndex = newData.findIndex(item => item.label === selectedYear);
      }
      updateFilteredProjects(); // Call function to re-filter and re-render
    });


  let newlegend = d3.select('.legend');
  newData.forEach((d, idx) => {
    newlegend.append('li')
            .attr('class', (_, idx) => (
      // TODO: filter idx to find correct legend and apply CSS from above
              idx === selectedIndex ? 'selected' : '' 
            ))
            .attr('style', `--color:${colors[idx]}`) // set the style attribute while passing in parameters
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
  })

}

// Call this function on page load
// renderPieChart(projects);

// searchInput.addEventListener('change', (event) => {
//   query = event.target.value;
//   let filteredProjects = projects.filter((project) => {
//     let values = Object.values(project).join('\n').toLowerCase();
//     return values.includes(query.toLowerCase());
//   });
//   // re-render legends and pie chart when event triggers
//   renderProjects(filteredProjects, projectsContainer, 'h2');
//   renderPieChart(filteredProjects);
// });

function updateFilteredProjects() {
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
  });

  // If a pie slice (year) is selected, filter projects further
  if (selectedIndex !== null) {
    // filteredProjects = filteredProjects.filter((project) => project.year === selectedYear);
    let filteredProjects = projects;

    // Apply search filter first
    if (query) {
      filteredProjects = filteredProjects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
      });
    }

    // Apply pie filter next, without breaking search
    if (selectedYear !== null) {
      filteredProjects = filteredProjects.filter((project) => project.year === selectedYear);
    }
  }

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
}

// Event listener for search input filtering
searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();
  updateFilteredProjects(); // Update filtering logic dynamically
});

// Render the pie chart on page load
renderPieChart(projects);