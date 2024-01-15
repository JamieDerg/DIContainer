

export type Dependency = {
    instance?: DependencyInstance;
    name: string
    groups: string[]
    hasMissingDependencies?: boolean
}

export type ParameterizedDependency = Dependency & {
    method: (...params: any) => any
    parameters: InjectableParameters,
}

export type DependencyInstance = { _dependencyBindDataList: PropertyBindData[] };

export type instantiatedList = {_componentMethods?: ComponentMethodData[]}

export type Constructor = new() => instantiatedList | any;

export type ComponentMethod = (...any) => any
export type InjectableParameters = (string | MethodInjectionData) []
export type ComponentMethodData = {
    methodName: string,
    name: string,
    injectableParameters: InjectableParameters
    groups: string[]
}

export type MethodInjectionData = {
    name: string,
    type: DependencyType
}

export type PropertyBindData = {
    property: string,
    target: string
    type: DependencyType
    missing?: boolean
    bound?: boolean
}

export enum DependencyType {
    SINGULAR,
    LIST,
}