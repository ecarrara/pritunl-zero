/// <reference path="./References.d.ts"/>
import * as SuperAgent from 'superagent';
import * as Alert from './Alert';
import * as Csrf from './Csrf';

export interface Callback {
	(): void;
}

let callbacks: Set<Callback> = new Set<Callback>();
export let theme = 'dark';

export function save(): Promise<void> {
	return new Promise<void>((resolve, reject): void => {
		SuperAgent
			.put('/theme')
			.send({
				theme: theme,
			})
			.set('Accept', 'application/json')
			.set('Csrf-Token', Csrf.token)
			.end((err: any, res: SuperAgent.Response): void => {
				if (res && res.status === 401) {
					window.location.href = '/login';
					resolve();
					return;
				}

				if (err) {
					Alert.errorRes(res, 'Failed to save theme');
					reject(err);
					return;
				}

				resolve();
			});
	});
}

export function light(): void {
	theme = 'light';
	document.body.className = '';
	callbacks.forEach((callback: Callback): void => {
		callback();
	});
}

export function dark(): void {
	theme = 'dark';
	document.body.className = 'bp3-dark';
	callbacks.forEach((callback: Callback): void => {
		callback();
	});
}

export function toggle(): void {
	if (theme === 'light') {
		dark();
	} else {
		light();
	}
}

export function editorTheme(): string {
	if (theme === "light") {
		return "eclipse";
	} else {
		return "dracula";
	}
}

export function chartColor1(): string {
	if (theme === "light") {
		return 'rgba(0, 0, 0, 0.9)';
	} else {
		return 'rgba(255, 255, 255, 1)';
	}
}

export function chartColor2(): string {
	if (theme === "light") {
		return 'rgba(0, 0, 0, 0.2)';
	} else {
		return 'rgba(255, 255, 255, 0.2)';
	}
}

export function chartColor3(): string {
	if (theme === "light") {
		return '#6f6f6f';
	} else {
		return '#e5e5e5';
	}
}

export function addChangeListener(callback: Callback): void {
	callbacks.add(callback);
}

export function removeChangeListener(callback: () => void): void {
	callbacks.delete(callback);
}
