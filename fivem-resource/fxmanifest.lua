fx_version 'cerulean'
game 'gta5'

author 'GTARP Dashboard'
description 'Syncs player data and logs to the web dashboard'
version '1.0.0'

server_scripts {
    '@oxmysql/lib/MySQL.lua', -- Optional: If you want to grab more data later
    'config.lua',
    'server.lua'
}

dependencies {
    'oxmysql' -- Optional
}
