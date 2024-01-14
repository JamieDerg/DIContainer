import {ComponentMethod, ComponentMethodData, DependencyData} from "../types/Types";

/**
 * Decorator to decorate a Method as a component method.
 * Methods decorated need to return any kind of object.
 * Said object will be registered as a component
 *
 * @param name Optional, Will be used to set a specific name to register this Component with. Will use method name if not set.
 * @param groups Optional, String array containing names this component can be grouped by.
 **
 */
export function Component(name = "", groups: string[] = []) {

    return function (target: ComponentMethod, context: ClassMethodDecoratorContext) {
        if (name == "") {
            name = context.name as string;
        }

        context.addInitializer(function () {
            if (this["_componentMethods"] == undefined) {
                this["_componentMethods"] = [];
            }

            (this["_componentMethods"] as ComponentMethodData[]).push({
                methodName: context.name as string,
                name,
                groups
            });
        })


    }
}


