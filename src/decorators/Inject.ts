import {PropertyBindData, DependencyType, MethodInjectionData} from "../types/Types.js";

/**
 * Class Property Decorator, will inject the given Dependency in decorate property
 * Class has to be registered as a dependency for this to take effect
 *
 * @param name of the Dependency to inject
 */
export function Inject(name: string) {
    return function (target: any, context: ClassFieldDecoratorContext) {
        return function (this: any): any {
            if (this["_dependencyBindDataList"] == undefined) {
                this["_dependencyBindDataList"] = [];
            }
            (this["_dependencyBindDataList"] as PropertyBindData[]).push({
                property: context.name as string,
                target: name,
                type: DependencyType.SINGULAR
            });
        }
    }
}

