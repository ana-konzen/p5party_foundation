# p5.party Foundation

A project template for more complex p5.js games.

This template allows you to organize your project as scenes, each defined in its own module. main.js calls preload and setup on all scenes and then delegates the draw and mousePressed events to the current scene. main.js also calls the scenes for "enter" and "exit" lifecycle events. Scenes can change the current scene by calling `changeScene(sceneName)`.

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
