import {ComponentMethod, ComponentMethodData, Constructor} from "../types/Types.js";
import {getCurrentClassDecoratorData} from "./Component";

/**
 * Decorator to add metadata to a component
 *
 * @param key  key that will be used to store the metadata
 * @param data data that will be stored
 * @constructor
 */
export function Metadata(key: string, data: any) {
    return function (target: ComponentMethod, context: ClassMethodDecoratorContext | ClassDecoratorContext) {
        if(context.kind == "method") {
            invokeAsMethodDecorator(key, data, context as ClassMethodDecoratorContext) ;
            return;
        }

        invokeAsClassDecorator(key, data, context as ClassDecoratorContext);
    }
}

function invokeAsMethodDecorator( key: string, data: any, context: ClassMethodDecoratorContext) {
    context.addInitializer(function () {
        if (this["_componentMethods"] == undefined) {
            this["_componentMethods"] = [];
        }

        const methodData = (this["_componentMethods"] as ComponentMethodData[])
            .find(x => x.methodName == context.name);

        if(!methodData) {
            const newMethodData = {methodName: context.name as string, metadata: {}};
            newMethodData.metadata[key] = data;
            (this["_componentMethods"] as ComponentMethodData[]).push(newMethodData);
            return;
        }

        if(methodData.metadata.hasOwnProperty(key)) {
            throw Error("Metadata with key " + key + " already exists on component " + (context.name as string));
        }

        methodData.metadata[key] = data;
    })
}

function invokeAsClassDecorator(key: string, data: any, context: ClassDecoratorContext) {

    const _currentData = getCurrentClassDecoratorData();
    if(!_currentData.metadata) {
        _currentData.metadata = {};
    }

    if(_currentData.metadata.hasOwnProperty(key)) {
        throw Error("Metadata with key " + key + " already exists on component " + (context.name as string));
    }

    _currentData.metadata[key] = data;

}



