const builder = require('electron-builder')
const Platform = builder.Platform

function getCurrentPlatform(){
    switch(process.platform){
        case 'win32':
            return Platform.WINDOWS
        case 'darwin':
            return Platform.MAC
        case 'linux':
            return Platform.linux
        default:
            console.error('Cannot resolve current platform!')
            return undefined
    }
}

builder.build({
    targets: (process.argv[2] != null && Platform[process.argv[2]] != null ? Platform[process.argv[2]] : getCurrentPlatform()).createTarget(),
    config: {
        appId: 'SoWLauncher',
        productName: 'Songs of War Launcher',
        artifactName: 'songs-of-war-launcher-setup-${version}.${ext}',
        copyright: 'Copyright © 2020-2020 lucasboss45',
        directories: {
            buildResources: 'build',
            output: 'dist'
        },
        win: {
            target: [
                {
                    target: 'nsis',
                    arch: 'x64'
                }
            ]
        },
        nsis: {
            oneClick: false,
            perMachine: false,
            allowElevation: true,
            allowToChangeInstallationDirectory: true,
        },
        mac: {
            target: [
                'dmg',
                'pkg'
            ],
            category: 'public.app-category.games',
            compression: 'maximum'
        },
        linux: {
            target: [
                'AppImage', // Only AppImage supports auto updating
                'deb',
                'rpm',
                'freebsd'
            ],
            maintainer: 'Songs of War Server',
            vendor: 'Songs of War Server',
            synopsis: 'Modded Minecraft Launcher',
            description: 'Launcher for the Songs of War Minecraft Server.',
            category: 'Game',
            icon: './build/icon.png'
        },
        files: [
            '!{dist,.gitignore,.vscode,docs,dev-app-update.yml,.travis.yml,.nvmrc,.eslintrc.json,build.js,.github,.nsis}'
        ],
        extraResources: [
            'libraries'
        ],
        asar: true
    }
}).then(() => {
    console.log('Build complete!')
}).catch(err => {
    console.error('Error during build!', err)
})
