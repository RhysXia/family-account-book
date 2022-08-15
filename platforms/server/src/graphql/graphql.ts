
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

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
    adminIds?: Nullable<number[]>;
    memberIds?: Nullable<number[]>;
}

export interface UpdateAccountBookInput {
    id: number;
    name?: Nullable<string>;
    desc?: Nullable<string>;
    adminIds?: Nullable<number[]>;
    memberIds?: Nullable<number[]>;
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
    savingAccountId: number;
    tagId: number;
}

export interface UpdateFlowRecordInput {
    id: number;
    desc?: Nullable<string>;
    dealAt?: Nullable<Date>;
    amount?: Nullable<number>;
    savingAccountId?: Nullable<number>;
    tagId?: Nullable<number>;
}

export interface CreateSavingAccountInput {
    name: string;
    desc?: Nullable<string>;
    amount: number;
    accountBookId: number;
}

export interface UpdateSavingAccountInput {
    id: number;
    name?: Nullable<string>;
    desc?: Nullable<string>;
    amount?: Nullable<number>;
}

export interface CreateSavingAccountTransferRecord {
    name: string;
    desc?: Nullable<string>;
    amount: number;
    fromSavingAccountId: number;
    toSavingAccountId: number;
    dealAt: Date;
}

export interface UpdateSavingAccountTransferRecord {
    id: number;
    name?: Nullable<string>;
    desc?: Nullable<string>;
    amount?: Nullable<number>;
    fromSavingAccountId?: Nullable<number>;
    toSavingAccountId?: Nullable<number>;
    dealAt?: Nullable<Date>;
}

export interface CreateTagInput {
    name: string;
    type: TagType;
    accountBookId: number;
}

export interface UpdateTagInput {
    id: number;
    name: string;
}

export interface SignUpUserInput {
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
    id: number;
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
    deleteAccountBook(id: number): boolean | Promise<boolean>;
    createFlowRecord(flowRecord: CreateFlowRecordInput): FlowRecord | Promise<FlowRecord>;
    updateFlowRecord(flowRecord: UpdateFlowRecordInput): FlowRecord | Promise<FlowRecord>;
    deleteFlowRecord(id: number): boolean | Promise<boolean>;
    createSavingAccount(savingAccount: CreateSavingAccountInput): SavingAccount | Promise<SavingAccount>;
    updateSavingAccount(savingAccount: UpdateSavingAccountInput): SavingAccount | Promise<SavingAccount>;
    deleteSavingAccount(id: number): boolean | Promise<boolean>;
    createSavingAccountTransferRecord(record: CreateSavingAccountTransferRecord): SavingAccountTransferRecord | Promise<SavingAccountTransferRecord>;
    updateSavingAccountTransferRecord(record: UpdateSavingAccountTransferRecord): SavingAccountTransferRecord | Promise<SavingAccountTransferRecord>;
    deleteSavingAccountTransferRecord(id: number): boolean | Promise<boolean>;
    createTag(tag: CreateTagInput): Tag | Promise<Tag>;
    updateTag(tag: UpdateTagInput): Tag | Promise<Tag>;
    signIn(user: SignInUserInput): User | Promise<User>;
    signUp(user: SignUpUserInput): User | Promise<User>;
}

export interface IQuery {
    getAuthAccountBookById(id: number): AccountBook | Promise<AccountBook>;
    getAuthAccountBooks(pagination?: Nullable<Pagination>): AccountBookListWithPagintion | Promise<AccountBookListWithPagintion>;
    getAuthSavingAccounts(pagination?: Nullable<Pagination>): SavingAccountListWithPagintion | Promise<SavingAccountListWithPagintion>;
    getAuthSavingAccount(id: number): SavingAccount | Promise<SavingAccount>;
    getAuthTagsByAccountBookId(accountBookId: number): Tag[] | Promise<Tag[]>;
    getAuthTagById(id: number): Tag | Promise<Tag>;
    getCurrentUser(): User | Promise<User>;
    findUserListByUsernameLike(username: string, limit?: Nullable<number>, includeSelf?: Nullable<boolean>): SimpleUser[] | Promise<SimpleUser[]>;
}

export interface FlowRecordListWithPagintion {
    total: number;
    data: FlowRecord[];
}

export interface FlowRecord extends EntityDateTime {
    id: number;
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

export interface SavingAccountListWithPagintion {
    total: number;
    data: SavingAccount[];
}

export interface AmountHistory {
    id: number;
    amount: number;
    dealAt: Date;
}

export interface SavingAccount extends EntityDateTime {
    id: number;
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
    id: number;
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
    id: number;
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
    id: number;
    username: string;
    email?: Nullable<string>;
    avatar?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
    accountBooks: AccountBookListWithPagintion;
    accountBook: AccountBook;
}

export interface SimpleUser {
    id: number;
    username: string;
    email?: Nullable<string>;
    avatar?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export type DateTime = Date;
type Nullable<T> = T | null;
