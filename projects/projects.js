import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

function countProjects(projects) {
    let count = `${projects.length} Projects`;
    document.querySelector('.projects-title').textContent = count;
}
countProjects(projects)

