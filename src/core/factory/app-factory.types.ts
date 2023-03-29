import { ModuleAbstract } from "@abstracts/module/module.abstract";
import { CustomClient } from "@client/custom-client";

export interface AppFactoryOptions {
  module: typeof ModuleAbstract;
  client: CustomClient;
}
