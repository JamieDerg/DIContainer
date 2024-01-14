import {Constructor } from "./Types/Types";

/**
 *  Singleton DependencyContainer class
 */
export class DependencyContainer {
    /**
     *  Creates the DI Container instance, can only be instanciated once
     * @param dependencyLists a List of Class Constructors containing Components to be added
     * @throws Error if the Instance has already been instanciated
     */
    public static createInstance(dependencyLists: Constructor[]): DependencyContainer

    /**
     * Will initialize and populate Dependencies
     */
    public initializeContainer(): void

    /**
     * adds a new Dependency
     * @param instance the object to be added
     * @param name the name it will be registered with
     * @throws Error if a dependency under given name alreay exists
     */
    public addDependency(instance: any, name: string): void

    /**
     * retrieves a dependency from the container
     * @param name name of the dependency
     * @throws Error if a dependency under given name doesent exists
     */
    public getDependency( name: string): any

}
