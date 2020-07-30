declare module "monk" {
  import {
    CollectionAggregationOptions,
    MongoCountPreferences,
    BulkWriteOpResultObject,
    FilterQuery,
    FindOneOptions,
    UpdateQuery,
    UpdateOneOptions,
    CollectionInsertOneOptions,
    Cursor,
    FindOneAndDeleteOption,
    FindOneAndUpdateOption,
    FindOneAndReplaceOption,
    GeoHaystackSearchOptions,
    CollectionMapFunction,
    CollectionReduceFunction,
    MapReduceOptions,
    CommonOptions,
    DeleteWriteOpResultObject,
    ClientSession,
    CollStats,
    UpdateWriteOpResult,
    IndexOptions,
    CollectionBulkWriteOptions,
    BulkWriteOperation,
    MongoDistinctPreferences,
    CollectionCreateOptions,
    MongoClientOptions,
  } from "mongodb";

  // Utils
  type SingleOrArray<T> = T | Array<T>;
  type WithID<T> = { _id: IObjectID } & T;
  type Callback<T> = (err: Error | null, data: T) => void;

  // Inputs
  type SingleMulti = { single?: boolean; multi?: boolean };
  type CreateIndexInput<T> = string | { [key in keyof T]?: 1 | -1 };
  type CollectionInsertOneOptionsMonk = CollectionInsertOneOptions & {
    castIds: boolean;
  };
  type DropIndexInput<T> = CreateIndexInput<T> & string[];
  type DropIndexOptions = CommonOptions & { maxTimeMS?: number };
  type FindOptions = FindOneOptions & { rawCursor?: boolean };
  type RemoveOptions = CommonOptions & SingleMulti;
  type StatsOptions = { scale: number; session?: ClientSession };

  // Returns
  type DropResult = "ns not found" | true;
  type DropIndexResult = { nIndexesWas: number; ok: 1 | 0 };
  type DropIndexesResult = DropIndexResult & { msg?: string };
  type FindRawResult<T> = Cursor<WithID<T>>;
  type FindResult<T> = WithID<T>[] & {
    readonly each: (
      listener: (
        record: T,
        cursor: {
          readonly close: () => void;
          readonly resume: () => void;
          readonly pause: () => void;
        }
      ) => any
    ) => any;
  };
  type FindOneResult<T> = WithID<T> | null;
  type GeoHaystackSearchResult<T> = T[];
  type InsertResult<T> = WithID<T>;
  type IndexesResult<T> = {
    [name: string]: [keyof T, 1 | -1][];
  };
  type UpdateResult = UpdateWriteOpResult["result"];

  export type TMiddleware = ({
    collection,
    monkInstance,
  }: {
    collection: ICollection;
    monkInstance: IMonkManager;
  }) => (
    next: (args: Object, method: string) => Promise<any>
  ) => (args: Object, method: string) => Promise<any>;

  type CollectionOptions = {
    middlewares?: TMiddleware[];
  };

  export class IMonkManager {
    readonly _state: "closed" | "opening" | "open";

    readonly on: (event: string, handler: (event: any) => any) => void;
    readonly addListener: (event: string, handler: (event: any) => any) => void;
    readonly once: (event: string, handler: (event: any) => any) => void;
    readonly removeListener: (
      event: string,
      handler: (event: any) => any
    ) => void;

    readonly close: () => Promise<void>;
    readonly listCollections: (query?: Object) => Array<ICollection>;

    get<T = any>(name: string, options?: CollectionOptions): ICollection<T>;
    create<T = any>(
      name: string,
      creationOption?: CollectionCreateOptions,
      options?: CollectionOptions
    ): ICollection<T>;

    readonly setDefaultCollectionOptions: (
      collectionOptions?: CollectionOptions
    ) => void;
    readonly addMiddleware: (middleware: TMiddleware) => void;
  }

  type TQuery = string | Object;
  type TFields = string | Array<string>;

  export class ICollection<T extends { [key: string]: any } = any> {
    readonly manager: IMonkManager;
    readonly name: string;
    options: Object;
    readonly middlewares: Array<TMiddleware>;

    aggregate<U = any>(
      pipeline: Object[],
      options?: CollectionAggregationOptions
    ): Promise<U>;
    aggregate<U = any>(
      stages: Object[],
      options: CollectionAggregationOptions,
      callback: Callback<U>
    ): void;

    bulkWrite(
      operations: BulkWriteOperation<T>[],
      options?: CollectionBulkWriteOptions
    ): Promise<BulkWriteOpResultObject>;
    bulkWrite(
      operations: BulkWriteOperation<T>[],
      options: CollectionBulkWriteOptions,
      callback: Callback<BulkWriteOpResultObject>
    ): void;

    /**
     * http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#count
     * @deprecated Use countDocuments or estimatedDocumentCount
     */
    count(
      query?: FilterQuery<T>,
      options?: MongoCountPreferences
    ): Promise<number>;
    count(
      query: FilterQuery<T>,
      options: MongoCountPreferences,
      callback?: Callback<number>
    ): void;

    createIndex(
      fields: CreateIndexInput<T>,
      options?: IndexOptions
    ): Promise<string>;
    createIndex(
      fields: CreateIndexInput<T>,
      options: IndexOptions,
      callback: Callback<string>
    ): void;

    distinct<K extends keyof T | string>(
      field: K,
      query?: FilterQuery<T>,
      options?: MongoDistinctPreferences
    ): Promise<T[K][]>;
    distinct<K extends keyof T | string>(
      field: K,
      query: FilterQuery<T>,
      options: MongoDistinctPreferences,
      callback: Callback<T[K][]>
    ): void;

    drop(): Promise<DropResult>;
    drop(callback: Callback<DropResult>): void;

    dropIndex(
      fields: DropIndexInput<T>,
      options?: DropIndexOptions
    ): Promise<DropIndexResult>;
    dropIndex(
      fields: DropIndexInput<T>,
      options: DropIndexOptions,
      callback: Callback<DropIndexResult>
    ): void;

    dropIndexes(): Promise<DropIndexesResult>;
    dropIndexes(callback?: Callback<DropIndexesResult>): void;

    // Raw
    find(
      query: FilterQuery<T>,
      options?: FindOptions & { rawCursor: true }
    ): Promise<FindRawResult<T>>;
    find(
      query: FilterQuery<T>,
      options: FindOneOptions & { rawCursor: true },
      callback: Callback<FindRawResult<T>>
    ): void;
    // Normal
    find(query?: FilterQuery<T>, options?: FindOptions): Promise<FindResult<T>>;
    find(
      query: FilterQuery<T>,
      options: FindOneOptions,
      callback: Callback<FindResult<T>>
    ): void;

    findOne(
      query?: FilterQuery<T>,
      options?: FindOneOptions
    ): Promise<FindOneResult<T>>;
    findOne(
      query: FilterQuery<T>,
      options: FindOneOptions,
      callback: Callback<FindOneResult<T>>
    ): void;

    findOneAndDelete(
      query: FilterQuery<T>,
      options?: FindOneAndDeleteOption
    ): Promise<FindOneResult<T>>;
    findOneAndDelete(
      query: FilterQuery<T>,
      options: FindOneAndDeleteOption,
      callback: Callback<FindOneResult<T>>
    ): void;

    // Update
    findOneAndUpdate(
      query: FilterQuery<T>,
      update: UpdateQuery<T> | Partial<T>,
      options?: FindOneAndUpdateOption & { replaceOne?: false }
    ): Promise<FindOneResult<T>>;
    findOneAndUpdate(
      query: FilterQuery<T>,
      update: UpdateQuery<T> | Partial<T>,
      options?: FindOneAndUpdateOption & { replaceOne?: false },
      callback?: Callback<FindOneResult<T>>
    ): void;
    // Replace
    findOneAndUpdate(
      query: FilterQuery<T>,
      update: T,
      options?: FindOneAndReplaceOption & { replaceOne: true }
    ): Promise<FindOneResult<T>>;
    findOneAndUpdate(
      query: FilterQuery<T>,
      update: T,
      options: FindOneAndReplaceOption & { replaceOne: true },
      callback: Callback<FindOneResult<T>>
    ): void;

    geoHaystackSearch(
      x: number,
      y: number,
      options?: GeoHaystackSearchOptions
    ): Promise<GeoHaystackSearchResult<T>>;
    geoHaystackSearch(
      x: number,
      y: number,
      options: GeoHaystackSearchOptions,
      callback: Callback<GeoHaystackSearchResult<T>>
    ): void;

    /** @deprecated MongoDB 3.6 or higher no longer supports the group command. We recommend rewriting using the aggregation framework. */
    group<U = any>(
      keys: any,
      condition: Object,
      initial: Object,
      reduce: Function,
      finalize: Function,
      command: Boolean,
      options?: Object
    ): Promise<U>;
    group<U = any>(
      keys: any,
      condition: Object,
      initial: Object,
      reduce: Function,
      finalize: Function,
      command: Boolean,
      options?: Object,
      callback?: Callback<U>
    ): void;

    indexes(): Promise<IndexesResult<T>>;
    indexes(callback: Callback<IndexesResult<T>>): void;

    insert(
      data: SingleOrArray<T>,
      options?: CollectionInsertOneOptionsMonk
    ): Promise<InsertResult<T>>;
    insert(
      data: SingleOrArray<T>,
      options: CollectionInsertOneOptionsMonk,
      callback: Callback<InsertResult<T>>
    ): void;

    mapReduce<TKey, TValue>(
      map: CollectionMapFunction<T>,
      reduce: CollectionReduceFunction<TKey, TValue>,
      options: MapReduceOptions
    ): Promise<any>;
    mapReduce<TKey, TValue>(
      map: CollectionMapFunction<T>,
      reduce: CollectionReduceFunction<TKey, TValue>,
      options: MapReduceOptions,
      callback: Callback<any>
    ): void;

    remove(
      query?: FilterQuery<T>,
      options?: RemoveOptions
    ): Promise<DeleteWriteOpResultObject>;
    remove(
      query: FilterQuery<T>,
      options: RemoveOptions,
      callback: Callback<DeleteWriteOpResultObject>
    ): void;

    stats(options?: StatsOptions): Promise<CollStats>;
    stats(options: StatsOptions, callback: Callback<CollStats>): void;

    update(
      query: FilterQuery<T>,
      update: UpdateQuery<T> | Partial<T>,
      options?: UpdateOneOptions
    ): Promise<UpdateWriteOpResult>;
    update(
      query: FilterQuery<T>,
      update: UpdateQuery<T> | Partial<T>,
      options: UpdateOneOptions,
      callback: Callback<UpdateWriteOpResult>
    ): void;
  }

  export interface IObjectID {
    readonly toHexString: () => string;
    readonly toString: () => string;
  }

  export function id(hexstring: string): IObjectID; // returns ObjectId
  export function id(obj: IObjectID): IObjectID; // returns ObjectId
  export function id(): IObjectID; // returns new generated ObjectId
  export function cast(obj?: Object | Array<any> | any): any;

  export default function (
    database: string | Array<string>,
    options?: MongoClientOptions & {
      collectionOptions?: CollectionOptions;
    }
  ): Promise<IMonkManager> & IMonkManager;
}
