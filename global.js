console.log('IT’S ALIVE!');
console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let navLinks = $$("nav a")

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );
//   if (currentLink) {
//     // or if (currentLink !== undefined)
//     currentLink?.classList.add('current');
// }



let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact'},
    { url: 'cv/', title: 'CV'},
    { url: 'https://github.com/kyxz1813', title: 'Profile'}
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    // TODO create link and add it to nav
    const ARE_WE_HOME = document.documentElement.classList.contains('home');
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    if (a.host === location.host && a.pathname === location.pathname) {
      a.classList.add('current');
    a.classList.toggle(
      'current',
      a.host === location.host && a.pathname === location.pathname
    );
    }
    nav.append(a);
  }


// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );
//   if (currentLink) {
//     // or if (currentLink !== undefined)
//     currentLink?.classList.add('current');
// }



document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <!-- TODO add <option> elements here -->
      matchMedia("(prefers-color-scheme: dark)").matches
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>`
);
if  ("colorScheme" in localStorage){
  document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
  localStorage.colorScheme = localStorage.colorScheme
}

let select = document.querySelector('.color-scheme')
select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  document.documentElement.style.setProperty('color-scheme', event.target.value);
  localStorage.colorScheme = event.target.value
});

// for (let [name, value] of data) {
//   // TODO build URL parameters here
//   console.log(name, value);
// }

// fetch your project data
export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);
      console.log(response)
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
    // console.log(response)
    const data = await response.json();
    return data; 
  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

// export function renderProjects(project, containerElement) {
//   // Your code will go here
//   containerElement.innerHTML = '';
//   for (let project of projects) {
//     const article = document.createElement('article');
//     article.innerHTML = `
//     <h3>${project.title}</h3>
//     <img src="${project.image}" alt="${project.title}">
//     <p>${project.description}</p>
//     `;
//     containerElement.appendChild(article);
//   }
// }
// replace the upper renderProjects function with the following
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  // write javascript that will allow dynamic heading levels based on previous function
  if (typeof containerElement === null) {
    throw new Error('Invalid container element');
  }

  let validHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!validHeadingLevels.includes(headingLevel)) {
    headingLevel = 'h2'
    throw new Error('Invalid heading level');
  }
  containerElement.innerHTML = '';
  for (let project of projects) {
    const article = document.createElement('article');
    article.innerHTML = `
    <${headingLevel}>${project.title}</${headingLevel}>
    <img src="${project.image}" alt="${project.title}">
    <p>${project.description}</p>
    <div>Year: ${project.year}</div>
    `;
    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  // return statement here
  console.log('fetched username')
  return fetchJSON(`https://api.github.com/users/${username}`);
}


