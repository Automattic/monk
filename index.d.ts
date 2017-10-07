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

  export type TMiddleware = <T =any>(middleware: { collection: ICollection, monkInstance: IMonkManager }) => (next: <N =any>(args: Object, method: string) => Promise<N>) => (args: Object, method: string) => Promise<T>

  type TQuery = string | Object
  type TFields = string | Array<string>

  type IResultMixin = {
    _id: IObjectID
  }
  type IResult<T> = IResultMixin & {
    [K in keyof T]: T[K]
  }

  export interface ICollection {
    readonly manager: IMonkManager
    readonly name: string
    options: Object
    readonly middlewares: Array<TMiddleware>

    readonly aggregate: <T =any>(stages: Array<any>, options?: Object) => Promise<T>
    readonly bulkWrite: <T =any>(operations: Array<any>, options?: Object) => Promise<T>
    readonly count: (query?: TQuery, options?: Object) => Promise<number>
    readonly createIndex: <T =any>(fields?: TFields, options?: Object) => Promise<T>
    readonly distinct: (field: string, query?: TQuery, options?: Object) => Promise<number>
    readonly drop: <T =any>() => Promise<T>
    readonly dropIndex: <T =any>(fields?: TFields, options?: Object) => Promise<T>
    readonly dropIndexes: <T =any>() => Promise<T>
    readonly find: <T =any>(query?: TQuery, options?: Object) => Promise<IResult<T>[]> & {
      readonly each: (record: any, cursor: {
        readonly close: () => void,
        readonly resume: () => void,
        readonly pause: () => void
      }) => IResult<T>
    }
    readonly findOne: <T =any>(query?: TQuery, options?: Object) => Promise<IResult<T>>
    readonly findOneAndDelete: <T =any>(query?: TQuery, options?: Object) => Promise<IResult<T>>
    readonly findOneAndUpdate: <T =any>(query: TQuery, update: Object, options?: Object) => Promise<T>
    readonly geoHaystackSearch: <T =any>(x: number, y: number, options: Object) => Promise<T>
    readonly geoNear: <T =any>(x: number, y: number, options?: Object) => Promise<T>
    readonly group: <T =any>(keys: any, condition: any, initial: any, reduce: any, finalize: any, command: any, options?: Object) => Promise<T>
    readonly indexes: <T =any>() => Promise<T>
    readonly insert: <T =any>(data: Object | Array<Object>, options?: Object) => Promise<T>
    readonly mapReduce: <T =any>(map: () => any, reduce: (key: string, values: Array<any>) => any, options: Object) => Promise<T>
    readonly remove: <T =any>(query?: TQuery, options?: Object) => Promise<T>
    readonly stats: <T =any>(options?: Object) => Promise<T>
    readonly update: <T =any>(query: TQuery, update: Object, options?: Object) => Promise<T>
  }

  export interface IObjectID {
    readonly toHexString: () => string
    readonly toString: () => string
  }

  export function id(hexstring: string): IObjectID // returns ObjectId
  export function id(obj: IObjectID): IObjectID // returns ObjectId
  export function id(): IObjectID // returns new generated ObjectId
  export function cast<T =any>(obj?: Object | Array<any> | any): T
  
  export default function (database: string | Array<string>, options?: {
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
  }): Promise<IMonkManager> & IMonkManager
}
