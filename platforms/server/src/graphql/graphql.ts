
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum CacheControlScope {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE"
}

export enum Direction {
    DESC = "DESC",
    ASC = "ASC"
}

export enum TagType {
    INCOME = "INCOME",
    EXPENDITURE = "EXPENDITURE",
    INVESTMENT = "INVESTMENT",
    LOAD = "LOAD"
}

export interface CreateAccountBookInput {
    name: string;
    desc?: Nullable<string>;
    adminIds?: Nullable<string[]>;
    memberIds?: Nullable<string[]>;
}

export interface UpdateAccountBookInput {
    id: string;
    name?: Nullable<string>;
    desc?: Nullable<string>;
    adminIds?: Nullable<string[]>;
    memberIds?: Nullable<string[]>;
}

export interface OrderBy {
    field: string;
    direction: Direction;
}

export interface Pagination {
    limit?: Nullable<number>;
    offset?: Nullable<number>;
    orderBy?: Nullable<OrderBy[]>;
}

export interface CreateFlowRecordInput {
    desc?: Nullable<string>;
    dealAt: Date;
    amount: number;
    savingAccountId: string;
    tagId: string;
}

export interface UpdateFlowRecordInput {
    id: string;
    desc?: Nullable<string>;
    dealAt?: Nullable<Date>;
    amount?: Nullable<number>;
    savingAccountId?: Nullable<string>;
    tagId?: Nullable<string>;
}

export interface CreateSavingAccountInput {
    name: string;
    desc?: Nullable<string>;
    amount: number;
    accountBookId: string;
}

export interface UpdateSavingAccountInput {
    id: string;
    name?: Nullable<string>;
    desc?: Nullable<string>;
    amount?: Nullable<number>;
}

export interface CreateSavingAccountTransferRecord {
    name: string;
    desc?: Nullable<string>;
    amount: number;
    fromSavingAccountId: string;
    toSavingAccountId: string;
    dealAt: Date;
}

export interface UpdateSavingAccountTransferRecord {
    id: string;
    name?: Nullable<string>;
    desc?: Nullable<string>;
    amount?: Nullable<number>;
    fromSavingAccountId?: Nullable<string>;
    toSavingAccountId?: Nullable<string>;
    dealAt?: Nullable<Date>;
}

export interface CreateTagInput {
    name: string;
    type: TagType;
    accountBookId: string;
}

export interface UpdateTagInput {
    id: string;
    name: string;
}

export interface SignUpUserInput {
    nickname: string;
    username: string;
    password: string;
    email?: Nullable<string>;
    avatar?: Nullable<string>;
}

export interface SignInUserInput {
    username: string;
    password: string;
    rememberMe?: Nullable<boolean>;
}

export interface EntityDateTime {
    createdAt: DateTime;
    updatedAt: DateTime;
}

export interface AccountBookListWithPagintion {
    total: number;
    data: AccountBook[];
}

export interface AccountBook extends EntityDateTime {
    id: string;
    name: string;
    desc?: Nullable<string>;
    admins: SimpleUser[];
    members: SimpleUser[];
    creator: SimpleUser;
    updater: SimpleUser;
    createdAt: DateTime;
    updatedAt: DateTime;
    savingAccounts: SavingAccountListWithPagintion;
    savingAccount: SavingAccount;
    tags?: Nullable<TagListWithPagintion>;
    tag: Tag;
    flowRecords: FlowRecordListWithPagintion;
    flowRecord: FlowRecord;
}

export interface IMutation {
    createAccountBook(accountBook: CreateAccountBookInput): AccountBook | Promise<AccountBook>;
    updateAccountBook(accountBook: UpdateAccountBookInput): AccountBook | Promise<AccountBook>;
    deleteAccountBook(id: string): boolean | Promise<boolean>;
    createFlowRecord(flowRecord: CreateFlowRecordInput): FlowRecord | Promise<FlowRecord>;
    updateFlowRecord(flowRecord: UpdateFlowRecordInput): FlowRecord | Promise<FlowRecord>;
    deleteFlowRecord(id: string): boolean | Promise<boolean>;
    createSavingAccount(savingAccount: CreateSavingAccountInput): SavingAccount | Promise<SavingAccount>;
    updateSavingAccount(savingAccount: UpdateSavingAccountInput): SavingAccount | Promise<SavingAccount>;
    deleteSavingAccount(id: string): boolean | Promise<boolean>;
    createSavingAccountTransferRecord(record: CreateSavingAccountTransferRecord): SavingAccountTransferRecord | Promise<SavingAccountTransferRecord>;
    updateSavingAccountTransferRecord(record: UpdateSavingAccountTransferRecord): SavingAccountTransferRecord | Promise<SavingAccountTransferRecord>;
    deleteSavingAccountTransferRecord(id: string): boolean | Promise<boolean>;
    createTag(tag: CreateTagInput): Tag | Promise<Tag>;
    updateTag(tag: UpdateTagInput): Tag | Promise<Tag>;
    deleteTag(id: string): boolean | Promise<boolean>;
    signIn(user: SignInUserInput): User | Promise<User>;
    signUp(user: SignUpUserInput): User | Promise<User>;
}

export interface FlowRecordListWithPagintion {
    total: number;
    data: FlowRecord[];
}

export interface FlowRecord extends EntityDateTime {
    id: string;
    desc?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
    dealAt: Date;
    creator: SimpleUser;
    updater: SimpleUser;
    amount: number;
    accountBook: AccountBook;
    savingAccount: SavingAccount;
    tag: Tag;
}

export interface IQuery {
    node(id: string): Nullable<Node> | Promise<Nullable<Node>>;
    nodes(ids: string[]): Node[] | Promise<Node[]>;
    getCurrentUser(): User | Promise<User>;
    findUserListByNameLike(name: string, limit?: Nullable<number>, includeSelf?: Nullable<boolean>): SimpleUser[] | Promise<SimpleUser[]>;
}

export interface SavingAccountListWithPagintion {
    total: number;
    data: SavingAccount[];
}

export interface AmountHistory {
    id: string;
    amount: number;
    dealAt: Date;
}

export interface SavingAccount extends EntityDateTime {
    id: string;
    name: string;
    desc?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
    amount: number;
    creator: SimpleUser;
    updater: SimpleUser;
    accountBook: AccountBook;
    getHistoriesByDate: AmountHistory[];
    flowRecords: FlowRecordListWithPagintion;
    flowRecord: FlowRecord;
}

export interface SavingAccountTransferRecord extends EntityDateTime {
    id: string;
    name: string;
    desc?: Nullable<string>;
    amount: number;
    creator: SimpleUser;
    updater: SimpleUser;
    from: SavingAccount;
    to: SavingAccount;
    accountBook: AccountBook;
    dealAt: Date;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export interface TagListWithPagintion {
    total: number;
    data: Tag[];
}

export interface Tag extends EntityDateTime {
    id: string;
    name: string;
    type: TagType;
    createdAt: DateTime;
    updatedAt: DateTime;
    creator: SimpleUser;
    updater: SimpleUser;
    accountBook: AccountBook;
    flowRecords: FlowRecordListWithPagintion;
    flowRecord: FlowRecord;
}

export interface User extends EntityDateTime {
    id: string;
    username: string;
    nickname: string;
    email?: Nullable<string>;
    avatar?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
    accountBooks: AccountBookListWithPagintion;
    accountBook: AccountBook;
}

export interface SimpleUser {
    id: string;
    nickname: string;
    username: string;
    email?: Nullable<string>;
    avatar?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export type DateTime = any;
export type Node = SimpleUser | AccountBook | SavingAccount | Tag | FlowRecord | SavingAccountTransferRecord;
type Nullable<T> = T | null;
