
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
    dealAt: DateTime;
    amount: number;
    accountBookId: number;
    savingAccountId: number;
    tagId: number;
}

export interface UpdateFlowRecordInput {
    id: number;
    desc?: Nullable<string>;
    dealAt: DateTime;
    amount: number;
    accountBookId: number;
    savingAccountId: number;
    tagId: number;
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
    createFlowRecord(flowRecord: CreateFlowRecordInput): FlowRecord | Promise<FlowRecord>;
    updateFlowRecord(flowRecord: UpdateFlowRecordInput): FlowRecord | Promise<FlowRecord>;
    createSavingAccount(savingAccount: CreateSavingAccountInput): SavingAccount | Promise<SavingAccount>;
    updateSavingAccount(savingAccount: UpdateSavingAccountInput): SavingAccount | Promise<SavingAccount>;
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
    findUserListByUsernameLike(username: string, limit?: Nullable<number>): SimpleUser[] | Promise<SimpleUser[]>;
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
    dealAt: DateTime;
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
    dealAt: DateTime;
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
    getAmountHistoriesByDate: AmountHistory[];
    flowRecords: FlowRecordListWithPagintion;
    flowRecord: FlowRecord;
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
