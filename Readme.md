# Transcendence

This is a website where you can play pong. It uses VueJs for the frontend and NestJS for the backend. This is the final project for 42 school's common core ([42Lisboa](https://42lisboa.com/en/)).

## contributing

1) Fork this project

2) Create a branch for the feature you will be working on
``` bash
git checkout -b [branch name]
```
This command will  create and switch to the new branch. If you just want to switch branches remove the `-b` option.

3) Implement the feature, try to only implement one feature per branch if possible.

4) Before creating a  PR (pull request), merge the main branch into your own. Not everybody knows how to solve your merge conflicts, so its better if you resolve them before creating a PR.
``` bash
git fetch [origin]
git merge [origin]/master
```
Where origin is the main repository (So the one your forked from).

5) Now create your PR. It's good to start with a list of changes you made and if necessary justify your changes. You should also link any related issues.

6) If your PR is accepted it will get squashed (all your commits combined into one) and merged with the master branch.

All of the frontend and backend files should be located in folders called frontend and backend respectively. It's recommended to put all your code in a subfolder so we can easily copy it (or rather use a volume) with docker.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
