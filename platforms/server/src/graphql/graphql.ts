
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum Direction {
    DESC = "DESC",
    AESC = "AESC"
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
    skip?: Nullable<number>;
    take?: Nullable<number>;
    orderBy?: Nullable<OrderBy[]>;
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

export interface Timestamp {
    createdAt: DateTime;
    updatedAt: DateTime;
}

export interface SavingAccountListWithPagintion {
    total: number;
    data: AccountBook[];
}

export interface AccountBook extends Timestamp {
    id: number;
    name: string;
    desc?: Nullable<string>;
    admins: User[];
    members: User[];
    creator: User;
    updater: User;
    createdAt: DateTime;
    updatedAt: DateTime;
    savingAccounts: SavingAccountListWithPagintion;
    savingAccount: SavingAccount;
}

export interface IMutation {
    createAccountBook(accountBook: CreateAccountBookInput): AccountBook | Promise<AccountBook>;
    updateAccountBook(accountBook: UpdateAccountBookInput): AccountBook | Promise<AccountBook>;
    createSavingAccount(savingAccount: CreateSavingAccountInput): SavingAccount | Promise<SavingAccount>;
    updateSavingAccount(savingAccount: UpdateSavingAccountInput): SavingAccount | Promise<SavingAccount>;
    createTag(tag: CreateTagInput): Tag | Promise<Tag>;
    updateTag(tag: UpdateTagInput): Tag | Promise<Tag>;
    signIn(user: SignInUserInput): User | Promise<User>;
    signUp(user: SignUpUserInput): User | Promise<User>;
}

export interface SavingAccount extends Timestamp {
    id: number;
    name: string;
    desc?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
    amount: number;
    creator: User;
    updater: User;
    accountBook: AccountBook;
}

export interface Tag {
    id: number;
    name: string;
    type: TagType;
    createdAt: DateTime;
    updatedAt: DateTime;
    creator: User;
    accountBook: AccountBook;
}

export interface IQuery {
    getTagsByAccountBookId(accountBookId: number): Tag[] | Promise<Tag[]>;
    getCurrentUser(): User | Promise<User>;
    findUserListByUsernameLike(username: string, limit?: Nullable<number>): User[] | Promise<User[]>;
}

export interface AccountBookListWithPagintion {
    total: number;
    data: AccountBook[];
}

export interface User extends Timestamp {
    id: number;
    username: string;
    email?: Nullable<string>;
    avatar?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
    accountBooks: AccountBookListWithPagintion;
    accountBook: AccountBook;
}

export type DateTime = any;
type Nullable<T> = T | null;
