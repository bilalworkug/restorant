const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'views', 'index.ejs');
let html = fs.readFileSync(file, 'utf8');

// The event section starts with:
// <section class="section event bg-black-10" aria-label="event">
// And contains a <ul class="grid-list">
// We need to replace that UL specifically.
// We can find the section and replace its content.

const eventSectionRegex = /(<section class="section event bg-black-10" aria-label="event">[\s\S]*?<h2 class="section-title headline-1 text-center">Upcoming Event<\/h2>\s*)<ul class="grid-list">[\s\S]*?<\/ul>/;

const dynamicEvents = `$1<ul class="grid-list">
  <% data.events.forEach(function(event) { %>
    <li>
      <div class="event-card has-before hover:shine">
        <div class="card-banner img-holder" style="--width: 350; --height: 450;">
          <img src="<%= event.image %>" width="350" height="450" loading="lazy" alt="<%= event.title %>" class="img-cover">
          <time class="publish-date label-2" datetime="<%= event.date %>"><%= event.date %></time>
        </div>
        <div class="card-content">
          <p class="card-subtitle label-2 text-center"><%= event.subtitle %></p>
          <h3 class="card-title title-2 text-center"><%= event.title %></h3>
        </div>
      </div>
    </li>
  <% }); %>
</ul>`;

html = html.replace(eventSectionRegex, dynamicEvents);

fs.writeFileSync(file, html);
console.log("Events section made dynamic!");
