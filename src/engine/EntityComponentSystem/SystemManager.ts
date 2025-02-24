import { System, SystemType } from './System';
import { Scene } from '../Scene';
import { World } from './World';
import { removeItemFromArray } from '../Util/Util';

export interface SystemCtor<T extends System> {
  new (...args: any[]): T;
}

/**
 * The SystemManager is responsible for keeping track of all systems in a scene.
 * Systems are scene specific
 */
export class SystemManager<ContextType> {
  /**
   * List of systems, to add a new system call [[SystemManager.addSystem]]
   */
  public systems: System<any, ContextType>[] = [];
  public _keyToSystem: { [key: string]: System<any, ContextType> };
  public initialized = false;
  constructor(private _world: World<ContextType>) {}

  /**
   * Get a system registered in the manager by type
   * @param systemType
   */
  public get<T extends System>(systemType: SystemCtor<T>): T | null {
    return this.systems.find((s) => s instanceof systemType) as unknown as T;
  }

  /**
   * Adds a system to the manager, it will now be updated every frame
   * @param system
   */
  public addSystem(system: System<any, ContextType>): void {
    // validate system has types
    if (!system.types || system.types.length === 0) {
      throw new Error(`Attempted to add a System without any types`);
    }

    const query = this._world.queryManager.createQuery(system.types);
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
    query.register(system);
    // If systems are added and the manager has already been init'd
    // then immediately init the system
    if (this.initialized && system.initialize) {
      system.initialize(this._world.context);
    }
  }

  /**
   * Removes a system from the manager, it will no longer be updated
   * @param system
   */
  public removeSystem(system: System<any, ContextType>) {
    removeItemFromArray(system, this.systems);
    const query = this._world.queryManager.getQuery(system.types);
    if (query) {
      query.unregister(system);
      this._world.queryManager.maybeRemoveQuery(query);
    }
  }

  /**
   * Initialize all systems in the manager
   *
   * Systems added after initialize() will be initialized on add
   */
  public initialize() {
    if (!this.initialized) {
      this.initialized = true;
      for (const s of this.systems) {
        if (s.initialize) {
          s.initialize(this._world.context);
        }
      }
    }
  }

  /**
   * Updates all systems
   * @param type whether this is an update or draw system
   * @param context context reference
   * @param delta time in milliseconds
   */
  public updateSystems(type: SystemType, context: ContextType, delta: number) {
    const systems = this.systems.filter((s) => s.systemType === type);
    for (const s of systems) {
      if (s.preupdate) {
        s.preupdate(context, delta);
      }
    }

    for (const s of systems) {
      // Get entities that match the system types, pre-sort
      const entities = this._world.queryManager.getQuery(s.types).getEntities(s.sort);
      // Initialize entities if needed
      if (context instanceof Scene) {
        for (const entity of entities) {
          entity._initialize(context?.engine);
        }
      }
      s.update(entities, delta);
    }

    for (const s of systems) {
      if (s.postupdate) {
        s.postupdate(context, delta);
      }
    }
  }

  public clear(): void {
    for (let i = this.systems.length - 1; i >= 0; i--) {
      this.removeSystem(this.systems[i]);
    }
  }
}
