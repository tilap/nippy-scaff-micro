import fs from 'fs';
import path from 'path';
import { paths as pathsConfig } from '../../app/config/parameters';

let services = {};

const eventsPath = path.resolve(__dirname, '../../app', pathsConfig.events);
const folders = fs.readdirSync(eventsPath).filter((file) => fs.statSync(path.join(eventsPath, file)).isDirectory());

folders.forEach((folder) => {
  services[folder] = {};

  const absFolder = path.join(eventsPath, folder);
  const files = fs.readdirSync(absFolder).filter((file) => fs.statSync(path.join(absFolder, file)).isFile());
  files.forEach((file) => {
    const eventName = file.replace(/^(.*)\.js$/, '$1');
    if (!services[folder][eventName]) services[folder][eventName] = [];
    services[folder][eventName].push(require(path.join(absFolder, file)));
  });
});

module.exports = (name) => services[name] ? services[name] : [];
