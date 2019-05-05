declare module 'monk' {
  export class IMonkManager {
    readonly _state: 'closed' | 'opening' | 'open'

    readonly on: (event: string, handler: (event: any) => any) => void
    readonly addListener: (event: string, handler: (event: any) => any) => void
    readonly once: (event: string, handler: (event: any) => any) => void
    readonly removeListener: (
      event: string,
      handler: (event: any) => any
    ) => void

    readonly close: () => Promise<void>
    readonly listCollections: (query?: Object) => Array<ICollection>

    get<T = any>(name: string, options?: Object): ICollection<T>
    create<T = any>(
      name: string,
      creationOption?: Object,
      options?: Object
    ): ICollection<T>

    readonly setDefaultCollectionOptions: (collectionOptions?: Object) => void
    readonly addMiddleware: (middleware: TMiddleware) => void
  }

  export type TMiddleware = (
    {
      collection,
      monkInstance,
    }: { collection: ICollection; monkInstance: IMonkManager }
  ) => (
      next: (args: Object, method: string) => Promise<any>
    ) => (args: Object, method: string) => Promise<any>

  type TQuery = string | Object
  type TFields = string | Array<string>

  export class ICollection<T = any> {
    readonly manager: IMonkManager
    readonly name: string
    options: Object
    readonly middlewares: Array<TMiddleware>

    aggregate<U = any>(stages: Array<any>, options?: Object): Promise<U>
    aggregate<U = any>(stages: Array<any>, options?: Object, callback?: (err: Error | null, data: U) => void): void
    bulkWrite<U = any>(operations: Array<any>, options?: Object): Promise<U>
    bulkWrite<U = any>(operations: Array<any>, options?: Object, callback?: (err: Error | null, data: U) => void): void
    count(query?: TQuery, options?: Object): Promise<number>
    count(query?: TQuery, options?: Object, callback?: (err: Error | null, data: number) => void): void
    createIndex(
      fields?: TFields | { [key: string]: 1 | -1 },
      options?: Object
    ): Promise<string>
    createIndex(
      fields?: TFields | { [key: string]: 1 | -1 },
      options?: Object,
      callback?: (err: Error | null, data: string) => void
    ): void
    distinct(field: string, query?: TQuery, options?: Object): Promise<number>
    distinct(field: string, query?: TQuery, options?: Object, callback?: (err: Error | null, data: number) => void): void
    drop(): Promise<'ns not found' | true>
    drop(callback?: (err: Error | null, data: 'ns not found' | true) => void): void
    dropIndex(
      fields?: TFields,
      options?: Object
    ): Promise<{
      nIndexesWas: number
      ok: 1 | 0
    }>
    dropIndex(
      fields?: TFields,
      options?: Object,
      callback?: (err: Error | null, data: {
        nIndexesWas: number
        ok: 1 | 0
      }) => void
    ): void
    dropIndexes(): Promise<{
      nIndexesWas: number
      msg?: string
      ok: 1 | 0
    }>
    dropIndexes(callback?: (err: Error | null, data: {
      nIndexesWas: number
      msg?: string
      ok: 1 | 0
    }) => void): void
    find<U = T>(
      query?: TQuery,
      options?: Object
    ): Promise<U[]> & {
      readonly each: (
        record: U,
        cursor: {
          readonly close: () => void
          readonly resume: () => void
          readonly pause: () => void
        }
      ) => any
    }
    find<U = T>(
      query?: TQuery,
      options?: Object,
      callback?: (err: Error | null, data: U[] & {
        readonly each: (
          record: U,
          cursor: {
            readonly close: () => void
            readonly resume: () => void
            readonly pause: () => void
          }
        ) => any
      }) => void
    ): void
    findOne<U = T>(query?: TQuery, options?: Object): Promise<U | undefined>
    findOne<U = T>(query?: TQuery, options?: Object, callback?: (err: Error | null, data: U | undefined) => void): void
    findOneAndDelete<U = T>(
      query?: TQuery,
      options?: Object
    ): Promise<U | undefined>
    findOneAndDelete<U = T>(
      query?: TQuery,
      options?: Object,
      callback?: (err: Error | null, data: U | undefined) => void
    ): void
    findOneAndUpdate<U = T>(
      query: TQuery,
      update: Object,
      options?: Object
    ): Promise<U | undefined>
    findOneAndUpdate<U = T>(
      query: TQuery,
      update: Object,
      options?: Object,
      callback?: (err: Error | null, data: U) => void
    ): void;
    geoHaystackSearch<U = T>(
      x: number,
      y: number,
      options: Object
    ): Promise<U[]>
    geoHaystackSearch<U = T>(
      x: number,
      y: number,
      options: Object,
      callback?: (err: Error | null, data: U[]) => void
    ): void
    group<U = any>(
      keys: any,
      condition: any,
      initial: any,
      reduce: any,
      finalize: any,
      command: any,
      options?: Object
    ): Promise<any>
    group<U = any>(
      keys: any,
      condition: any,
      initial: any,
      reduce: any,
      finalize: any,
      command: any,
      options?: Object,
      callback?: (err: Error | null, data: any) => void
    ): void
    indexes(): Promise<
      {
        [index: string]: [string, 1 | -1][]
      }[]
    >
    indexes(callback?: (err: Error | null, data: {
      [index: string]: [string, 1 | -1][]
    }[]) => void): void
    insert<U = T>(data: Object | Array<Object>, options?: Object): Promise<U>
    insert<U = T>(data: Object | Array<Object>, options?: Object, callback?: (err: Error | null, data: U) => void): void
    mapReduce(
      map: () => any,
      reduce: (key: string, values: Array<any>) => any,
      options: Object
    ): Promise<any>
    mapReduce(
      map: () => any,
      reduce: (key: string, values: Array<any>) => any,
      options: Object,
      callback?: (err: Error | null, data: any) => void
    ): void
    remove(query?: TQuery, options?: Object): Promise<{
      deletedCount: number,
      result: {
        n: number,
        ok: 1 | 0
      }
    }>
    remove(query?: TQuery, options?: Object, callback?: (err: Error | null, data: {
      deletedCount: number,
      result: {
        n: number,
        ok: 1 | 0
      }
    }) => void): void
    stats(options?: Object): Promise<{
      ns: string,
      count: number,
      size: number,
      avgObjSize: number,
      storageSize: number,
      capped: boolean,
      wiredTiger: any,
      nindexes: number,
      indexDetails: {
        [index: string]: any
      },
      totalIndexSize: number,
      indexSizes: {
        [index: string]: number
      },
      ok: 1 | 0
    }>
    stats(options?: Object, callback?: (err: Error | null, data: {
      ns: string,
      count: number,
      size: number,
      avgObjSize: number,
      storageSize: number,
      capped: boolean,
      wiredTiger: any,
      nindexes: number,
      indexDetails: {
        [index: string]: any
      },
      totalIndexSize: number,
      indexSizes: {
        [index: string]: number
      },
      ok: 1 | 0
    }) => void): void
    update(query: TQuery, update: Object, options?: Object): Promise<{
      ok: 1 | 0,
      nModified: number,
      n: number
    }>
    update(query: TQuery, update: Object, options?: Object, callback?: (err: Error | null, data: {
      ok: 1 | 0,
      nModified: number,
      n: number
    }) => void): void
  }

  export interface IObjectID {
    readonly toHexString: () => string
    readonly toString: () => string
  }

  export function id(hexstring: string): IObjectID // returns ObjectId
  export function id(obj: IObjectID): IObjectID // returns ObjectId
  export function id(): IObjectID // returns new generated ObjectId
  export function cast(obj?: Object | Array<any> | any): any

  export default function (
    database: string | Array<string>,
    options?: {
      collectionOptions?: Object
      poolSize?: number
      ssl?: boolean
      sslValidate?: boolean
      sslCA?: Array<string | Buffer>
      sslCert?: string | Buffer
      sslKey?: string | Buffer
      sslPass?: string | Buffer
      autoReconnect?: boolean
      noDelay?: boolean
      keepAlive?: number
      connectTimeoutMS?: number
      socketTimeoutMS?: number
      reconnectTries?: number
      reconnectInterval?: number
      ha?: boolean
      haInterval?: number
      replicaSet?: string
      secondaryAcceptableLatencyMS?: number
      acceptableLatencyMS?: number
      connectWithNoPrimary?: boolean
      authSource?: string
      w?: string | number
      wtimeout?: number
      j?: boolean
      forceServerObjectId?: boolean
      serializeFunctions?: boolean
      ignoreUndefined?: boolean
      raw?: boolean
      promoteLongs?: boolean
      bufferMaxEntries?: number
      readPreference?: Object | null
      pkFactory?: Object | null
      promiseLibrary?: Object | null
      readConcern?: Object | null
    }
  ): Promise<IMonkManager> & IMonkManager
}
