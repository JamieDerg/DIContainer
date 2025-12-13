import {
    ComponentMethodData,
    Constructor,
    Dependency,
    DependencyInstance,
    DependencyType,
    EventHandler,
    instantiatedList,
    MethodInjectionData,
    nodeGraph,
    PropertyBindData
} from "./types/Types";

import {Graph} from "graph-data-structure";
import {globSync} from "glob";
import {getCurrentClassDecoratorData, resetClassDecoratorData} from "./decorators";

type ScannedDependencyData = {
    name: string,
    tags: string[]
    constructor: Constructor;
}
/**
 *  Singleton DependencyContainer class
 */
export class DependencyContainer {
    private container: Dependency[]
    private configurations: Constructor[];
    private instantiatedDependencyList: { name: string, instance: any }[];

    private dependencyMethods: ComponentMethodData[];
    static instance: DependencyContainer;

    private dependencyMethodGraph: nodeGraph;
    private dependencyInjectionGraph: nodeGraph;

    private idLength: number = 10;
    private readonly scanPaths: string[]

    private onInitEventHandler: EventHandler;
    private scanDependencies: ScannedDependencyData[]

    /**
     *  Creates the DI Container instance, can only be instanciated once
     * @throws Error if the Instance has already been instanciated
     */
    public static createInstance() {
        if (this.instance != undefined) {
            throw new Error("The Container has already been created!")
        }
        this.instance = new DependencyContainer();
        return this.instance;

    }

    /**
     *  Will register given registration classes
     * @param configurations
     */

    public addConfigurations(...configurations: Constructor[]) {
        this.configurations.push(...configurations);
    }

    /**
     *  Will use given path so scan for decorated components.
     * @param paths a list of paths to use for scanning
     */
    public addComponentScanPaths(...paths: string[]) {
        this.scanPaths.push(...paths);
    }

    /**
     * Will fire once the container and all the dependencies have been initialized
     */
    public onInitFinished(eventHandler: EventHandler){
        this.onInitEventHandler = eventHandler;
    }

    /**
     * Will initialize and populate Dependencies
     */
    public async initializeContainer(): Promise<void> {

        this.initializeConfigs();
        await this.initializeDependencyScanPaths();
        this.populateGraphEdges();
        this.instanciateDependencies();
        this.populateProperties();

        this.dependenciesWithInitializerMethod.forEach(entry => {
            entry.instance[entry.instance._initializerMethod]();
        })

        if(this.onInitEventHandler){
            this.onInitEventHandler(this);
        }
    }

    private initializeConfigs() {
        this.configurations.forEach(list => {
            const instanciatedList: instantiatedList = new list()
            let tries = 0;

            const name = this.makeid();
            

            this.instantiatedDependencyList.push({
                name: name,
                instance: instanciatedList
            });

            //no need to add an empty list
            if (instanciatedList._componentMethods == undefined) {
                return;
            }

            instanciatedList._componentMethods.forEach(data => {
                data.list = name;
                this.dependencyMethods.push(data);
                this.dependencyMethodGraph.addNode(data.name);
            })
        })
    }

    private async initializeDependencyScanPaths() {
        for (const scanPath of this.scanPaths) {
            const result = globSync( scanPath, {absolute: true});
            for (const file of result) {
                await import("file://" + file);

                const data = getCurrentClassDecoratorData();

                if(data.name == undefined) {
                    continue;
                }

                this.dependencyMethodGraph.addNode(data.name);
                this.scanDependencies.push({
                    name: data.name,
                    tags: data.tags,
                    constructor: data.constructor
                });
                resetClassDecoratorData();
            }
        }
    }
    private populateGraphEdges() {
        this.dependencyMethods.forEach(entry => {
            if(entry.injectableParameters != undefined) {
                entry.injectableParameters.forEach(parameter => {
                    const dependencyName = typeof parameter == "string" ? parameter :
                        (parameter as MethodInjectionData).name
                    this.dependencyMethodGraph.addEdge(dependencyName, entry.name);
                })
            }

            if(entry.tags != undefined && entry.tags.length > 0) {
                entry.tags.forEach(tag => {
                    this.dependencyMethodGraph.addEdge(tag, entry.name)
                })
            }

        })

        this.scanDependencies.forEach(entry => {
            if(entry.tags != undefined && entry.tags.length > 0) {
                entry.tags.forEach(tag => {
                    this.dependencyMethodGraph.addEdge(tag, entry.name);
                })
            }
        })
    }

    private instanciateDependencies() {
        let dependencyMethods = this.dependencyMethodGraph.topologicalSort();

        dependencyMethods.forEach(dependencyMethod => {
            let componentMethod = this.dependencyMethods.find(x => x.name == dependencyMethod);
            let scanEntry = this.scanDependencies.find(x => x.name == dependencyMethod);

            if(componentMethod == undefined && scanEntry == undefined) {
                return;
            }

            if(componentMethod != undefined) {
                this.instanciateComponentMethodEntry(componentMethod);
                return;
            }

            const instance = new scanEntry.constructor();
            this.addDependency(instance, scanEntry.name, scanEntry.tags);
        })

    }

    private instanciateComponentMethodEntry(componentMethod: ComponentMethodData,) {
        let list = this.instantiatedDependencyList.find(x => x.name == componentMethod.list);

        if(componentMethod.injectableParameters != undefined && componentMethod.injectableParameters.length > 0) {
            this.instantiateParameterizedMethod(componentMethod,list.instance);
            return;
        }

        const instance = list.instance[componentMethod.methodName]() as any;
        if(Array.isArray(instance)) {
            (instance as []).forEach(entry => this.addDependency(entry, this.generateGroupDependencyID(), [componentMethod.name]));
            return;
        }

        this.addDependency(instance, componentMethod.name, componentMethod.tags);
    }


    private generateGroupDependencyID() {
        let id = this.makeid();
        let tries = 0;

        while(this.getDependencyInternal(id)) {
           id = this.makeid();

           if(tries >= 10 ) {
               throw new Error("Could not generate a valid ID!");
           }

        }

        return id;
    }

    private populateProperties() {
        this.dependenciesWithBindData.forEach(entry => {
                const {instance} = entry;
                instance._dependencyBindDataList.forEach(bindData =>  this.bindDependencyToProperty(bindData, instance));
        });
    }
    private instantiateParameterizedMethod(componentMethod: ComponentMethodData, listInstance: any) {
        const parameters = componentMethod.injectableParameters.map(parameter => {
            if(typeof parameter === "string" ) {
                return this.getDependency(parameter);
            }

            const {type, name} = (parameter as MethodInjectionData);
            return  (type == DependencyType.LIST ? this.getDependencies(name) : this.getDependency(name));
        })

        const instance = listInstance[componentMethod.methodName](...parameters) as any;

        if(Array.isArray(instance)) {
            (instance as []).forEach(entry => this.addDependency(entry, this.generateGroupDependencyID(), [componentMethod.name]));
            return;
        }

        this.addDependency(instance, componentMethod.name, componentMethod.tags);

    }

    private makeid() {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < this.idLength) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    private bindDependencyToProperty(dependency: PropertyBindData, instance: DependencyInstance) {
        if (dependency.type == DependencyType.SINGULAR) {
            instance[dependency.property] = this.getDependency(dependency.target);
            dependency.bound = true;
            this.dependencyInjectionGraph.addEdge(dependency.target, dependency.property)
            return;

        }

        instance[dependency.property] = this.getDependencies(dependency.target);
        this.dependencyMethodGraph.addEdge(dependency.target, dependency.property);
    }


    /**
     * adds a new Dependency
     * @param instance the object to be added
     * @param name the name it will be registered with
     * @throws Error if a dependency under given name alreay exists
     */
    public addDependency(instance: any, name: string, tags: string[] = []) {

        if (this.container.find(x => x.name == name)) {
            throw new Error("This Dependency has already Been Added!");
        }
        const dependency = {instance, name, tags: tags}
        this.container.push(dependency);
        return dependency;
    }

    /**
     * retrieves a dependency from the container
     * @param name name of the dependency
     * @throws Error if a dependency under given name doesent exists
     */
    public getDependency(name: string): any {
        const dependency = this.getDependencyInternal(name);
        if (!dependency) {
            throw new Error(`No dependency with name: ${name} found!`);
        }

        return dependency.instance;
    }

    private getDependencyInternal(name: string): Dependency {
        return this.container.find(x => x.name == name);
    }

    public getDependencies(group: string): any[] {
        const dependencies = this.container.filter(x => x.tags.find(y => y == group));
        if (dependencies.length == 0) {
            return []
        }
        return dependencies.map(dependency => dependency.instance);
    }

    private get dependenciesWithBindData() {
        return this.container.filter(x => x.instance?._dependencyBindDataList != undefined && x.instance?._dependencyBindDataList.length > 0)
    }

    private get dependenciesWithInitializerMethod() {
        return this.container.filter(x => x.instance?._initializerMethod != undefined)
    }


    private constructor() {
        this.configurations = [];
        this.container = [];
        this.instantiatedDependencyList = [];
        this.dependencyMethods = [];
        this.scanPaths = []
        this.scanDependencies = []
        this.dependencyMethodGraph = Graph();
        this.dependencyInjectionGraph = Graph();
    }


}


