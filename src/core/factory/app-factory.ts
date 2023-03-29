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

  public async createApp() {
    await this.initModule(this.module);

    return this;
  }

  private async initModule(Module: typeof ModuleAbstract) {
    logger.log(`Initing ${Module.name}`);

    const moduleInstance = new Module(this.customClient);

    await this.initModuleCommands(moduleInstance, Module.name);
    await this.initModuleEvents(moduleInstance, Module.name);

    if (!moduleInstance.imports?.length) return;

    await Promise.all(moduleInstance.imports.map(this.initModule.bind(this)));
  }

  private initModuleCommands(module: ModuleAbstract, moduleName: string) {
    if (!module.commands || !module.commands.length) return;

    logger.log(
      `Trying to init ${moduleName} commands! To init: ${module.commands.length}`
    );

    return this.customClient.commandManager.loadCommands(module);
  }

  private initModuleEvents(module: ModuleAbstract, moduleName: string) {
    if (!module.events || !module.events.length) return;

    logger.log(
      `Trying to init ${moduleName} events! To init: ${module.events.length}`
    );

    return this.customClient.eventManager.loadEvents(module);
  }
}
