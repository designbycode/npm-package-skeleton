const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const stubJsFolder = 'stub/js';
const stubTsFolder = 'stub/ts';

rl.question('Enter package name: ', (packageName) => {
    rl.question('Enter author name: ', (authorName) => {
        rl.question('Enter author email: ', (authorEmail) => {
            rl.question('Enter package description: ', (description) => {
                rl.question('Choose language (js/ts): ', (language) => {
                    rl.question('Choose package manager (npm/pnpm/yarn): ', (packageManager) => {
                        const packageJson = {
                            "name": packageName.replace(/\s+/g, '-').toLowerCase(),
                            "version": '1.0.0',
                            "description": description,
                            "main": `/dist/index.umd.cjs`,
                            "module": "./dist/index.js",
                            "type": 'module',
                            "author": `${authorName} <${authorEmail}>`,
                            "license": "MIT",
                            "types": "./dist/index.d.ts",
                            "exports": {
                                ".": {
                                    "import": "./dist/index.js",
                                    "require": "./dist/index.umd.cjs"
                                }
                            },
                            "files": [
                                "dist"
                            ],
                            "publishConfig": {
                                "access": "public"
                            },
                            "private": false,
                            "scripts": {
                                "dev": "vite",
                                "preview": "vite preview",
                                "build": "tsc --declaration && vite build",
                                "clean": "rd /s /q dist .cache>nul 2>&1|echo.>nul",
                                "test": "vitest",
                                "coverage": "vitest run --coverage",
                                "pretty": "prettier --write \"src/**/*.ts\""
                            },
                            "devDependencies": {
                                "@vitest/coverage-c8": "^0.33.0",
                                "typescript": "^5.2.2",
                                "vite": "^5.3.1",
                                "@types/node": "^20.14.8",
                                "@vitest/coverage-v8": "^1.6.0",
                                "prettier": "^3.3.2",
                                "vite-plugin-dts": "^3.9.1",
                                "vitest": "^1.6.0",
                            }
                        };

                        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

                        let license = fs.readFileSync('LICENSE', 'utf8');
                        license = license.replace('__YEAR__', new Date().getFullYear());
                        license = license.replace('__AUTHOR_NAME__', authorName);
                        fs.writeFileSync('LICENSE', license);

                        // Rename vite.config.stub file
                        const viteConfigStubFile = 'vite.config';
                        const viteConfigFile = `vite.config${language === 'js' ? '.js' : '.ts'}`;
                        fs.renameSync(viteConfigStubFile, viteConfigFile);

                        // Replace __PACKAGE_NAME__ in vite.config file
                        let viteConfigContent = fs.readFileSync(viteConfigFile, 'utf8');
                        viteConfigContent = viteConfigContent.replace(/__PACKAGE_NAME__/g, packageName);
                        fs.writeFileSync(viteConfigFile, viteConfigContent);

                        // Create src folder
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

                        // Delete stub folder
                        fs.rmSync('stub', { recursive: true });

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