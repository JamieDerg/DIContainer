import {DependencyData} from "../types/Types";

/**
 * Class Property Decorator, will inject the given Dependency in decorate property
 * Class has to be registered as a dependency for this to take effect
 *
 * @param name of the Dependency to inject
 */
export function Inject(name: string) {
    console.log("inject")
    return function (target: any, context: ClassFieldDecoratorContext) {
        context.addInitializer(function () {
            if (this["_dependencies"] == undefined) {
                this["_dependencies"] = [];
            }

            (this["_dependencies"] as DependencyData[]).push({
                property: context.name as string,
                target: name
            });
        })
    }

}