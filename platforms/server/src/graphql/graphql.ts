
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

export interface AccountBookInput {
    name: string;
    desc: string;
    adminIds: number[];
    memberIds: number[];
}

export interface OrderBy {
    field: string;
    direction: Direction;
}

export interface Pagination {
    skip?: Nullable<number>;
    take?: Nullable<number>;
    orderBy: OrderBy[];
}

export interface CreateSavingsInput {
    name: string;
    desc: string;
    amount: number;
    accountBookId: number;
}

export interface SignUpUserInput {
    username: string;
    password: string;
    email: string;
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

export interface AccountBook extends Timestamp {
    id: number;
    name: string;
    desc: string;
    admins: User[];
    members: User[];
    createdAt: DateTime;
    updatedAt: DateTime;
}

export interface CreateAccountBook extends Timestamp {
    id: number;
    name: string;
    desc: string;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export interface IMutation {
    createAccountBook(accountBook: AccountBookInput): CreateAccountBook | Promise<CreateAccountBook>;
    createSavings(savings: CreateSavingsInput): CreateSavings | Promise<CreateSavings>;
    signIn(user: SignInUserInput): User | Promise<User>;
    signUp(user: SignUpUserInput): User | Promise<User>;
}

export interface IQuery {
    getSelfAccountBooks(): AccountBook[] | Promise<AccountBook[]>;
    getAccountBookById(id: number): AccountBook | Promise<AccountBook>;
    getSavingsByAccountBookId(accountBookId: number): Savings[] | Promise<Savings[]>;
    getCurrentUser(): User | Promise<User>;
    searchUsers(username: string, limit?: Nullable<number>): SearchUser[] | Promise<SearchUser[]>;
}

export interface Savings extends Timestamp {
    id: number;
    name: string;
    desc: string;
    amount: number;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export interface CreateSavings extends Timestamp {
    id: number;
    name: string;
    desc: string;
    amount: number;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export interface User extends Timestamp {
    id: number;
    username: string;
    email?: Nullable<string>;
    avatar?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export interface SearchUser {
    id: number;
    username: string;
    avatar?: Nullable<string>;
}

export type DateTime = any;
type Nullable<T> = T | null;
