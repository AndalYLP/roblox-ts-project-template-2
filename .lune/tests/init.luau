local fs = require("@lune/fs")
local process = require("@lune/process")

local buildUploadPlaceAsync = require("@test/utils/buildUploadPlaceAsync")
local executeLuauTaskAsync = require("@test/utils/executeLuauTaskAsync")
local parseEnvFile = require("@test/utils/parseEnvFile")

local success, envFile = pcall(parseEnvFile, ".env")
if not success then
    error(
        "No environment variable set for ROBLOX_OC_API_KEY. Please set it in the environment or in the .env file.", envFile
    )
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
    local apiKey = envFile.ROBLOX_OC_API_KEY

    local verbose = hasArg("--verbose")
    local ci = hasArg("--ci")

    local jestScript = fs.readFile("out/test/runtime.server.luau")
    jestScript = jestScript:gsub(
        "(_G%.__VERBOSE__%s*=%s*)[^\n]*",
        "%1" .. (verbose and "true" or "false")
    )
    jestScript = jestScript:gsub(
        "(_G%.__CI__%s*=%s*)[^\n]*",
        "%1" .. (ci and "true" or "false")
    )

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