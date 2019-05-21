'use strict';
import { ExtensionContext } from 'vscode';
import * as nls from 'vscode-nls';

import { SessionExplorer } from './session/sessionExplorer';

let localize = nls.config({ locale: 'en' })();
let sessionsExplorer: SessionExplorer;

export function activate(context: ExtensionContext) {

	console.log(localize('tds.replay.console.congratulations', 'Congratulations, your extension "tds-replay-vscode" is now active!'));

	//View
	sessionsExplorer = new SessionExplorer(context);
	if (!sessionsExplorer) {
		console.error(localize('tds.vscode.monitor_view_not_load', 'Visão "Explorador de Sessões" não incializada.'));
	}
}
