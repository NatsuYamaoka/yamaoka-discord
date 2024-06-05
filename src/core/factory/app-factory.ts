import { Base } from "@abstracts/client/client.abstract";
import { ModuleAbstract } from "@abstracts/module/module.abstract";
import { AppFactoryOptions } from "@app/core/factory/app-factory.types";
import { logger } from "@app/core/logger/logger-client";

export class AppFactory extends Base {
  private module: typeof ModuleAbstract;

  constructor(options: AppFactoryOptions) {
    super(options.client);

    this.module = options.module;
  }

  public createApp() {
    this.initModule(this.module);

    return this;
  }

  private initModule(Module: typeof ModuleAbstract) {
    logger.log(`Initing ${Module.name}`);

    const moduleInstance = new Module(this.client);

    this.initModuleCommands(moduleInstance, Module.name);
    this.initModuleEvents(moduleInstance, Module.name);

    if (!moduleInstance.imports?.length) {
      return;
    }

    moduleInstance.imports.map(this.initModule.bind(this));
  }

  private initModuleCommands(module: ModuleAbstract, moduleName: string) {
    if (!module.commands || !module.commands.length) {
      return;
    }

    logger.log(
      `Trying to init ${moduleName} commands! To init: ${module.commands.length}`
    );

    return this.client.commandManager.loadCommands(module);
  }

  private initModuleEvents(module: ModuleAbstract, moduleName: string) {
    if (!module.events || !module.events.length) {
      return;
    }

    logger.log(
      `Trying to init ${moduleName} events! To init: ${module.events.length}`
    );

    return this.client.eventManager.loadEvents(module);
  }
}
