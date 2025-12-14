import Vide from "@rbxts/vide";
import { usePx } from "client/ui/hooks/use-px";

export function App(): Vide.Node {
	usePx();

	return <screengui></screengui>;
}
