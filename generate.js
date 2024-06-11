const fs = require('fs');
const { exec } = require('child_process');

const args = [
  'npx',
  'proto-loader-gen-types',
  '--grpcLib=@grpc/grpc-js',
  '-O src/common/grpc',
  '--objects',
];

const run = (root) => {
  fs.readdirSync(root)
  .forEach((file) => {
    const filename = `${root}/${file}`;
    if(fs.statSync(filename).isDirectory()) run(filename);
    else exec(`${args.join(' ')} protos/${file}`);
  })
}

run('protos');