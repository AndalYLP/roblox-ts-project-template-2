local fs = require("@lune/fs")
local process = require("@lune/process")

local buildUploadPlaceAsync = require("@test/utils/buildUploadPlaceAsync")
local executeLuauTaskAsync = require("@test/utils/executeLuauTaskAsync")
local parseEnvFile = require("@test/utils/parseEnvFile")

local success, envFile = pcall(parseEnvFile, ".env")
if not success then
    error(
        "No environment variable set for ROBLOX_OC_API_KEY. Please set it in the environment or in the .env.luau file."
    )
end

local function getApiKey(): string
    local keyInEnv = process.env.ROBLOX_OC_API_KEY
    if keyInEnv then
        return keyInEnv
    end

    return envFile.ROBLOX_OC_API_KEY
end

local function hasArg(requiredArg: string)
    for _, arg in process.args do
        if arg == requiredArg then
            return true
        end
    end
    return false
end

local function main()
    local apiKey = getApiKey()

    local verbose = hasArg("--verbose")
    local ci = hasArg("--ci")

    local jestScript = fs.readFile("out/test/runtime.server.luau")
    jestScript = jestScript:gsub("_G.__VERBOSE__", if verbose then "true" else "false")
    jestScript = jestScript:gsub("_G.__CI__", if ci then "true" else "false")

    local uploadResult = buildUploadPlaceAsync({
        universeId = envFile.ROBLOX_UNIVERSE_ID,
        placeId = envFile.ROBLOX_PLACE_ID,
        apiKey = apiKey,
        filePath = "game.rbxl",
        rojoProjectFile = "default.project.json",
    })

    if uploadResult then
        local passed = executeLuauTaskAsync({
            universeId = envFile.ROBLOX_UNIVERSE_ID,
            placeId = envFile.ROBLOX_PLACE_ID,
            placeVersion = uploadResult.versionNumber,
            apiKey = apiKey,
            script = jestScript,
        })

        if not passed then
            process.exit(1)
            return
        end
    end

    -- Explicitly exit because Lune sucks at async tasks
    process.exit(0)
end

main()