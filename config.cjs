const fs = require('fs');
const readline = require('readline');
const path = require('path');

const stubFolder = 'stub';

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

                        // Copy vite.config file from stub folder
                        const viteConfigStubFile = path.join(stubFolder, 'vite.config');
                        const viteConfigFile = `vite.config${language === 'js' ? '.js' : '.ts'}`;
                        fs.copyFileSync(viteConfigStubFile, viteConfigFile);

                        // Replace __PACKAGE_NAME__ in vite.config file
                        let viteConfigContent = fs.readFileSync(viteConfigFile, 'utf8');
                        viteConfigContent = viteConfigContent.replace(/__PACKAGE_NAME__/g, packageName);
                        fs.writeFileSync(viteConfigFile, viteConfigContent);

                        // Copy files from stub folder to src
                        const srcFolder = 'src';
                        fs.mkdirSync(srcFolder);

                        fs.readdirSync(stubFolder).forEach((file) => {
                            if (file !== 'vite.config.stub') {
                                fs.copyFileSync(path.join(stubFolder, file), path.join(srcFolder, file));
                            }
                        });

                        // Delete stub folder
                        fs.rmSync(stubFolder, { recursive: true });

                        // Delete tsconfig.json if TypeScript was chosen
                        if (language === 'js') {
                            fs.unlinkSync('tsconfig.json');
                            console.log('tsconfig.json deleted \n')
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