interface ServerScriptService {
	TS: Folder & {
		centurion: Folder & {
			commands: Folder;
			guards: Folder;
			run: ModuleScript;
		};
	};
}

interface ReplicatedStorage {
	TS: Folder & {
		centurion: Folder & {
			types: Folder;
		};
	};
}
