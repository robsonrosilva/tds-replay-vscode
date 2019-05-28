import * as vscode from 'vscode';
import * as path from 'path';
import * as nls from 'vscode-nls';
import fs = require("fs");
import { Session } from './session';
import { SessionsProvider } from './sessionsProvider';
import { ReplayParameters } from '../model/replayParameters';

const localize = nls.loadMessageBundle();
const sessionProvider = new SessionsProvider();

const messages = {
	'att.required': 'Atributo [{0}] requerido.'
};

const ATT_REQUIRED = 'att.required';
const MSG_READY = 'ready';
const MSG_SELECT_SMART_CLIENT = 'selectSmartClient';
const MSG_SELECT_PARAMETERS_FILE = 'selectParametersFile';
const MSG_EDIT_INCLUDES = 'editIncludes';
const MSG_UPCATE_MODEL = 'updateModel';
const MSG_START = 'start';
const MSG_SHOW_EDIT_LIST = 'showEditList';
const MSG_UPDATE_DIALOG = 'updateDialog';
const MSG_EDIT_LIST_ADD_ITEM = "editListDialog.addItem";
const MSG_EDIT_LIST_REMOVE_ITEM = "editListDialog.removeItem";


function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

let replayParameters: ReplayParameters = {
	socialName: "",
	id: "",
	contactName: "",
	contactEmail: "",
	contactPhone: "",
	smartClientFilename: "",
	parameters: [""],
	startProgram: "",
	programParameters: [""],
	driver: "",
	environment: "",
	parametersFilename: "",
	alias: "",
	description: "",
	recordFilename: "",
	includes: [""],
	excludes: [""],
	tables: [""],
	functions: [""],
	arrayLevel: 0,
	startImmediately: false,
	recordAllLevels: false,
	disableDuplicateLineVerification: false
};

export class SessionExplorer {

	constructor(context: vscode.ExtensionContext) {
		vscode.window.createTreeView('tds-replay.explorer', {
			treeDataProvider: sessionProvider
		});

		context.subscriptions.push(vscode.commands.registerCommand('tds-replay.load', () => loadReplayFile(context)));
		context.subscriptions.push(vscode.commands.registerCommand('tds-replay.record', () => recordSession(context)));
		context.subscriptions.push(vscode.commands.registerCommand('tds-replay.remove', (session: Session) => removeSession(session)));
		//context.subscriptions.push(vscode.commands.registerCommand('tds-replay.show', (session: Session) => show(panelInfos, context, session)));
	}

}

function getSessionList() {
	const sessions: Array<Session> = new Array<Session>();

	return sessions;
}

function removeSession(session) {
	let ix = sessionProvider.sessions.indexOf(session);
	if (ix >= 0) {
		//treeDataProvider.sessions
	}
}

function loadReplayFile(context) {
	let options: vscode.OpenDialogOptions = {
		//openLabel: localize("tssreplay.open.file", "Abrir Arquivo TDS Replay"),
		canSelectFiles: true,
		canSelectFolders: false,
		canSelectMany: false,
		filters: { "TDS Replay files": ["trpl"] }
	};

	vscode.window.showOpenDialog(options).then((value: vscode.Uri[]) => {
		vscode.window.showWarningMessage('Opção ainda não implementada. O arquivo selecionado foi ' + value[0]);
	});
}

function recordSession(context) {
	const panelAdd: vscode.WebviewPanel = vscode.window.createWebviewPanel(
		'tds-replay.record',
		'Gravar Nova Sessão',
		vscode.ViewColumn.One,
		{
			enableScripts: true,
			localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'resources', 'webview'))],
			retainContextWhenHidden: true,

		}
	);

	panelAdd.webview.html = getWebViewContent(context);
	fs.writeFileSync('r:\\lixo\\a.html', panelAdd.webview.html);

	panelAdd.onDidDispose(
		() => {
			//panelAdd = 
		},
		null,
		context.subscriptions
	);

	panelAdd.webview.onDidReceiveMessage(message => {
		let errors: any[] = [];
		console.debug(">>>>>>> ");
		console.debug(message);

		switch (message.command) {
			case MSG_READY:
				panelAdd.webview.postMessage({ command: MSG_UPDATE_DIALOG, data: replayParameters });
				break;

			case MSG_SELECT_SMART_CLIENT:
				selectSmartClient(panelAdd);
				break;
			case MSG_SELECT_PARAMETERS_FILE:
				selectParamatersFile(panelAdd);
				break;
			case MSG_UPCATE_MODEL:
				replayParameters = fromJson(message.data);
				errors = validateModel(replayParameters);
				errors.slice(0, 1).forEach(element => {
					vscode.window.showErrorMessage(localize(element[1], messages[element[1]], localize(element[0], element[0])));
				});
				panelAdd.webview.postMessage({ command: MSG_UPDATE_DIALOG, data: replayParameters, errors: errors });
				break;

			case MSG_EDIT_INCLUDES:
				editIncludes(panelAdd);
				break;
			case MSG_EDIT_LIST_ADD_ITEM:

				break;
			case MSG_EDIT_LIST_REMOVE_ITEM:
				break;
			case MSG_START:
				replayParameters = fromJson(message.data);
				//				errors = validateModel(replayParameters);
				//				errors.forEach(element => {
				//					vscode.window.showErrorMessage(element[1], localize(element[0], element[0]));
				//				});
				//				panelAdd.webview.postMessage({ command: MSG_UPDATE_DIALOG, data: replayParameters, errors: errors });

				if (errors.length === 0) {
					//createSession(replayParameters);
					vscode.window.showInformationMessage('Iniciando sessão de gravação.', replayParameters.alias);
					vscode.window.showErrorMessage("Desculpe. Operação não será iniciada. Aguardando implementação no servidor Lobo-Guará.");

					panelAdd.dispose();
				}
				break;
		}
	},
		undefined,
		context.subscriptions
	);
}

function createSession(replayParameters: ReplayParameters): Session | undefined {
	//replayParameters.startDate = Date.now;

	const session = new Session(replayParameters);

	sessionProvider.refresh();

	return session;
}

function fromJson(data: any): ReplayParameters {
	return {
		socialName: data['socialName'],
		id: data['id'],
		contactName: data['contactName'],
		contactEmail: data['contactEmail'],
		contactPhone: data['contactPhone'],
		smartClientFilename: data['smartClientFilename'],
		parameters: data['parameters'],
		startProgram: data['startProgram'],
		programParameters: data['programParameters'],
		driver: data['driver'],
		environment: data['environment'],
		parametersFilename: data['parametersFilename'],
		alias: data['alias'],
		description: data['description'],
		recordFilename: data['recordFilename'],
		includes: data['includes'],
		excludes: data['excludes'],
		tables: data['tables'],
		functions: data['functions'],
		arrayLevel: data['arrayLevel'],
		startImmediately: data['startImmediately'],
		recordAllLevels: data['recordAllLevels'],
		disableDuplicateLineVerification: data['disableDuplicateLineVerification'],
	};
}

function validateModel(model: ReplayParameters): any[] {
	const errors: any[] = [];

	try {
		if (!model.socialName.match(/^$|\s+/)) {
			if (model.id.match(/^$|\s+/)) { errors.push(['id', ATT_REQUIRED]); }
			if (model.contactName.match(/^$|\s+/)) { errors.push(['contactName', ATT_REQUIRED]); }
			if (model.contactEmail.match(/^$|\s+/)) { errors.push(['contactEmail', ATT_REQUIRED]); }
			if (model.contactPhone.match(/^$|\s+/)) { errors.push(['contactPhone', ATT_REQUIRED]); }
		}

		if (model.smartClientFilename.match(/^$|\s+/)) { errors.push(['smartClientFilename', ATT_REQUIRED]); }
		//if (model.parameters         .match(/^$|\s+/)) { errors.push(['parameters'         , ATT_REQUIRED]); }
		if (model.startProgram.match(/^$|\s+/)) { errors.push(['startProgram', ATT_REQUIRED]); }
		//if (model.programParameters  .match(/^$|\s+/)) { errors.push(['programParameters'  , ATT_REQUIRED]); }
		if (model.driver.match(/^$|\s+/)) { errors.push(['driver', ATT_REQUIRED]); }
		if (model.environment.match(/^$|\s+/)) { errors.push(['environment', ATT_REQUIRED]); }
		if (model.parametersFilename.match(/^$|\s+/)) { errors.push(['parametersFilename', ATT_REQUIRED]); }
		if (model.alias.match(/^$|\s+/)) { errors.push(['alias', ATT_REQUIRED]); }
		if (model.description.match(/^$|\s+/)) { errors.push(['description', ATT_REQUIRED]); }
		if (model.recordFilename.match(/^$|\s+/)) { errors.push(['recordFilename', ATT_REQUIRED]); }
		if (model.includes.length === 0) { errors.push(['includes', ATT_REQUIRED]); }
		//if (model.excludes           .match(/^$|\s+/)) { errors.push(['excludes'           , ATT_REQUIRED]); }
		//if (model.tables             .match(/^$|\s+/)) { errors.push(['tables'             , ATT_REQUIRED]); }
		//if (model.functions          .match(/^$|\s+/)) { errors.push(['functions'          , ATT_REQUIRED]); }
		//if (model.arrayLevel         .match(/^$|\s+/)) { errors.push(['arrayLevel'         , ATT_REQUIRED]); }
		//if (model.startImmediately   .match(/^$|\s+/)) { errors.push(['startImmediately'   , ATT_REQUIRED]); }
		//if (model.recordAllLevels    .match(/^$|\s+/)) { errors.push(['recordAllLevels'    , ATT_REQUIRED]); }
	} catch (error) {
		//
	}

	return errors;
}

function getWebViewContent(context) {
	// Use a nonce to whitelist which scripts can be run
	const nonce = getNonce();

	// Local path to scripts run and css used in the webview
	const jqueryPath = vscode.Uri.file(path.join(context.extensionPath, 'resources', 'webview', "jquery", "jquery-3.4.1.min.js"));

	const bootstrapPath = vscode.Uri.file(path.join(context.extensionPath, 'resources', 'webview', "bootstrap", "js",  "bootstrap.min.js"));
	const bootstrapCssPath = vscode.Uri.file(path.join(context.extensionPath, 'resources', 'webview', "bootstrap", "css",  "bootstrap.min.css"));

	// And the uri we use to load this script in the webview
	const jquery = jqueryPath.with({ scheme: 'vscode-resource' });
	const bootstrap = bootstrapPath.with({ scheme: 'vscode-resource' });
	const bootstrapCss = bootstrapCssPath.with({ scheme: 'vscode-resource' });

	return `<!DOCTYPE html>
	<html lang="pt-br">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<xmeta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';">
		<title>${localize("tdsreplay.webview.recorder.session.title", "Gravação de Nova Sessão")}</title>
		<link rel="stylesheet" href="${bootstrapCss}">
	</head>
	<body>
	<div class="logo">
		<span class="formTitle">${localize("tdsreplay.webview.recorder.session.title", "Gravação de Nova Sessão")}</span>
	</div>

	<div class="card">
		<div class="card-title">
			Qualificação
		</div>
		<div class="card-body">
			${qualificationParameters()}
		</div>

		<div class="card-title">
			Smart Client
		</div>
		<div class="card-body">
			${smartClientParameters()}
		</div>

		<div class="card-title">
			Parâmetros de gravação
		</div>
		<div class="card-body">
			${recordParameters()}
		</div>

		<div class="card-title">
			Parâmetros avançados
		</div>
		<div class="card-body">
			${advancedParameters()}
		</div>

		<div class="card-footer">
			<button id="btn-cancel" type="button" class="btn btn-secondary">${localize('tdsreplay.webview.cancel', "Cancelar")}</button>
			<button id="btn-ok" type="button" class="btn btn-primary">${localize('tdsreplay.webview.start', "Iniciar")}</button>
		</div>
	</div>
	
	${editListDialog()}
	
	</body>
	
	<script nonce="${nonce}">
	function logJson(title, obj) {
		str = JSON.stringify(obj, null, 4); // (Optional) beautiful indented output.
		console.log(title);
		console.log('-----------------------------');
		console.log(str);
	}
	</script>

	<script nonce="${nonce}" src="${jquery}"> </script>
	<script nonce="${nonce}" src="${bootstrap}"></script>

	<script nonce="${nonce}">
		const vscode = acquireVsCodeApi();

		window.addEventListener('message', event => {
			const message = event.data; 

			switch (message.command) {
			case '${MSG_UPDATE_DIALOG}':
				if (message.data) {
					updateDialog(message.data);
				}

				if (message.errors) {
					updateError(message.errors);
				} else {
					updateError({});
				}

				break;
			case '${MSG_SHOW_EDIT_LIST}':
				logJson("MSG_SHOW_EDIT_LIST", message);

				prepareEditListDialog(message.data['title'], message.data['values'])
				$("#editListDialog").modal('show');
				break;
			}
		});

		function start() {
			vscode.postMessage({
				command: '${MSG_START}',
				data: {}
			});
		}

		function cancel() {
			vscode.postMessage({
				command: 'cancel',
				data: {}
			});
		}

		function updateError(errors) {
			$('input').removeClass("has-error");
			
			for (i in errors) {
				error = errors[i];
				id = '#txt' + error[0].charAt(0).toUpperCase() + error[0].slice(1);
				$(id).addClass("has-error");
			};
		}

		function updateDialog(data) {
			$('#txtSocialName'         ).val(data['socialName'         ]);
			$('#txtId'                 ).val(data['id'                 ]);
			$('#txtContactName'        ).val(data['contactName'        ]);
			$('#txtContactEmail'       ).val(data['contactEmail'       ]);
			$('#txtcontactPhone'       ).val(data['contactPhone'       ]);
			$('#txtSmartClientFilename').val(data['smartClientFilename']);
			//$('#txtParameters'         ).val(data['parameters'         ].join(';'));
			$('#txtStartProgram'       ).val(data['startProgram'       ]); 
			//$('#txtProgramParameters'  ).val(data['programParameters'  ].join(';'));
			$('#txtDriver'             ).val(data['driver'             ]); 
			$('#txtEnvironment'        ).val(data['environment'        ]);
			$('#txtParametersFilename' ).val(data['parametersFilename' ]); 
			$('#txtAlias'              ).val(data['alias'              ]); 
			$('#txtDescription'        ).val(data['description'        ]);
			$('#txtRecordFilename'     ).val(data['recordFilename'     ]); 
			//$('#txtIncludes'           ).val(data['includes'           ].join(';'));
			//$('#txtExcludes'           ).val(data['excludes'           ].join(';'));
			//$('#txtTables'             ).val(data['tables'             ].join(';'));
			//$('#txtFunctions'          ).val(data['functions'          ].join(';'));
			$('#txtArrayLevel'         ).val(data['arrayLevel'         ]);

			$('#txtStartImmediately'   ).attr("checked", data['startImmediately'   ]);
			$('#txtRecordAllLevels'    ).attr("checked", data['recordAllLevels'    ]);

			$('#txtDisableDuplicateLineVerification').attr("checked", data['disableDuplicateLineVerification'    ]);
	}

		function updateModel() {
			var data = {
				'socialName'         : $('#txtSocialName'         ).val(),
				'id'                 : $('#txtId'                 ).val(),
				'contactName'        : $('#txtContactName'        ).val(),
				'contactEmail'       : $('#txtContactEmail'       ).val(),
				'contactPhone'       : $('#txtContactPhone'       ).val(),
				'smartClientFilename': $('#txtSmartClientFilename').val(),
				'parameters'         : $('#txtParameters'         ).val(),
				'startProgram'       : $('#txtStartProgram'       ).val(), 
				'programParameters'  : $('#txtProgramParameters'  ).val(),
				'driver'             : $('#txtDriver'             ).val(), 
				'environment'        : $('#txtEnvironment'        ).val(),
				'parametersFilename' : $('#txtParametersFilename' ).val(), 
				'alias'              : $('#txtAlias'              ).val(), 
				'description'        : $('#txtDescription'        ).val(),
				'recordFilename'     : $('#txtRecordFilename'     ).val(), 
				'includes'           : $('#txtIncludes'           ).val(),
				'excludes'           : $('#txtExcludes'           ).val(),
				'tables'             : $('#txtTables'             ).val(),
				'startImmediately'   : $('#txtStartImmediately'   ).attr("checked"),
				'functions'          : $('#txtFunctions'          ).val(),
				'arrayLevel'         : $('#txtArrayLevel'         ).val(),
				'recordAllLevels'    : $('#txtRecordAllLevels'    ).attr("checked"),
				'disableDuplicateLineVerification': $('#txtDisableDuplicateLineVerification').attr("checked")
			}

			vscode.postMessage({
				command: '${MSG_UPCATE_MODEL}',
				data: data
			});
		};

		$.when($.ready).then(function() {
			$("input").bind("change", function(e) {
				updateModel();
			});

			$(":button").click(function(e) {
				action = $(e.target).data("callback")
				vscode.postMessage({
					command: action
				});
			});

			$("button[name='btnPattern'").click(function(e) {
				action = $(e.target).data("callback")

				vscode.postMessage({
					command: action,
					data: { 'pattern' : $("#txtPattern").val(), 'currentPattern': $("#lstPatterns option:selected").text() }
				});
			});

			$('#btn-ok').click(function(e) {
				start();
			});
			
			$('#editListDialog').on('shown.bs.modal', function () {
				$('#editListDialog').trigger('focus')
			  })

			vscode.postMessage({
				command: '${MSG_READY}'
			});
		})

	</script>`;
}

function fieldGroup(id: string, label: string): string {
	return `
	<div class="row">
		<div class="col">
			<div class="input-group input-group-sm">
				<label class="text-bold">${localize("tdsreplay.webview." + id.toLowerCase(), label)}</label> 
			</div>
		</div>
	</div>
`;
}

function button(id: string, action?: string | string[]): string {
	let html = "";

	if (action === undefined) {
	} else if (Array.isArray(action)) {
		html = `<div class="input-group-append">`;
		action.forEach((value, index) => {
			html += `<button class="btn btn-outline-secondary" type="button" id="btn${id}_${index}" name="btn${id}" data-callback="${value}">${localize("tdsreplay.webview." + value.toLowerCase(), value)}</button>`;
		});
		html += `</div>`;
	} else {
		html = `<div class="input-group-append">
			<button class="btn btn-outline-secondary" type="button" id="btn${id}" data-callback="${action}">...</button>
		</div>`;
	}

	return html;
}

function field(id: string, label: string, action?: string | string[]): string {
	return `
	<div class="row">
		<div class="col">
			<div class="input-group input-group-sm">
				<label for="txt${id}">${localize("tdsreplay.webview." + id.toLowerCase(), label)}</label> 
				<input id="txt${id}" type="text" class="form-control text-left">
				${button(id, action)}
			</div>
		</div>
	</div>
`;
}

function text(id: string, text: string): string {
	return `
	<div class="row">
		<div class="col">
			<div class="input-group input-group-sm">
				<span id="text${id}">${text}</span> 
			</div>
		</div>
	</div>
`;
}

function listBox(id: string, text: string, size: Number = 10): string {
	return `
	<div class="row">
		<div class="col">
			<div class="input-group input-group-sm">
				<select class="custom-select" id="lst${id}" size=${size}>
				</select>
			</div>
		</div>
	</div>
`;
}

function editListDialog() {
	return `
	<div class="modal" tabindex="-1" role="dialog" id="editListDialog">
		<div class="modal-dialog" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Modal title</h5>
					<button type="button" class="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
				${text("ln1", "Informe nome dos arquivos")}
				${text("ln2", "(? = qualquer caracter, * = qualquer sequência de caracteres")}
				${field("Pattern", "", [MSG_EDIT_LIST_ADD_ITEM, MSG_EDIT_LIST_REMOVE_ITEM])}
				${listBox("Patterns", "")}
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary">Save changes</button>
					<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>
	<script>
	function prepareEditListDialog(title, values) {
		$("#editListDialog .modal-title").text(title);
		$.each(values, function(key, value) {   
			$("#editListDialog #lstPatterns")
				.append($("<option></option>")
						   .attr("value", key)
						   .text(value)); 
	   });
	}

	</script>`;
}

function selectSmartClient(webviewPanel: vscode.WebviewPanel) {
	let options: vscode.OpenDialogOptions = {
		canSelectFiles: true,
		canSelectFolders: false,
		canSelectMany: false,
		filters: { "SmartClient Executable": ["exe"] }
	};

	vscode.window.showOpenDialog(options).then((value: vscode.Uri[]) => {
		if (value) {
			replayParameters.smartClientFilename = value.toString();
			webviewPanel.webview.postMessage({ command: MSG_UPDATE_DIALOG, data: replayParameters });
		}
	});

}

function selectParamatersFile(webviewPanel: vscode.WebviewPanel) {
	let options: vscode.OpenDialogOptions = {
		canSelectFiles: true,
		canSelectFolders: false,
		canSelectMany: false,
		filters: { "Parâmetros TDS Replay": ["trparam"] }
	};

	vscode.window.showOpenDialog(options).then((value: vscode.Uri[]) => {
		if (value) {
			replayParameters.parametersFilename = value.toString();
			webviewPanel.webview.postMessage({ command: MSG_UPDATE_DIALOG, data: replayParameters });
		}
	});

}

function editIncludes(webviewPanel: vscode.WebviewPanel) {
	replayParameters.includes = ["op1", "op2", "op3"];

	const values = { title: 'Lista de inclusão', values: replayParameters.includes };
	webviewPanel.webview.postMessage({ command: MSG_SHOW_EDIT_LIST, data: values });
}

function qualificationParameters() {
	return `
	${field("SocialName", "Razão Social")}
	${field("Id", "CNPJ")}
	${fieldGroup("Contact", "Contato")}
	${field("ContactName", "Nome")}
	${field("ContactEmail", "E-mail")}
	${field("ContactPhone", "Telefone")}
	`;
}

function smartClientParameters() {
	return `
	${field("SmartClientFilename", "SmartClient", MSG_SELECT_SMART_CLIENT)}
	${field("Parameters", "Parâmetros")}
	${field("StartProgram", "Programa inicial")}
	${field("ProgramParameters", "Parâmetros do programa (-A)")}
	${field("Driver", "Comunicação no cliente")}
	${field("Environment", "Ambiente")}
	`;
}

function recordParameters() {
	return `
	${field("ParametersFilename", "Arquivo de parâmetros", MSG_SELECT_PARAMETERS_FILE)}
	${field("Alias", "Apelido")}
	${field("Description", "Descrição")}
	${field("RecordFilename", "Arquivo de gravação")}
	${field("Includes", "Lista de inclusão", MSG_EDIT_INCLUDES)}
	${field("Excludes", "Lista de exclusão")}
	${field("Tables", "Lista de tabelas")}
	${field("StartImmediately", "Iniciar gravação imediata")}
	`;
}

function advancedParameters() {
	return `
	${field("Functions", "Lista de funções")}
	${field("ArrayLevel", "Nível máximo de array/objeto")}
	${field("RecordAllLevels", "Gravar todos os níveis")}
	${field("DisableDuplicateLineVerification", "Desabilitar verificação de linhas duplicadas")}
	`;
}
