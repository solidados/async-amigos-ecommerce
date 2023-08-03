<h1 align="center">
E-Commerce Application
</h1>
<p align="center">
<br>
  <a href="https://revealjs.com">
  <img src="./public/logo.png" alt="reveal.js" width="250">
  </a>
  <br>
</p>
<h3 align="center">
Computer Parts
</h3>

## Overview
The Computer E-Commerce Application is a user-friendly and feature-rich online platform designed to cater to computer 
enthusiasts, gamers, and professionals looking to purchase high-quality computer hardware. With an intuitive user 
interface and a vast range of products, our application aims to provide a seamless shopping experience for customers 
seeking the latest and most reliable computer components.  

## Webpack Config
- [Babel](https://babel.dev/docs/en/next/babel-core) / [TypeScript](https://www.typescriptlang.org/)  
- [PostCSS](https://postcss.org/) ([autoprefixer](https://github.com/postcss/autoprefixer), [postcss-preset-env](https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env), [postcss-normalize](https://github.com/csstools/postcss-normalize))  
- [Webpack](https://github.com/webpack/webpack) ([ESLintPlugin](https://github.com/webpack-contrib/eslint-webpack-plugin), [StyleLintPlugin](https://github.com/webpack-contrib/stylelint-webpack-plugin), [HTMLWebpackPlugin](https://github.com/jantimon/html-webpack-plugin), [MiniCssExtractPlugin](https://github.com/webpack-contrib/mini-css-extract-plugin), [TerserPlugin](https://terser.org))  
- [ESLint](https://eslint.org) ([airbnb-base](https://github.com/airbnb/javascript)/[airbnb-typescript/base](https://github.com/iamturns/eslint-config-airbnb-typescript), [prettier](https://github.com/prettier/eslint-config-prettier)) <sub><sup>using [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier) <b>is [not recommended](https://prettier.io/docs/en/integrating-with-linters.html#notes)</b> due to downsides</sup></sub>  
- [StyleLint](https://stylelint.io) ([standard-scss](https://github.com/stylelint-scss/stylelint-config-standard-scss), [rational-order](https://github.com/constverum/stylelint-config-rational-order)) <sub><sup> no longer need to extend Prettier's Stylelint config as there shouldn't be any conflicting rules soon</sup></sub>  
- [Prettier](https://prettier.io)  
- [Sass](https://github.com/sass/dart-sass)  
- [Gh-Pages](https://github.com/tschaub/gh-pages)

## Available Scripts
```start```: Starts the development server using webpack and serves the application in development mode.\
```build```: Bundles the application using webpack in production mode for deployment.\
```lint```: Runs ESLint to check for linting errors in the project's files.\
```format```: Formats the project's TypeScript files using Prettier to ensure consistent code style.\
```clear-dist```: Removes the dist directory and its content.\
```jest-test```: Runs Jest to execute unit tests defined in the project.\
```jest-generate-report```: Runs Jest with coverage enabled to generate a test coverage report in the Coverage folder.\
```prepare```: Installs Git hooks using Husky to facilitate pre-commit and pre-push actions.\
**Make sure to run ```prepare``` script after the first npm install!**


