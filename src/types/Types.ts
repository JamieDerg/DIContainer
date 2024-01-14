

export type Dependency = {
    instance?: { _dependencies: DependencyData[] };
    name: string
}

export type instantiatedList = {_componentMethods?: ComponentMethodData[]}

export type Constructor = new() => instantiatedList | any;

export type ComponentMethod = () => any
export type ComponentMethodData = {
    methodName: string,
    name: string
    groups: string[]
}

export type DependencyData = {
    property: string,
    target: string
}