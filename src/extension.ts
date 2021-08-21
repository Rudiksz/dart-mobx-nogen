import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let activeFileFilters = [{ language: "dart", scheme: "file" }];
	context.subscriptions.push(vscode.languages.registerFoldingRangeProvider(activeFileFilters, new MobxFoldingProvider()));

	vscode.window.visibleTextEditors.forEach((vte) => RegionProvider.foldRegions(vte.document, false, false));

	context.subscriptions.push(vscode.commands.registerCommand('dart-mobx-nogen.toggleRegions', () => RegionProvider.foldRegions()));
	context.subscriptions.push(vscode.commands.registerCommand('dart-mobx-nogen.toggleActiveRegion', () => RegionProvider.foldRegions(undefined, true)));

	let lastDecorations = new Map<any, vscode.TextEditorDecorationType>();

	var timeout: NodeJS.Timer;
	function triggerLowlight(editor: vscode.TextEditor) {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			lastDecorations.get(editor.document.fileName)?.dispose();
			lastDecorations.set(editor.document.fileName, decorationLowlight("0.2"));
		}, 200);
	}

	if (vscode.window.activeTextEditor) {
		triggerLowlight(vscode.window.activeTextEditor);
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if(!editor) {
			return;
		}
		triggerLowlight(editor);
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		var activeEditor = vscode.window.activeTextEditor;
		if (activeEditor && event.document === activeEditor.document) {
			triggerLowlight(activeEditor);
		}
	}, null, context.subscriptions);

}

export function deactivate() { }

const decorationLowlight = function (opacity: string) : any {
	var editor = vscode.window.activeTextEditor;
	if(!editor){
		return;
	}
	if(!opacity){
		return;
	}

	let options: vscode.DecorationRenderOptions = {
		opacity: opacity,
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
	};

	let decoration = vscode.window.createTextEditorDecorationType(options);
	
	let ranges = new Array<vscode.DecorationOptions>();

	let startString = "(//@observable)|(//@computed)|(//@action)";

	let sourceCode = editor.document.getText();
	const sourceCodeArr = sourceCode.split('\n');
	for (let line = 0; line < sourceCodeArr.length; line++) {
		
		let match = sourceCodeArr[line].match(startString);

		if (match !== null && match.index !== undefined) {
			let nextLine = sourceCodeArr[line+1];
			if (nextLine.match('(=>)|=')?.index === undefined) {
				return;
			}
			let pieces = nextLine.split(RegExp('(=>)|='));
			let linePos = sourceCodeArr.slice(0, line+1).join().length;

			let startPos = editor.document.positionAt(linePos + pieces[0].length);
			let endPos = editor.document.positionAt(linePos + nextLine.length);
			let range: vscode.DecorationOptions = { 
				range: new vscode.Range(startPos, endPos)
			};
			ranges.push(range);
		}
	}

	editor.setDecorations(decoration, ranges);
	return decoration;
};

import { CancellationToken, FoldingContext, FoldingRange, FoldingRangeKind, FoldingRangeProvider, TextDocument } from "vscode";

export class MobxFoldingProvider implements FoldingRangeProvider {
	constructor() { }

	public async provideFoldingRanges(document: TextDocument, context: FoldingContext, token: CancellationToken): Promise<FoldingRange[] | undefined> {
		if (token && token.isCancellationRequested) {return;}
		return RegionProvider.getRegions(document);
	}
}

export class RegionProvider {
	private static lastFoldStatus = new Map<any, boolean>();

	public static getRegions(document: vscode.TextDocument): vscode.FoldingRange[] {
		let sourceCode = document.getText();

		let startString = "(//@observable)|(//@computed)|(//@action)";
		let endString = "(//@-observable)|(//@-computed)|(//@-action)";

		let regions = new Array<vscode.FoldingRange>();
		const sourceCodeArr = sourceCode.split('\n');

		let rangeStart = undefined;
		for (let line = 0; line < sourceCodeArr.length; line++) {
			
			let match = sourceCodeArr[line].match(rangeStart === undefined ? startString : endString);

			if (match !== null && match.index !== undefined) {
				if (rangeStart === undefined) {
					rangeStart = line;
					continue;
				}

				let range = new vscode.FoldingRange(
					rangeStart+1,
					line
				);
				
				regions.push(range);			
				rangeStart = undefined;
			}
		}
		return regions;
	}

	public static async foldRegions(document?: vscode.TextDocument | undefined, onlyActive: boolean = false, toggle: boolean = true){
		document ??= vscode.window.activeTextEditor?.document;
		if (document === undefined) { return; }

		let cursorPosition = this.getTextEditor(document)?.selection.active.line;

		let regions = this.getRegions(document);
		let regionLines = [];
        for (const region of regions) {
			if (!onlyActive || (cursorPosition !== null && cursorPosition !== undefined && cursorPosition >= region.start && cursorPosition <= region.end)){
				regionLines.push(region.start);		
			}
		}

		if (regionLines.length === 0) {
			return;
		}

		let regionKey = document.fileName + (onlyActive ? ':' + regionLines[0] : '');
		let status = this.lastFoldStatus.get(regionKey) ?? true;
		if (toggle) {
			status = !status;
			this.lastFoldStatus.set(regionKey, status);
		}

		await vscode.commands.executeCommand(status ? 'editor.fold' : 'editor.unfold', {selectionLines: regionLines, levels: 0});
	}

    private static getTextEditor(document: vscode.TextDocument): vscode.TextEditor | null {
        for (let te of vscode.window.visibleTextEditors) {
            if (te.document.fileName === document.fileName) {
                return te;
            }
        }
        return null;
    }

}