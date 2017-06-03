export = Monk

declare namespace Monk {
  export interface IMonkManager {
    readonly _state: 'closed' | 'opening' | 'open'

    readonly on: (event: string, handler: (event: any) => any) => void
    readonly addListener: (event: string, handler: (event: any) => any) => void
    readonly once: (event: string, handler: (event: any) => any) => void
    readonly removeListener: (event: string, handler: (event: any) => any) => void

    readonly close: () => Promise<void>

    readonly get: (name: string, options?: Object) => ICollection
    readonly create: (name: string, creationOption?: Object, options?: Object) => ICollection

    readonly setDefaultCollectionOptions: (collectionOptions?: Object) => void
    readonly addMiddleware: (middleware: TMiddleware) => void
  }

  export type TMiddleware = ({ collection: ICollection, monkInstance: IMonkManager }) => (next: (args: Object, method: string) => Promise<any>) => (args: Object, method: string) => Promise <any>

  type TQuery = string | Object
  type TFields = string | Array<string>

  export interface ICollection {
    readonly manager: IMonkManager
    readonly name: string
    readonly options: Object
    readonly middlewares: Array<TMiddleware>

    readonly aggregate: (stages: Array, options?: Object) => Promise<Any>
    readonly bulkWrite: (operations: Array, options?: Object) => Promise<Any>
    readonly count: (query?: TQuery, options?: Object) => Promise<number>
    readonly createIndex: (fields?: TFields, options?: Object) => Promise<Any>
    readonly distinct: (field: string, query?: TQuery, options?: Object) => Promise<number>
    readonly drop: () => Promise<Any>
    readonly dropIndex: (fields?: TFields, options?: Object) => Promise<Any>
    readonly dropIndexes: () => Promise<Any>
    readonly find: (query?: TQuery, options?: Object) => Promise<Any> | Promise<void> & {
      readonly each: (record: Object, cursor: {
        readonly close: () => void,
        readonly resume: () => void,
        readonly pause: () => void
      }) => any
    }
    readonly findOne: (query?: TQuery, options?: Object) => Promise<Any>
    readonly findOneAndDelete: (query?: TQuery, options?: Object) => Promise<Any>
    readonly findOneAndUpdate: (query: TQuery, update: Object, options?: Object) => Promise<Any>
    readonly group: (keys: Any, condition: Any, initial: Any, reduce: Any, finalize: Any, command: Any, options?: Object) => Promise<Any>
    readonly indexes: () => Promise<Any>
    readonly insert: (data: Object | Array<Object>, options?: Object) => Promise<Any>
    readonly remove: (query?: TQuery, options?: Object) => Promise<Any>
    readonly update: (query: TQuery, update: Object, options?: Object) => Promise<Any>
  }

  export interface IObjectID {
    readonly toHexString: () => string
    readonly toString: () => string
  }

  export function id(hexstring: string): IObjectID // returns ObjectId
  export function id(obj: IObjectID): IObjectID // returns ObjectId
  export function id(): IObjectID // returns new generated ObjectId
  export function cast(obj?: Object | Array<any> | any): any

  export default function(database: string | Array<string>, options?: {
    collectionOptions?: Object,
    poolSize?: number,
    ssl?: boolean,
    sslValidate?: boolean,
    sslCA?: Array<string | Buffer>,
    sslCert?: string | Buffer,
    sslKey?: string | Buffer
    sslPass?: string | Buffer,
    autoReconnect?: boolean,
    noDelay?: boolean,
    keepAlive?: number,
    connectTimeoutMS?: number,
    socketTimeoutMS?: number,
    reconnectTries?: number,
    reconnectInterval?: number,
    ha?: boolean,
    haInterval?: number,
    replicaSet?: string,
    secondaryAcceptableLatencyMS?: number,
    acceptableLatencyMS?: number,
    connectWithNoPrimary?: boolean,
    authSource?: string,
    w?: string | number,
    wtimeout?: number,
    j?: boolean,
    forceServerObjectId?: boolean,
    serializeFunctions?: boolean,
    ignoreUndefined?: boolean,
    raw?: boolean,
    promoteLongs?: boolean,
    bufferMaxEntries?: number,
    readPreference?: Object | null,
    pkFactory?: Object | null,
    promiseLibrary?: Object | null,
    readConcern?: Object | null
  }): Promise<IMonkManager>

}
