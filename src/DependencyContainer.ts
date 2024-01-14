
import {ComponentMethodData, Constructor, Dependency, instantiatedList} from "./types/Types";

/**
 *  Singleton DependencyContainer class
 */
export class DependencyContainer {
    private container: Dependency[]
    private dependencyLists: Constructor[];
    static instance: DependencyContainer;

    /**
     *  Creates the DI Container instance, can only be instanciated once
     * @param dependencyLists a List of Class Constructors containing Components to be added
     * @throws Error if the Instance has already been instanciated
     */
    public static createInstance(dependencyLists: Constructor[]) {
        if(this.instance != undefined) {
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
            if(instanciatedList._componentMethods == undefined) {
                return;
            }

            const componentMethodData = instanciatedList._componentMethods;
            this.addComponentsFromList(componentMethodData, instanciatedList);
        });

        this.populateDependencies();
    }


    private addComponentsFromList(componentMethodDataList: ComponentMethodData[], list: instantiatedList) {
        componentMethodDataList.forEach(methodData => {
            const componentInstance = list[methodData.methodName]() as Dependency;
            this.addDependency(componentInstance, methodData.name);
        })
    }

    private populateDependencies() {
        this.container.forEach(entry => {
            const {instance} = entry
            instance._dependencies
                .forEach(dependency => instance[dependency.property] = this.getDependency(dependency.target));
        })
    }
    /**
     * adds a new Dependency
     * @param instance the object to be added
     * @param name the name it will be registered with
     * @throws Error if a dependency under given name alreay exists
     */
    public addDependency(instance: any, name: string) {

        if(this.container.find(x => x.name == name)) {
            throw new Error("This Dependency has already Been Added!");
        }

        this.container.push({instance, name});
    }

    /**
     * retrieves a dependency from the container
     * @param name name of the dependency
     * @throws Error if a dependency under given name doesent exists
     */
    public getDependency( name: string): any {
        const dependency = this.container.find(x => x.name == name);
        if(!dependency) {
            throw new Error(`No dependency with name: ${name} found!`);
        }

        return dependency.instance;
    }

    private constructor(dependencyLists: Constructor[]) {
        this.dependencyLists = dependencyLists;
        this.container = [];
    }


}


