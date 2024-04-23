import {
    ComponentMethod,
    ComponentMethodData,
    PropertyBindData,
    DependencyType, InjectableParameters,
    MethodInjectionData
} from "../types/Types";

/**
 * Decorator to decorate a Method as a component method.
 * Methods decorated need to return any kind of object.
 * Said object will be registered as a component
 *
 * @param name Optional, Will be used to set a specific name to register this Component with. Will use method name if not set.
 * @param groups Optional, String array containing names this component can be grouped by.
 **
 */
export function Parameters(parameters: InjectableParameters) {

    return function (target: ComponentMethod, context: ClassMethodDecoratorContext) {

        context.addInitializer(function () {
            if (this["_componentMethods"] == undefined) {
                this["_componentMethods"] = [];
            }

            const methodData = this["_componentMethods"].find((x:ComponentMethodData) => x.methodName == context.name);

            if(!methodData) {
                (this["_componentMethods"] as ComponentMethodData[]).push({
                    methodName: context.name as string,
                    injectableParameters: parameters,
                });
                return;
            }

            methodData.groinjectableParametersups = parameters;
        })


    }
}



