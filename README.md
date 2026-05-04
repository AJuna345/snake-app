# UNCAFFEINATED - Solid Snake Game

## App Title
**UNCAFFEINATED - Solid Snake**
<br><br>
My update to the classic Snake game has a clean new user interface, themes, power-ups, and randomized playfields with walls. I also upgraded it to be usable on mobile devices.

## One-liner Quote/Tagline
> “Solid Snake must eat to survive!”

## Authorship
Game and user interface enhancements by **Aiden (A.J.) Ramsden**
<br>
[GitHub Profile](https://github.com/AJuna345)
- **[Repo](https://github.com/AJuna345/snake-app)**
- **[Deployed App](https://ajuna345.github.io/snake-app/)**

## User Story
**User Story**

I want to create a classic Snake game with a retro style that will run in a browser.
I want to save player names and settings.
I want to track player high scores on a leaderboard and remember them between games.

## Narrative

## Attribution

## Resources
- [W3Schools](https://www.w3schools.com/)
  - [HTML](https://www.w3schools.com/html/default.asp)
  - [CSS](https://www.w3schools.com/css/default.asp)
  - [JavaScript](https://www.w3schools.com/js/default.asp)
  - [JavaScript Forms](https://www.w3schools.com/js/js_validation.asp)
  - [JavaScript Local Storage](https://www.w3schools.com/jsref/prop_win_localstorage.asp)
- [MDN Web Docs](https://developer.mozilla.org/)
  - [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)
  - [aria-live](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [Advanced CSS Selectors](https://www.w3.org/TR/selectors-4/)
  - [:nth-child(odd)](https://www.w3.org/TR/selectors-4/#the-nth-child-pseudo) selects odd-numbered list items.
  - [[target="_blank"]](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors) selects links that open in a new tab.
- [Bootstrap 5.3](https://getbootstrap.com/)
  - [Bootstrap Navbar](https://getbootstrap.com/docs/5.3/components/navbar/) is used for the top navigation bar in my Snake Game project.
- [WebAIM](https://webaim.org/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)
- [Nu HTML Checker](https://validator.w3.org/nu/)
- [Google Fonts](https://fonts.google.com/)

## Inspirations
- Classic Snake arcade games
  - [Classic Retro Snake Game (HTML, CSS, JS)](https://codeshack.io/classic-retro-snake-game-html-css-js/)
- Professor Barry Cumbie, Computer Information Systems, University of North Alabama
  - Used class concepts about semantic HTML, validation, accessibility, and responsive web design
- [Solid Snake from Metal Gear Solid](https://en.wikipedia.org/wiki/Solid_Snake)
  - This was my best name idea for a polished snake game with power-ups

## Libraries & Frameworks
- [Bootstrap 5.3.0](https://getbootstrap.com/)
  - Used Bootstrap for the responsive navbar, cards, modal leaderboard, buttons, table, and layout grid

## Assets
- Google Fonts
  - [DotGothic16](https://fonts.google.com/specimen/DotGothic16)
  - [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)
- LocalStorage data for:
  - Game Difficulty
  - Themes (Classic White, Dark Mode, Neon, and Garfield theme)
  - Leaderboard Scores
- SessionStorage for:
  - Player Name

## Model / Inspiration
- **Classic Snake arcade gameplay**
  - This project was inspired by simple retro browser and arcade Snake games
  - I used a clean one-page layout with a separate How to Play page, a settings form, and a modal leaderboard to make the game more polished and user-friendly

## Wireframes
Wireframe images for Snake Game

![Home/Start](images/Wireframe-1.jpg)
![Gameboard](images/Wireframe-2.jpg)
![How to Play](images/Wireframe-3.jpg)
![Leaderboard](images/Wireframe%20-4.jpg)
![Game Over](images/Wireframe-5.jpg)

## Project Features
- Playable Snake game with Bootstrap navbar
- Player Name and Settings
  - Player name validation
  - Theme selector
  - Difficulty selector
- How to Play page
- Keyboard controls (up, down, left, right)
- LocalStorage used to store player settings and leaderboard data
- Modal leaderboard with a button to clear all scores
- Accessible status announcements with `aria-live`
- Garfield Easter egg theme

## Validation
   <a href="https://validator.w3.org/nu/?doc=https://ajuna345.github.io/snake-app/" target="_blank" class="btn btn-outline-secondary btn-sm">
     Nu Validator
   </a>
   <br>
   <a href="https://wave.webaim.org/report#/https://ajuna345.github.io/snake-app/" target="_blank" class="btn btn-outline-secondary btn-sm">
     WAVE Checker
   </a>

## Project Structure
```text
 .
 ├── index.html
 ├── pages
 │   └── how-play.html
 ├── scripts
 │   ├── game.js
 │   ├── leaderboard.js
 │   └── storage.js
 └── styles
     └── game.css

3 directories, 6 files
```
  
## Code block + explanation (“game.js” Garfield Easter Egg)
This code adds the Garfield Easter Egg theme when the player enters the name Garfield. It works with the DOM by finding the theme dropdown menu in the page, checking whether a Garfield option is already inside that menu, and creating a new `<option>` element if it is missing. Then the JavaScript code adds that new option into the dropdown, changes the selected value, updates the `<body>` class so the page uses the Garfield theme colors, saves that choice in local storage, and redraws everything so the game theme updates immediately. This is a good example of JavaScript changing existing page elements, adding new DOM content, and saving a user setting.

```javascript
function unlockGarfieldTheme() {
    const themeSelect = document.getElementById('themeSelect');
    let garfieldOption = themeSelect.querySelector('option[value="garfield"]');
    if (!garfieldOption) {
        garfieldOption = document.createElement('option');
        garfieldOption.value = 'garfield';
        garfieldOption.textContent = 'Garfield (Monday Mode)';
        themeSelect.appendChild(garfieldOption);
    }
    themeSelect.value = 'garfield';
    document.body.className = 'theme-garfield';
    saveTheme('garfield');
    setTimeout(() => {
        updateThemeColors();
        if (canvas && ctx) draw();
    }, 50);
}
