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

- **I want** to improve and enhance my original classic Snake game
- **I want** a clean, modern-looking user interface with a player dashboard
- **I want** to add randomized walls **so that** each game is different and challenging
- **I want** to add power-ups that appear randomly after eating food and disappear after 10 seconds
    - **So that** these power-ups add risk to the game when eating them because they may help or hurt players
      - *Sneaky Snake* slows down the snake to help players survive longer and move through tight walls
      - *ScoreX2* doubles the score each time a player eats food
      - *More Walls* makes the playfield more dangerous by adding new walls
- **I want** to save player names, settings, and high scores
  - **So that** the game tracks player high scores on a leaderboard and remembers them between games
- **I want** to be able to play the game on mobile devices without a keyboard

## Narrative
*What the app does*<br>
UNcaffeinated - Solid Snake is an enhanced version of the classic Snake game. I tried to update it with a clean, modern look and a dashboard that tracks player scores and power-ups in real-time. It supports different color themes and a leaderboard that ranks the game's top Snake Wranglers.

*Why I chose it*<br>
The classic snake game is very simple and gets boring quickly, so I wanted to make it more fun and challenging.

*What I improved or built*<br>
Many classic arcade games allow players to memorize each level and power-up locations, so I wanted to make it harder by adding random walls and an element of danger. Players must quickly make a choice to eat power-ups since they disappear in 10 seconds. They might help them get a better score or make it through tight walls that would be impossible at normal speeds.

I think that my new user interface is much better looking than the first project. I like the Google 16-bit font, but it was hard to read, so I also decided to use the Google Inter font this time.

*Development story*<br>
I ran into several problems while working on this project. I wanted to add icons or images for the snake head, body, tail, food, and walls, but I could not get the PNG icons to draw correctly, even with help from Google. I had to look for ideas and found a way with Google AI help to draw everything with simple lines, rectangles, and circles. It's not what I wanted, but it looks much better than my original game.

I had to research event timers to learn how to make the power-ups only last for 10 seconds. I was able to get the dashboard to show the current power-up, but it took me a while to figure out how to clear it after the power-up wore off.

Making the game work on my cell phone and tablet was hard. I added arrow icons to the original game, but they were hard to use. I wanted to just touch the screen to change the snake's direction, but I couldn't get it to work the way I wanted. I had to look for more examples and ask Google AI for help to fix the problems. My dashboard is too large for mobile devices, and I had to press the Start Game button and scroll up quickly to play. I didn't have enough time to fix it before the assignment was due, so I moved the Start Game button up to the top to make it work.

## Attribution
### Tutorials
- [MDN Drawing graphics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Drawing_graphics)
- [Basic Snake HTML and JavaScript Game](https://gist.github.com/straker/ff00b4b49669ad3dec890306d348adc4)
- [Using Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events)
- [HTML Web Storage API] (https://www.w3schools.com/html/html5_webstorage.asp)

### Resources
- [W3Schools](https://www.w3schools.com/)
  - [HTML](https://www.w3schools.com/html/default.asp)
  - [CSS](https://www.w3schools.com/css/default.asp)
  - [JavaScript](https://www.w3schools.com/js/default.asp)
  - [JavaScript Forms](https://www.w3schools.com/js/js_validation.asp)
  - [JavaScript Local Storage](https://www.w3schools.com/jsref/prop_win_localstorage.asp)
- [MDN Web Docs](https://developer.mozilla.org/)
  - [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)
  - [JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
  - [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
  - [Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
  - [overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior)
  - [aria-live](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [Advanced CSS & Libraries](https://www.w3.org/TR/selectors-4/)
  - [:nth-child(odd)](https://www.w3.org/TR/selectors-4/#the-nth-child-pseudo) selects odd-numbered list items.
  - [[target="_blank"]](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors)
  - [Normalize.css](https://necolas.github.io/normalize.css/)
  - [@import](https://developer.mozilla.org/en-US/docs/Web/CSS/@import)
- [Bootstrap 5.3](https://getbootstrap.com/)
  - Used Bootstrap for the responsive navbar, cards, modal leaderboard, buttons, table, and layout grid
  - [Bootstrap Navbar](https://getbootstrap.com/docs/5.3/components/navbar/)
  - [Bootstrap Icons](https://icons.getbootstrap.com/)
- [WebAIM](https://webaim.org/)
- [Nu HTML Checker](https://validator.w3.org/nu/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)
- [Google Fonts](https://fonts.google.com/)
  - [Inter](https://fonts.google.com/specimen/Inter) is the font that I use for my new user interface.

### AI Usage
I used Google Gemini AI to give me ideas and help with these problems:
- Draw the snake, food, and walls with lines, rectangles, and circles when I couldn't get my icons to draw and turn the way I wanted
- Find problems reported by Nu HTML and WAVE Web Accessibility and recommend fixes
- Fix problems with mobile device touch events and give examples of how to make the snake turn when the screen is touched
- Find and fix inline script problems

## Inspirations
- Classic Snake arcade games
  - [Classic Retro Snake Game (HTML, CSS, JS)](https://codeshack.io/classic-retro-snake-game-html-css-js/)
- Professor Barry Cumbie, Computer Information Systems, University of North Alabama
  - Used class concepts about semantic HTML, validation, accessibility, and responsive web design
- [Solid Snake from Metal Gear Solid](https://en.wikipedia.org/wiki/Solid_Snake)
  - This was my best name idea for a polished snake game with power-ups
  - The Game Over text "Snake? SNAKEEEEEEE!!" is a quote from the original game when Solid Snake dies
- Color Themes
    - I used the official UNA purple and gold hex colors for the new UNA Pride theme
    - I used my coffee-themed brand colors from another class project to create the UNcaffeinated theme
    - The Garfield easter egg theme is now a standard theme that is hard to look at for very long 

## Future Improvements
I’m using GitHub to track the Issues and Milestones for the Solid Snake game.
- **[Issues](https://github.com/AJuna345/snake-app/issues)**
- **[Milestones](https://github.com/AJuna345/snake-app/milestones?state=closed)**
  - Create new, modern-looking Dashboard and User Interface
      - Closed Issues
          - The Game Over screen is not displayed
      - Open Issues
          - Buttons and text are hard to see or read on some themes
          - The Dashboard is too large to see on some mobile devices
  - Add randomized walls
      - Open Issues
          - Walls are too close to the player start position
          - Food is placed in locations that are impossible for the snake to reach
  - Add power-ups to the game
      - Closed Issues
          - Remove power-ups after 10 seconds
      - Open Issues
          - Power-ups are placed in locations that are impossible for the snake to reach
  - Improve gameplay on mobile devices
      - Closed Issues
          - Add touch screen support for mobile devices
          - Start Game/New Game buttons cannot be clicked

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

## Code block + explanation (“game.js”)
- What is does
  - The generateRandomWalls() function builds random walls on the playfield instead of the empty box in my first game.
- Why it matters
  - The game is too easy and repetitive with an empty playfield
- How it works
  - I try to avoid building walls the player spawn position in the bottom-center of the playfield they don't immediately crash into a wall
  - It create random horizontal and vertical walls inside the playfield with different lengths
  - It changes the playfield grid from EMPTY to WALL when building walls

```javascript
function generateRandomWalls(numWalls) {
    var spawnX = Math.floor(WIDTH / 2); // Players spawn in the bottom-center of the playfield
    var spawnY = HEIGHT - 1;

    for (var i = 0; i < numWalls; i++) {
        var length = Math.floor(Math.random() * 4) + 2; 
        var isHorizontal = Math.random() < 0.5; 
        var startX = Math.floor(Math.random() * WIDTH);
        var startY = Math.floor(Math.random() * HEIGHT);

        if (isHorizontal && startX + length > WIDTH) startX = WIDTH - length;
        if (!isHorizontal && startY + length > HEIGHT) startY = HEIGHT - length;

        for (var j = 0; j < length; j++) {
            var wx = isHorizontal ? startX + j : startX;
            var wy = isHorizontal ? startY : startY + j;
            if (grid.get(wx, wy) === EMPTY) {
                if (Math.abs(wx - spawnX) < 4 && Math.abs(wy - spawnY) < 4) continue; 
                grid.set(WALL, wx, wy);
            }
        }
    }
}
```
