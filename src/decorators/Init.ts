export function Init() {
    return function (target: any, context: ClassFieldDecoratorContext) {
        context.addInitializer( function () {
            this["_initializerMethod"] = context.name;
        })
    }
}


