local fs = require("@lune/fs")

local function parseEnvFile(path)
    local env = {}
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