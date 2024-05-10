import {ComponentMethod, ComponentMethodData} from "../types/Types";

/**
 * Decorator to add tags to a component.
 *
 * @param tags
 * @constructor
 */
export function Tagged(...tags: string[]) {
    return function (target: ComponentMethod, context: ClassMethodDecoratorContext) {
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
}



