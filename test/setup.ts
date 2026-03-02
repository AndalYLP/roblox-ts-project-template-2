for (const [key] of pairs(_G)) {
	if (typeIs(key, "Instance") && key.IsA("ModuleScript")) {
		delete _G[key as keyof _G];
	}
}
