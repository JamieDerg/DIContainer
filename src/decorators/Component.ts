import {
    ComponentMethod,
    ComponentMethodData,
    PropertyBindData,
    DependencyType, InjectableParameters,
    MethodInjectionData, Constructor
} from "../types/Types";

/**
 * Decorator to decorate a Method as a component method.
 * Methods decorated need to return any kind of object.
 * Said object will be registered as a component
 *
 * @param name Optional, Will be used to set a specific name to register this Component with. Will use method name if not set.
 * @param tags Optional, String array containing tags this component can be tagged by.
 **
 */

const _currentData = {
    name: undefined,
    tags: undefined,
    constructor: undefined,
    initializerMethodName: undefined,
    metadata: undefined,
};

export function Component<targetType = ComponentMethod | Constructor>(name = "", tags: string[]): (target: targetType, context: ClassMethodDecoratorContext | ClassDecoratorContext) => void {
    return function (target: targetType, context: ClassMethodDecoratorContext | ClassDecoratorContext) {
        if(context.kind == "method") {
            invokeAsMethodDecorator(name, tags, context);
            return;
        }

        invokeAsClassDecorator(name, tags, target as Constructor, context);
    }
}

function invokeAsMethodDecorator(name: string, tags: string[], context: ClassMethodDecoratorContext) {
    if (name == "") {
        name = context.name as string;
    }

    context.addInitializer(function () {
        if (this["_componentMethods"] == undefined) {
            this["_componentMethods"] = [];
        }

        const methodData = (this["_componentMethods"] as ComponentMethodData[])
            .find(x => x.methodName == context.name);

        if(!methodData) {
            (this["_componentMethods"] as ComponentMethodData[]).push({
                methodName: context.name as string,
                name: name,
                tags: tags,

            });
            return;
        }

        methodData.name = name;
        methodData.tags.push(...tags)
    })


}



export function getCurrentClassDecoratorData() {
    return _currentData;
}

export function resetClassDecoratorData() {
    _currentData.name = undefined;
    _currentData.tags = undefined
    _currentData.constructor = undefined;
    _currentData.initializerMethodName = undefined;
}

function invokeAsClassDecorator(name: string, tags: string[], target: Constructor, context: ClassDecoratorContext) {
    if (name == "") {
        name = context.name as string;
    }

    if(!_currentData.tags) {
        _currentData.tags = [];
    }

    if(!_currentData.metadata) {
        _currentData.metadata = {};
    }

    _currentData.name = name;
    _currentData.tags.push(...tags);
    _currentData.constructor = target;
}




