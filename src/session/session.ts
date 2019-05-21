import * as vscode from 'vscode';
import { ReplayParameters } from '../model/replayParameters';

export class Session extends vscode.TreeItem {

	constructor(
		public replayParameters: ReplayParameters
	) {
		super(replayParameters.alias); //, collapsibleState);

		this.replayParameters = replayParameters;
	}

	get tooltip(): string {
		return `Data=${this.replayParameters.startDate} | Alias=${this.replayParameters.alias}`;
	}

	//contextValue = 'monitorItem';
}