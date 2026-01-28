local fs = require("@lune/fs")
local process = require("@lune/process")

local function parseEnvFile(path)
    local env = {}
	local keyInEnv = process.env.ROBLOX_OC_API_KEY
	if keyInEnv then
		env.ROBLOX_OC_API_KEY = process.env.ROBLOX_OC_API_KEY
		env.ROBLOX_UNIVERSE_ID = process.env.ROBLOX_UNIVERSE_ID
		env.ROBLOX_PLACE_ID = process.env.ROBLOX_PLACE_ID
		return env
	end

    local content = fs.readFile(path)
    if not content then return env end

	for _,line in content:split("\n") do
		line = line:gsub("^%s*(.-)%s*$", "%1")
		if line ~= "" and  string.sub(line,0, 1) ~= "#" then
			local key, value = string.match(line, "^%s*([%w_]+)%s*=%s*(.-)%s*$")
			if key and value then
				if string.sub(line,0, 1) == '"' and string.sub(line,-1) == '"' then
					value = value:sub(2, -2)
				elseif string.sub(line,0, 1) == "'" and string.sub(line,-1) == "'" then
					value = value:sub(2, -2)
				end
				env[key] = value
			end
		end
	end

    return env
end


return parseEnvFile