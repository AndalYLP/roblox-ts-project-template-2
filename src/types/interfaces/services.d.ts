interface ServerScriptService {
	TS: {
		centurion: {
			commands: Folder;
			guards: Folder;
			run: ModuleScript;
		} & Folder;
	} & Folder;
}

interface ReplicatedStorage {
	TS: {
		centurion: {
			types: Folder;
		} & Folder;
	} & Folder;
}
