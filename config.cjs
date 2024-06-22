const fs = require('fs');
const readline = require('readline');
const path = require('path');

const stubJsFolder = 'stub/js';
const stubTsFolder = 'stub/ts';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter package name: ', (packageName) => {
    rl.question('Enter author name: ', (authorName) => {
        rl.question('Enter author email: ', (authorEmail) => {
            rl.question('Enter package description: ', (description) => {
                rl.question('Choose language (js/ts): ', (language) => {
                    rl.question('Choose package manager (npm/pnpm/yarn): ', (packageManager) => {
                        const packageJson = {
                            name: packageName.replace(/\s+/g, '-').toLowerCase(),
                            version: '1.0.0',
                            description: description,
                            main: `src/index.${language === 'js' ? 'js' : 'ts'}`,
                            scripts: {
                                test: 'echo "No tests implemented yet"'
                            },
                            author: `${authorName} <${authorEmail}>`,
                            license: 'MIT'
                        };

                        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));


                        let license = fs.readFileSync('LICENSE', 'utf8');
                        license = license.replace('__YEAR__', new Date().getFullYear());
                        license = license.replace('__AUTHOR_NAME__', authorName);
                        fs.writeFileSync('LICENSE', license);

                        // Copy files from stub folder to src
                        const srcFolder = 'src';
                        fs.mkdirSync(srcFolder);

                        let stubFolder;
                        if (language === 'js') {
                            stubFolder = stubJsFolder;
                        } else {
                            stubFolder = stubTsFolder;
                        }

                        fs.readdirSync(stubFolder).forEach((file) => {
                            fs.copyFileSync(path.join(stubFolder, file), path.join(srcFolder, file));
                        });

                        // Delete stub folders
                        fs.rmSync(stubJsFolder, { recursive: true });
                        fs.rmSync(stubTsFolder, { recursive: true });

                        // Delete tsconfig.json if TypeScript was chosen
                        if (language === 'js') {
                            fs.unlinkSync('tsconfig.json');
                            console.log('tsconfig.json delete \n')
                        }

                        // Delete config.js file
                        fs.unlinkSync('config.cjs');

                        console.log('Package configured successfully! \n');

                        console.log(`Run the following command to install dependencies: ${packageManager} install `);
                        rl.close();
                    });
                });
            });
        });
    });
});