import {EdgeWeight, NodeId, Serialized} from "graph-data-structure";
import {DependencyContainer} from "../DependencyContainer.js";


export type Dependency = {
    instance?: DependencyInstance;
    name: string
    tags: string[]
}

export type ParameterizedDependency = Dependency & {
    method: (...params: any) => any
    parameters: InjectableParameters,
}

export type DependencyInstance = {
    _dependencyBindDataList?: PropertyBindData[],
    _initializerMethod?: string
};

export type instantiatedList = {_componentMethods?: ComponentMethodData[]}

export type Constructor = new() => instantiatedList | any;

export type ComponentMethod = (...any) => any
export type InjectableParameters = (string | MethodInjectionData) []
export type ComponentMethodData = {
    methodName: string,
    name?: string,
    injectableParameters?: InjectableParameters
    tags?: string[]
    list?: string
    configuration?: boolean
    initializationMethod?: string,
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

export type EventHandler = (container: DependencyContainer) => void;


export type nodeGraph = {
    addNode: (node: NodeId) => any;
    removeNode: (node: NodeId) => any;
    nodes: () => NodeId[];
    adjacent: (node: NodeId) => NodeId[];
    addEdge: (u: NodeId, v: NodeId, weight?: EdgeWeight) => any;
    removeEdge: (u: NodeId, v: NodeId) => any;
    hasEdge: (u: NodeId, v: NodeId) => boolean;
    setEdgeWeight: (u: NodeId, v: NodeId, weight: EdgeWeight) => any;
    getEdgeWeight: (u: NodeId, v: NodeId) => EdgeWeight;
    indegree: (node: NodeId) => number;
    outdegree: (node: NodeId) => number;
    depthFirstSearch: (sourceNodes?: NodeId[], includeSourceNodes?: boolean, errorOnCycle?: boolean) => string[];
    hasCycle: () => boolean;
    lowestCommonAncestors: (node1: NodeId, node2: NodeId) => string[];
    topologicalSort: (sourceNodes?: NodeId[], includeSourceNodes?: boolean) => string[];
    shortestPath: (source: NodeId, destination: NodeId) => string[] & {
        weight?: number | undefined;
    };
    shortestPaths: (source: NodeId, destination: NodeId) => (string[] & {
        weight?: number | undefined;
    })[];
    serialize: () => Serialized;
    deserialize: (serialized: Serialized) => any;
}

