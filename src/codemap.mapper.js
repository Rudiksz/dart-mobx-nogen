"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");

class Mapper {

    static readAllLines(file) {
        let text = fs.readFileSync(file, 'utf8');
        return text.split(/\r?\n/g);
    }

    static generate(file) {
        let classes = [];
        let observables = [];
        let computeds = [];
        let actions = [];
        try {
            let sourceCodeArr = Mapper.readAllLines(file); 
            let startString = "(//@observable)|(//@computed)|(//@action)";
            for (let line = 0; line < sourceCodeArr.length; line++) {
                
                if (sourceCodeArr[line].match("(class)")) {
                    // Push any previous fields to the stack
                    if (observables.length > 0) {
                        classes.push(`  Observables|0|interface`);
                        classes.push(...observables);
                    }
                    if (computeds.length > 0) {
                        classes.push(`  Computeds|0|interface`);
                        classes.push(...computeds);
                    }
                    if (actions.length > 0) {
                        classes.push(`  Actions|0|interface`);
                        classes.push(...actions);
                    }

                    // Push the new class to the class and reset the fields
                    let className = sourceCodeArr[line].replace('class ', '').replace(RegExp('\{.*'), '');
                    classes.push(`${className}|${line}|class`);

                    observables = [];
                    computeds = [];
                    actions = [];
                }

                let match = sourceCodeArr[line].match(startString);
                if (match !== null && match.index !== undefined) {
                    let nextLine = sourceCodeArr[line+1];
                    if (nextLine.match('(=>)|=')?.index === undefined) {
                        return;
                    }
                    let pieces = nextLine.split(RegExp('(=>)|='));

                    let name = pieces[0].replace(' get ', ' ').trim();
        
                    if (match[0] === '//@observable') {
                        observables.push(`    ${name}|${line+2}|property`);
                    } else if (match[0] === '//@computed') {
                        computeds.push(`    ${name}|${line+2}|property`);
                    } else if (match[0] === '//@action') {
                        actions.push(`    ${name}|${line+2}|function`);
                    }
                }
            }
        }
        catch (error) {
        }

        // Push the last fields to the stack
        if (observables.length > 0) {
            classes.push(`  Observables|0|interface`);
            classes.push(...observables);
        }
        if (computeds.length > 0) {
            classes.push(`  Computeds|0|interface`);
            classes.push(...computeds);
        }
        if (actions.length > 0) {
            classes.push(`  Actions|0|interface`);
            classes.push(...actions);
        }

        return classes;
    }
}
exports.mapper = Mapper;