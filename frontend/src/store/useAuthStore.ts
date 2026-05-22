import { useEffect, useState } from "react";

type AuthState = {
	isAuthenticated: boolean;
	login: () => void;
	logout: () => void;
};

let authenticated = false;
const listeners = new Set<() => void>();

function emitChange() {
	listeners.forEach((listener) => listener());
}

export function useAuthStore(): AuthState {
	const [, setTick] = useState(0);

	useEffect(() => {
		const listener = () => setTick((value) => value + 1);
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	}, []);

	return {
		isAuthenticated: authenticated,
		login: () => {
			authenticated = true;
			emitChange();
		},
		logout: () => {
			authenticated = false;
			emitChange();
		}
	};
}
