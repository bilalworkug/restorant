const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'views', 'index.ejs');
let html = fs.readFileSync(file, 'utf8');

// Replace special dish section
html = html.replace(/<h2 class="headline-1 section-title">Goat Muchomo<\/h2>[\s\S]*?<p class="section-text">[\s\S]*?<\/p>/, `<h2 class="headline-1 section-title"><%= data.special.title %></h2>\n            <p class="section-text"><%= data.special.description %></p>`);
html = html.replace(/<del class="del body-3">UGX 40,000<\/del>/, `<del class="del body-3"><%= data.special.oldPrice %></del>`);
html = html.replace(/<span class="span body-1">UGX 20,000<\/span>/, `<span class="span body-1"><%= data.special.newPrice %></span>`);

// Replace the entire ul.grid-list for the menu. Note: this matches the FIRST ul.grid-list which might be the services (Breakfast, Appetizers, Drinks). 
// Let's be safe and match the one under <section class="section menu"
const menuSectionRegex = /(<section class="section menu"[^>]*>[\s\S]*?<ul class="grid-list">)[\s\S]*?(<\/ul>)/;
const dynamicMenu = `$1
  <% data.menu.forEach(function(item, index) { %>
    <li>
      <div class="menu-card hover:card">
        <figure class="card-banner img-holder" style="--width: 100; --height: 100;">
          <img src="./assets/images/menu-<%= (index % 6) + 1 %>.png" width="100" height="100" loading="lazy" alt="<%= item.name %>" class="img-cover">
        </figure>
        <div>
          <div class="title-wrapper">
            <h3 class="title-3">
              <a href="#" class="card-title"><%= item.name %></a>
            </h3>
            <% if (item.badge) { %>
              <span class="badge label-1"><%= item.badge %></span>
            <% } %>
            <span class="span title-2"><%= item.price %></span>
          </div>
          <p class="card-text label-1"><%= item.desc %></p>
        </div>
      </div>
    </li>
  <% }); %>
$2`;
html = html.replace(menuSectionRegex, dynamicMenu);

fs.writeFileSync(file, html);
console.log("Replaced index.ejs with EJS tags");
