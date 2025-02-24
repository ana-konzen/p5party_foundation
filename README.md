# p5.party Foundation

A project template for more complex games made with p5.js + p5.party (or just p5.js).

## The Scene System

This template organizes the game in scenes (e.g. title scene, gameplay scene, game over scene), each defined in its own module. The `main.js` file coordinates the scenes, loads them when the program starts, calling lifecycle functions, and delegating events to the current scene. See the [scene.template.js](src/js/scene.template.js) file for an overview of the scene functions.

## JS Modules

This template uses [ES6 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) to organize the code. Modules isolate parts of the code, making it easier to manage as it grows. p5.js looks for functions like setup() and draw() in the global scope, so `main.js` exports these functions by adding them as properties on the window object.

## VS Code Extensions

**[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)**
Used for serving the project locally. Configured in `.vscode/settings.json`

**[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)**
Warns about style issues in the code.

**[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)**
Formats code.

**[Todo+](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-todo-plus)**
Simple todo manager used by `notes/todo.todo`.

## Tool Configuration

**[ESLint](https://eslint.org/)**
Used for linting the code for style.
Configured in `.eslintrc.js`

**[Prettier](https://prettier.io/)**
Used for formatting the code.
Configured in `.prettierrc.js`

**[npm](https://www.npmjs.com/)**
Used for managing the project's dependencies.
Configured in `package.json`

**[git](https://git-scm.com/)**
Used for version control.
Configured in `.gitignore`

**[devbox](https://www.jetify.com/devbox)**
Used for managing the project's development environment.
**You probably don't want or need devbox. I use it to manage my development environment independently for each project, which you probably don't need to do.**

**[nodejs](https://nodejs.org/en/)**
Though this project doesn't run in Node, it uses npm for managing dependencies so you'll need node installed for some things to work.

## Setup

- Install [Node.js](https://nodejs.org/en/).
- Run `npm install` to install the project's dependencies.
- Install ESLint and Prettier extensions in VSCode.
- Install Liver Server extension in VSCode.
- Launch with Live Server

## Tips

- Keep your developer console open while you work!
- Check "Disable Cache" in the Network Dev Tool.
- main.js forwards only the draw and mousePressed events, you'll need to add other events that you use
