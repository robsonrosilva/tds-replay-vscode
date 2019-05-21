import * as vscode from 'vscode';
import { Session } from './session';

export class SessionsProvider implements vscode.TreeDataProvider<Session> {

	private _onDidChangeTreeData: vscode.EventEmitter<Session | undefined> = new vscode.EventEmitter<Session | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Session | undefined> = this._onDidChangeTreeData.event;

	public sessions: Array<Session>;

	constructor() {
		this.addMonitorsConfigListener();
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Session): vscode.TreeItem {

		if (element instanceof Session) {
			/* TODO: indicador de status, 
			- novo
			- em execução
			- pronto
			let iconPath = {
				light: path.join(__filename, '..', '..', '..', 'resources', 'light', connectedMonitorItem !== undefined && element.id === connectedMonitorItem.id ? 'Monitor.connected.svg' : 'Monitor.svg'),
				dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', connectedMonitorItem !== undefined && element.id === connectedMonitorItem.id ? 'Monitor.connected.svg' : 'Monitor.svg')
			};
			element.iconPath = iconPath;
			*/
		}

		return element;
	}

	getChildren(element?: Session): Thenable<Session[]> {
/*
		if (element) {
			if (element.listSessions) {
				return Promise.resolve(element.listSessions);
			}
			else {
				return Promise.resolve([]);
			}
		} else {
			if (!this.localMonitorItems) {
				const serverConfig = Utils.getMonitorsConfig();
				if (!serverConfig || serverConfig.configurations.length <= 0) { //se o monitor.json existe
					this.localMonitorItems = new Array<MonitorItem>();
				} else {
					this.localMonitorItems = this.setConfigWithMonitorConfig();
				}
			}
		*/
		return Promise.resolve(this.sessions);
	}

	private addMonitorsConfigListener(): void {
/*
		let serversJson = Utils.getMonitorConfigFile();
		if (!fs.existsSync(serversJson)) {
			Utils.createMonitorConfig();
		}
		//Caso o arquivo servers.json seja encontrado, registra o listener já na inicialização.
		fs.watch(serversJson, { encoding: 'buffer' }, (eventType, filename) => {
			if (filename && eventType === 'change') {
				this.localMonitorItems = this.setConfigWithMonitorConfig();
				this.refresh();
			}
		});
	*/
	}

	/**
	 * Cria os itens da arvore de servidores a partir da leitura do arquivo servers.json
	 */
/*
	private setConfigWithMonitorConfig() {
		const serverConfig = Utils.getMonitorsConfig();
		const serverItem = (serverItem: string, address: string, port: number, id: string, buildVersion: string): MonitorItem => {
			return new MonitorItem(serverItem, address, port, vscode.TreeItemCollapsibleState.None, id, buildVersion, undefined);
		};

		const listServer = new Array<MonitorItem>();

		serverConfig.configurations.forEach(element => {
			listServer.push(serverItem(element.name, element.address, element.port, element.id, element.buildVersion));
		});

		return listServer;
	}
*/
}