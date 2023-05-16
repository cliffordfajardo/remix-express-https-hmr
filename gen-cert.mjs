#!/usr/bin/env zx
import 'zx/globals';
import { existsSync } from 'fs'

console.log(`\nRunning 'gen-cert.mjs'`);
const Shell = $;

async function main() {
  // Generating self-signed cert: https://flaviocopes.com/express-https-self-signed-certificate/
  if(existsSync('./server.key') === false || existsSync('./server.cert') === false) {
    await Shell`openssl req -nodes -new -x509 -keyout server.key -out server.cert`;
    console.log(chalk.green`✅ Generated 'server.cert & server.key file`);
  }
}

await main().catch(error => {
  console.log(`Error`, error)
})
