let data = [];
const width = 1000;
const height = 600;
let xScale, yScale;
let selectedCommits = [];
let brushSelection = null;

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    displayStats();
    console.log(commits);
    createScatterplot()
}  

let commits = d3.groups(data, (d) => d.commit);

function processCommits() {
    commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
    let first = lines[0];
    let { author, date, time, timezone, datetime } = first;
    let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
    };

    Object.defineProperty(ret, 'lines', {
        value: lines,
        // What other options do we need to set?
        // Hint: look up configurable, writable, and enumerable
        value: lines,
        enumerable: false, // Hidden from iteration
        writable: false,   // Read-only
        configurable: false // Cannot be deleted or redefined
    });

    return ret;
    });
}

function displayStats() {
    // Process commits first
    processCommits();
  
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
      );
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
    const fileLengths = d3.rollups(
    data,
    (v) => d3.max(v, (v) => v.line),
    (d) => d.file
    );
    const averageFileLength = d3.mean(fileLengths, (d) => d[1]);

    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">Line of Codes</abbr>');
    dl.append('dd').text(data.length);
  
    // Add total commits
    dl.append('dt').text('Total Commits');
    dl.append('dd').text(commits.length);
    
    // Add more stats as needed...
    dl.append('dt').html('Average File Length');
    dl.append('dd').text(averageFileLength);

    dl.append('dt').html('Max Depth');
    dl.append('dd').text(d3.max(data, d => d.depth));

    dl.append('dt').html('Most Work is Done in');
    dl.append('dd').text(maxPeriod);
  }

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('time');
    const author = document.getElementById('author');
    const lines = document.getElementById('lines-edited');

    if (Object.keys(commit).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
        dateStyle: 'full',
    });
    time.textContent = commit.time;
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
    // const tooltip = document.getElementById('commit-tooltip');
    // tooltip.hidden = !isVisible;
    const tooltip = document.getElementById('commit-tooltip');
    if (isVisible) {
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
    } else {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
    }
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }
  


function createScatterplot() {
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3
  .scaleSqrt() // Change only this line
  .domain([minLines, maxLines])
  .range([2, 30]);
    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const dots = svg.append('g').attr('class', 'dots');
        
    // Sort commits by total lines in descending order
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    // Use sortedCommits in your selection instead of commits
    dots.selectAll('circle').data(sortedCommits).join('circle')
        .data(commits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))
        .style('fill-opacity', 0.7) // Add transparency for overlapping dots
        .attr('fill', 'steelblue')
        .on('mouseenter', (event, commit) => {

            if (!commit || !commit.id) 
                return; // Ensure commit is valid

            d3.select(event.currentTarget)
                .classed('selected', true)
                .style('fill-opacity', 1); // Full opacity on hover
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on('mouseleave', function (event) {
            d3.select(event.currentTarget)
                .classed('selected', false)
                .style('fill-opacity', 0.7); // Restore transparency
            // updateTooltipContent({});
            updateTooltipVisibility(false);
        });

    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };
    
    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    // Add gridlines BEFORE the axes
    const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    // Add Y axis
    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);
}

function brushSelector() {
    const svg = document.querySelector('svg');
    d3.select(svg).call(d3.brush());
    // Raise dots and everything after overlay
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
  }


// function brushed(event) {
//     console.log(event);
//   }

function brushed(event) {
    brushSelection = event.selection;
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
}

function isCommitSelected(commit) {
    if (!brushSelection) {
        return false;
    }
    // TODO: return true if commit is within brushSelection
    // and false if not

    const [[x0, y0], [x1, y1]] = brushSelection;
    const commitX = xScale(commit.datetime);
    const commitY = yScale(commit.hourFrac);
    return commitX >= x0 && commitX <= x1 && commitY >= y0 && commitY <= y1;
}

function updateSelection() {
// Update visual state of dots based on selection
    d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  }

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected)
        : [];
    const container = document.getElementById('language-breakdown');

    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);

    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
        lines,
        (v) => v.length,
        (d) => d.type
    );

    // Update DOM with breakdown
    container.innerHTML = '';
    
    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format('.1~%')(proportion);

        container.innerHTML += `
                <dt>${language}</dt>
                <dd>${count} lines (${formatted})</dd>
            `;
    }
    return breakdown;
}  

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    processCommits();
    brushSelector();
  });

/* lab8 */
let timeScale = d3.scaleTime([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)], [0, 100]);
let commitMaxTime = timeScale.invert(commitProgress);

const timeSlider = document.getElementById('time-slider');
const selectedTime = document.getElementById('selected-time');

selectedTime.textContent = timeScale.invert(commitProgress).toLocaleString();

function formatTime(minutes) {
    const date = new Date(0, 0, 0, 0, minutes);
    return date.toLocaleString('en-US', { timeStyle: 'short' });
}
  
function updateTimeDisplay() {
    timeFilter = Number(timeSlider.value);

// if (timeFilter === -1) {
//     selectedTime.textContent = "11:59 PM";
// } else {
//     selectedTime.textContent = formatTime(timeFilter);
// }
    selectedTime.textContent = formatTime(timeFilter);
}

timeSlider.addEventListener('input', updateTimeDisplay);
updateTimeDisplay();