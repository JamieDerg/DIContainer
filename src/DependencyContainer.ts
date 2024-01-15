import {
    ComponentMethodData,
    Constructor,
    Dependency,
    DependencyInstance,
    DependencyType,
    InjectableParameters,
    instantiatedList,
    MethodInjectionData, ParameterizedDependency,
    PropertyBindData
} from "./types/Types";

/**
 *  Singleton DependencyContainer class
 */
export class DependencyContainer {
    private container: Dependency[]
    private dependencyLists: Constructor[];
    private methodsWithParameters: ParameterizedDependency[]
    static instance: DependencyContainer;

    /**
     *  Creates the DI Container instance, can only be instanciated once
     * @param dependencyLists a List of Class Constructors containing Components to be added
     * @throws Error if the Instance has already been instanciated
     */
    public static createInstance(dependencyLists: Constructor[]) {
        if (this.instance != undefined) {
            throw new Error("The Container has already been created!")
        }
        this.instance = new DependencyContainer(dependencyLists);
        return this.instance;
    }

    /**
     * Will initialize and populate Dependencies
     */
    public initializeContainer(): void {
        this.dependencyLists.forEach(list => {
            const instanciatedList: instantiatedList = new list();

            //no need to add an empty list
            if (instanciatedList._componentMethods == undefined) {
                return;
            }

            const componentMethodData = instanciatedList._componentMethods;
            this.addComponentsFromList(componentMethodData, instanciatedList);
        });

        this.populateInitialDependencies();
        this.addComponentsFromLateMethods();
        this.tryPopulatingMissingDependencies();

    }


    private addComponentsFromList(componentMethodDataList: ComponentMethodData[], list: instantiatedList) {
        componentMethodDataList.forEach(methodData => {

            if (methodData.injectableParameters.length != 0) {
                this.methodsWithParameters.push({
                    method: list[methodData.methodName],
                    parameters: methodData.injectableParameters,
                    name: methodData.name,
                    groups: methodData.groups
                })
                return;
            }

            const componentInstance = list[methodData.methodName]() as DependencyInstance;
            this.addDependency(componentInstance, methodData.name, methodData.groups);
        })
    }

    private populateInitialDependencies() {
        this.container.forEach(entry => this.populateDependency(entry))
    }

    private tryPopulatingMissingDependencies() {
        const dependencies = this.container.filter(x => x.hasMissingDependencies);
        dependencies.forEach(entry => this.populateDependency(entry, false));
    }

    private addComponentsFromLateMethods() {
        this.methodsWithParameters.forEach(entry =>  {

            const parameters = entry.parameters.map(parameter => {
                if(typeof parameter === "string" ) {
                    return this.getDependency(parameter);
                }

                const {type, name} = (parameter as MethodInjectionData);
                return  (type == DependencyType.LIST ? this.getDependencies(name) : this.getDependency(name));
            })

            const componentInstance = entry.method(...parameters) as DependencyInstance;
            componentInstance._dependencyBindDataList.forEach( property => {
                property.missing = true;
            })

            this.addDependency(componentInstance, entry.name, entry.groups, true);


        })


    }

    private populateDependency(entry: Dependency, allowMissing: boolean = true) {

        const {instance} = entry

        if (!instance._dependencyBindDataList) {
            return;
        }

        instance._dependencyBindDataList.forEach(dependency => {
                this.bindDependencyToProperty(dependency, instance, entry, allowMissing);
        });
    }

    private bindDependencyToProperty(dependency: PropertyBindData, instance: DependencyInstance, sourceDependencyEntry: Dependency, allowMissing: boolean) {
        if(allowMissing) {
            this.bindDependencyToPropertyAllowingMissingDependencies(dependency, instance, sourceDependencyEntry);
            return;
        }

        this.bindDependencyToPropertyDisallowingMissingDependencies(dependency, instance, sourceDependencyEntry);
    }

    private bindDependencyToPropertyAllowingMissingDependencies(dependency: PropertyBindData, instance: DependencyInstance, sourceDependencyEntry: Dependency,) {
        if (dependency.type == DependencyType.SINGULAR) {
            try{
                instance[dependency.property] = this.getDependency(dependency.target);
                dependency.bound = true;
            }
            catch(error: any) {
                dependency.missing = true;
                sourceDependencyEntry.hasMissingDependencies = true;
            }
        }

        try{
            instance[dependency.property] = this.getDependencies(dependency.target);
            dependency.bound = true;
        }
        catch(error: any) {
            dependency.missing = true;
            sourceDependencyEntry.hasMissingDependencies = true;
        }
    }

    private bindDependencyToPropertyDisallowingMissingDependencies(dependency: PropertyBindData, instance: DependencyInstance, sourceDependencyEntry: Dependency,) {
        if (dependency.type == DependencyType.SINGULAR) {
            instance[dependency.property] = this.getDependency(dependency.target);
            dependency.bound = true;
            return;

        }

        instance[dependency.property] = this.getDependencies(dependency.target);
        dependency.bound = true;
    }

    /**
     * adds a new Dependency
     * @param instance the object to be added
     * @param name the name it will be registered with
     * @throws Error if a dependency under given name alreay exists
     */
    public addDependency(instance: any, name: string, groups: string[] = [], hasMissingDependencies: boolean = false) {

        if (this.container.find(x => x.name == name)) {
            throw new Error("This Dependency has already Been Added!");
        }

        this.container.push({instance, name, groups, hasMissingDependencies});
    }

    /**
     * retrieves a dependency from the container
     * @param name name of the dependency
     * @throws Error if a dependency under given name doesent exists
     */
    public getDependency(name: string): any {
        const dependency = this.container.find(x => x.name == name);
        if (!dependency) {
            throw new Error(`No dependency with name: ${name} found!`);
        }

        return dependency.instance;
    }

    public getDependencies(group: string): any[] {
        const dependencies = this.container.filter(x => x.groups.find(y => y == group));
        if (dependencies.length == 0) {
            throw new Error(`No Dependencies off group ${group} could be found!`)
        }
        return dependencies.map(dependency => dependency.instance);
    }


    private constructor(dependencyLists: Constructor[]) {
        this.dependencyLists = dependencyLists;
        this.container = [];
        this.methodsWithParameters = [];
    }


}


