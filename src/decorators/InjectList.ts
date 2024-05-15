import {PropertyBindData, DependencyType} from "../types/Types.js";

/**
 * Class Property Decorator, will inject all dependencies of the given type in form of an array
 * Class has to be registered as a dependency for this to take effect
 *
 * @param tag of the Dependency to inject
 */
export function InjectList(tag: string) {
    console.log("inject")
    return function (target: any[], context: ClassFieldDecoratorContext) {
        return function (this: any) {
            if (this["_dependencyBindDataList"] == undefined) {
                this["_dependencyBindDataList"] = [];
            }

            (this["_dependencyBindDataList"] as PropertyBindData[]).push({
                property: context.name as string,
                target: tag,
                type: DependencyType.LIST
            });
        }
    }

}