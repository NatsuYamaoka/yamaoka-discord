declare namespace NodeJS {
  export interface ProcessEnv {
    TOKEN: string;
    DATABASE_PORT: number;
    DATABASE_USER: string;
    DATABASE_PASSWORD: string;
    DATABASE_HOST: string;
    DATABASE_NAME: string;
    OWNER: string;
    CLIENTID: string;
    NODE_ENV: "dev" | "prod";
  }
}
