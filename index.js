#!/usr/bin/env node --no-warnings

const program = require('commander');
const package = require('./package.json');
const fs = require('fs');
const shell = require('shelljs');
const chalk = require('chalk');

program.version(package.version);

program
  .command('init')
  .description('Git fetch; Git checkout para master; Git pull; yarn install; Add pre-commit from husky in package.json')
  .action(async () => {
    const formatPath = (path) => {
      let formatedPath = path.replace('/c/', 'C:/')
      formatedPath = formatedPath.replace('\n', '')
      formatedPath += '/package.json'
      return formatedPath
    }

    try {
      console.log('git fetch');
      await shell.exec('git fetch', { silent: true });
      console.log('git checkout master');
      await shell.exec('git checkout master', { silent: true });
      console.log('git pull');
      await shell.exec('git pull', { silent: true });
      console.log(`${chalk.green('git commands success')}`);
    } catch (error) {
      console.log(chalk.red(`Git Error: ${error}`));
    }

    try {
      console.log('yarn install');
      await shell.exec('yarn install', { silent: true });
      console.log(`${chalk.green('yarn commands success')}`);
    } catch (error) {
      console.log(chalk.red(`Yarn Error: ${error}`));
    }

    const path = shell.exec('pwd', { silent: true }).toString();
    const formatedPath = formatPath(path)
    let data = fs.existsSync(formatedPath) ? JSON.parse(fs.readFileSync(formatedPath)) : undefined;

    if (!data) {
      console.log(chalk.red('Arquivo package.json não encontrado!')); 
    } else {
      data = {
        ...data,
        husky: {
          hooks: {
            "pre-commit": "yarn lint && yarn typecheck && yarn test"
          }
        }  
      }

      try {
        console.log('adding pre-commit from husky');
        fs.writeFileSync(formatedPath, JSON.stringify(data, null, '\t'));
        console.log(`${chalk.green('Arquivo package.json modificado com sucesso!')}`);
      } catch (error) {
        console.log(chalk.red(`Error: ${error}`));
      }
    }
  })

program.parse(process.argv)