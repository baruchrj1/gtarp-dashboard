local function debugLog(message)
    if Config.Debug then
        print("^5[Dashboard Sync]^7 " .. message)
    end
end

local function sendPayload(type, data)
    debugLog("Sending payload type: " .. type)
    
    PerformHttpRequest(Config.DashboardURL .. '/api/fivem/ingest', function(err, text, headers)
        if err == 200 then
            debugLog("Data sent successfully.")
        else
            print("^1[Dashboard Sync] Error sending data: " .. tostring(err) .. "^7")
            if text then print("Response: " .. text) end
        end
    end, 'POST', json.encode({
        token = Config.SecretToken,
        type = type,
        data = data
    }), {
        ['Content-Type'] = 'application/json'
    })
end

-- 1. Sync Online Players Loop
Citizen.CreateThread(function()
    while true do
        local players = {}
        
        for _, playerId in ipairs(GetPlayers()) do
            local identifiers = {}
            for i = 0, GetNumPlayerIdentifiers(playerId) - 1 do
                local id = GetPlayerIdentifier(playerId, i)
                if string.find(id, "discord") then
                    identifiers.discord = id
                elseif string.find(id, "license") then
                    identifiers.license = id
                end
            end

            table.insert(players, {
                id = playerId,
                name = GetPlayerName(playerId),
                ping = GetPlayerPing(playerId),
                identifiers = identifiers
            })
        end

        sendPayload("PLAYERS_UPDATE", players)

        Citizen.Wait(Config.UpdateInterval)
    end
end)

-- 2. Optional: Log Events (Example: Chat Message)
-- AddEventHandler('chatMessage', function(source, name, message)
--     sendPayload("SERVER_LOG", {
--         event = "chat",
--         source = source,
--         name = name,
--         message = message,
--         timestamp = os.time()
--     })
-- end)

print("^2[Dashboard Sync] Resource Started Successfully.^7")
print("^2[Dashboard Sync] Target URL: " .. Config.DashboardURL .. "^7")
