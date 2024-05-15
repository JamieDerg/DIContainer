import {ComponentMethod, ComponentMethodData, Constructor} from "../types/Types.js";
import {getCurrentClassDecoratorData} from "./Component";

/**
 * Decorator to add tags to a component.
 *
 * @param tags
 * @constructor
 */
export function Tagged(...tags: string[]) {
    return function (target: ComponentMethod, context: ClassMethodDecoratorContext) {
        if(context.kind == "method") {
            invokeAsMethodDecorator(tags, context);
            return;
        }

        invokeAsClassDecorator(tags);
    }
}

function invokeAsMethodDecorator( tags: string[], context: ClassMethodDecoratorContext) {
    context.addInitializer(function () {
        if (this["_componentMethods"] == undefined) {
            this["_componentMethods"] = [];
        }

        const methodData = (this["_componentMethods"] as ComponentMethodData[])
            .find(x => x.methodName == context.name);

        if(!methodData) {
            (this["_componentMethods"] as ComponentMethodData[]).push({
                methodName: context.name as string,
                tags: tags
            });
            return;
        }

        methodData.tags.push(...tags);
    })
}

function invokeAsClassDecorator(tags: string[]) {

    const _currentData = getCurrentClassDecoratorData();
    if(!_currentData.tags) {
        _currentData.tags = [];
    }
    _currentData.tags.push(...tags);
}



