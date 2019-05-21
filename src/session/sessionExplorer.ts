import * as vscode from 'vscode';
import * as path from 'path';
import * as nls from 'vscode-nls';
import { Session } from './session';
import { SessionsProvider } from './sessionsProvider';
import { ReplayParameters } from '../model/replayParameters';

const localize = nls.loadMessageBundle();
const sessionProvider = new SessionsProvider();

let replayParameters: ReplayParameters = {
	socialName         : "",
	id                 : "",
	contactName        : "",
	contactEmail       : "",
	contactPhone       : "",
	smartClientFilename: "",
	parameters         : [""],
	startProgram       : "",
	programParameters  : [""],
	driver             : "",
	environment        : "",
	parametersFilename : "",
	alias              : "",
	description        : "",
	recordFilename     : "",
	includes           : [""],
	excludes           : [""],
	tables             : [""],
	functions          : [""],
	arrayLevel         : 0,
	startImmediately   : false,
	recordAllLevels    : false,
	disableDuplicateLineVerification: false
};

let panelInfos: vscode.WebviewPanel | undefined = undefined;

export class SessionExplorer {

	constructor(context: vscode.ExtensionContext) {
		vscode.window.createTreeView('tds-replay.explorer', {
			treeDataProvider: sessionProvider
		});

		context.subscriptions.push(vscode.commands.registerCommand('tds-replay.load', () => loadReplayFile(context)));
		context.subscriptions.push(vscode.commands.registerCommand('tds-replay.record', () => recordSession(context)));
		context.subscriptions.push(vscode.commands.registerCommand('tds-replay.remove', (session: Session) => removeSession(session)));
		context.subscriptions.push(vscode.commands.registerCommand('tds-replay.show', (session: Session) => show(panelInfos, context, session)));
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
			localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'session'))],
			retainContextWhenHidden: true
		}
	);

	panelAdd.webview.html = getWebViewContent(context);
	//fs.writeFileSync('r:\\lixo\\a.html',panelAdd.webview.html);

	panelAdd.onDidDispose(
		() => {
			//panelAdd = 
		},
		null,
		context.subscriptions
	);

	panelAdd.webview.onDidReceiveMessage(message => {
		let errors: any[] = [];

		switch (message.command) {
			case 'ready':
				panelAdd.webview.postMessage({ command: 'updateDialog', data: JSON.stringify(replayParameters) });
				break;
			case 'updateModel':
				replayParameters = fromJson(message.data);
				errors = validateModel(replayParameters);
				errors.forEach(element => {
					vscode.window.showErrorMessage(element[1], localize(element[0], element[0]));
				});
				panelAdd.webview.postMessage({ command: 'updateDialog', data: replayParameters, errors: errors });
				break;
			case 'start':
				replayParameters = fromJson(message.data);
//				errors = validateModel(replayParameters);
//				errors.forEach(element => {
//					vscode.window.showErrorMessage(element[1], localize(element[0], element[0]));
//				});
//				panelAdd.webview.postMessage({ command: 'updateDialog', data: replayParameters, errors: errors });

				if (errors.length === 0) {
					//createSession(replayParameters);
					vscode.window.showInformationMessage('Iniciando sessão de gravação.', replayParameters.alias);
					vscode.window.showErrorMessage("Desculpe. Operação não será iniciada. Aguardando implementação no servidor Lobo-Guará.");

					panelAdd.dispose();
				}
		}
	},
		undefined,
		context.subscriptions
	);
}

function show(panelInfos, context, session) {
	if (panelInfos) {
		panelInfos.reveal();
	} else {
		panelInfos = vscode.window.createWebviewPanel(
			'tds-replay.show',
			'Sessão',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'session'))],
				retainContextWhenHidden: true
			}
		);

		panelInfos.webview.html = getWebViewContent(context);

		panelInfos.onDidDispose(
			() => {
				panelInfos = undefined;
			},
			null,
			context.subscriptions
		);

		panelInfos.webview.onDidReceiveMessage(message => {
			console.log(message);

			switch (message.command) {
				case 'ready':
					return JSON.stringify(replayParameters);
					break;
				case 'validate':
					return JSON.stringify(replayParameters);
					break;
			}
		},
			undefined,
			context.subscriptions
		);
	}
}

function createSession(replayParameters: ReplayParameters): Session | undefined {
	//replayParameters.startDate = Date.now;

	const session = new Session(replayParameters);

	sessionProvider.refresh();

	return session;
}

function fromJson(data: any): ReplayParameters {
	return {
		socialName         : data['socialName'         ],
		id                 : data['id'                 ],
		contactName        : data['contactName'        ],
		contactEmail       : data['contactEmail'       ],
		contactPhone       : data['contactPhone'       ],
		smartClientFilename: data['smartClientFilename'],
		parameters         : data['parameters'         ],
		startProgram       : data['startProgram'       ],
		programParameters  : data['programParameters'  ],
		driver             : data['driver'             ],
		environment        : data['environment'        ],
		parametersFilename : data['parametersFilename' ],
		alias              : data['alias'              ],
		description        : data['description'        ],
		recordFilename     : data['recordFilename'     ],
		includes           : data['includes'           ],
		excludes           : data['excludes'           ],
		tables             : data['tables'             ],
		functions          : data['functions'          ],
		arrayLevel         : data['arrayLevel'         ],
		startImmediately   : data['startImmediately'   ],
		recordAllLevels    : data['recordAllLevels'    ],
		disableDuplicateLineVerification: data['disableDuplicateLineVerification'    ],
	};
}

function validateModel(model: ReplayParameters): any[] {
	const ATT_REQUIRED = localize('att.required', 'Atributo requerido.');
	const errors: any[] = [];
	
	if (model.socialName         .match(/^$|\s+/)) { errors.push(['socialName'         , ATT_REQUIRED]);}
	if (model.id                 .match(/^$|\s+/)) { errors.push(['id'                 , ATT_REQUIRED]);}
	if (model.contactName        .match(/^$|\s+/)) { errors.push(['contactName'        , ATT_REQUIRED]);}
	if (model.contactEmail       .match(/^$|\s+/)) { errors.push(['contactEmail'       , ATT_REQUIRED]);}
	if (model.contactPhone       .match(/^$|\s+/)) { errors.push(['contactPhone'       , ATT_REQUIRED]);}
	if (model.smartClientFilename.match(/^$|\s+/)) { errors.push(['smartClientFilename', ATT_REQUIRED]);}
	//if (model.parameters         .match(/^$|\s+/)) { errors.push(['parameters'         , ATT_REQUIRED]);}
	if (model.startProgram       .match(/^$|\s+/)) { errors.push(['startProgram'       , ATT_REQUIRED]);}
	//if (model.programParameters  .match(/^$|\s+/)) { errors.push(['programParameters'  , ATT_REQUIRED]);}
	if (model.driver             .match(/^$|\s+/)) { errors.push(['driver'             , ATT_REQUIRED]);}
	if (model.environment        .match(/^$|\s+/)) { errors.push(['environment'        , ATT_REQUIRED]);}
	if (model.parametersFilename .match(/^$|\s+/)) { errors.push(['parametersFilename' , ATT_REQUIRED]);}
	if (model.alias              .match(/^$|\s+/)) { errors.push(['alias'              , ATT_REQUIRED]);}
	if (model.description        .match(/^$|\s+/)) { errors.push(['description'        , ATT_REQUIRED]);}
	if (model.recordFilename     .match(/^$|\s+/)) { errors.push(['recordFilename'     , ATT_REQUIRED]);}
	//if (model.includes           .match(/^$|\s+/)) { errors.push(['includes'           , ATT_REQUIRED]);}
	//if (model.excludes           .match(/^$|\s+/)) { errors.push(['excludes'           , ATT_REQUIRED]);}
	//if (model.tables             .match(/^$|\s+/)) { errors.push(['tables'             , ATT_REQUIRED]);}
	//if (model.functions          .match(/^$|\s+/)) { errors.push(['functions'          , ATT_REQUIRED]);}
	//if (model.arrayLevel         .match(/^$|\s+/)) { errors.push(['arrayLevel'         , ATT_REQUIRED]);}
	//if (model.startImmediately   .match(/^$|\s+/)) { errors.push(['startImmediately'   , ATT_REQUIRED]);}
	//if (model.recordAllLevels    .match(/^$|\s+/)) { errors.push(['recordAllLevels'    , ATT_REQUIRED]);}

	return errors;
}

function getWebViewContent(context) {
	return `<!DOCTYPE html>
	<html lang="pt-br">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>${localize("tdsreplay.webview.recorder.session.title", "Gravação de Nova Sessão")}</title>
	</head>
	<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
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

	</body>
	
	<script
		src="https://code.jquery.com/jquery-3.4.1.min.js"
		integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
		crossorigin="anonymous">
	</script>
	<script 
		src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" 
		integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" 
		crossorigin="anonymous">
	</script>

	<script>
		const vscode = acquireVsCodeApi();

		window.addEventListener('message', event => {
			const message = event.data; 
			console.log("addEventListener")
			console.log(message)

			switch (message.command) {
			case 'updateDialog':
				if (message.data) {
					updateDialog(message.data);
				}

				if (message.errors) {
					updateError(message.errors);
				} else {
					updateError({});
				}

				break;
			}
        });

		function start() {
			vscode.postMessage({
				command: 'start',
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
			console.debug('updateError')

			
			for (i in errors) {
				error = errors[i];
				console.debug(error)
				id = '#txt' + error[0].charAt(0).toUpperCase() + error[0].slice(1);
				console.debug('id='+id)
				$(id).addClass("has-error");
			};
		}

		function updateDialog(data) {
			console.debug('updateDialog.0');
			console.debug(data);

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
			console.debug('updateDialog.1');

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
				command: 'updateModel',
				data: data
			});
		};

		$.when($.ready).then(function() {
			$("input").bind("change", function(e) {
				updateModel();
			});

			$('#btn-ok').click(function(e) {
				start();
			});

			vscode.postMessage({
				command: 'ready'
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

function field(id: string, label: string): string {
	return `
	<div class="row">
		<div class="col">
			<div class="input-group input-group-sm">
				<label for="txt${id}">${localize("tdsreplay.webview." + id.toLowerCase(), label)}</label> 
				<input id="txt${id}" type="text" class="form-control text-left">
			</div>
		</div>
	</div>
`;
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
	${field("SmartClientFilename", "SmartClient (ini)")}
	${field("Parameters", "Parâmetros")}
	${field("StartProgram", "Programa inicial")}
	${field("ProgramParameters", "Parâmetros do programa (-A)")}
	${field("Driver", "Comunicação no cliente")}
	${field("Environment", "Ambiente")}
	`;
}

function recordParameters() {
	return `
	${field("ParametersFilename", "Arquivo de parâmetros")}
	${field("Alias", "Apelido")}
	${field("Description", "Descrição")}
	${field("RecordFilename", "Arquivo de gravação")}
	${field("Includes", "Lista de inclusão")}
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
