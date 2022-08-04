
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

export interface SignUpUserInput {
    username: string;
    password: string;
    email?: Nullable<string>;
    nickname?: Nullable<string>;
}

export interface SignInUserInput {
    username: string;
    password: string;
    rememberMe?: Nullable<boolean>;
}

export interface AccountBook {
    id: number;
    name: string;
    desc: string;
    admins: User[];
    members: User[];
}

export interface IMutation {
    createAccountBook(accountBook: AccountBookInput): AccountBook | Promise<AccountBook>;
    signIn(user: SignInUserInput): User | Promise<User>;
    signUp(user: SignUpUserInput): User | Promise<User>;
}

export interface IQuery {
    accountBooks(): AccountBook[] | Promise<AccountBook[]>;
    currentUser(): User | Promise<User>;
    users(name: string, pagination?: Nullable<Pagination>): User[] | Promise<User[]>;
}

export interface User {
    id: number;
    username: string;
    nickname: string;
    email?: Nullable<string>;
}

type Nullable<T> = T | null;
