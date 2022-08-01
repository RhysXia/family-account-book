
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface IQuery {
    users(): User[] | Promise<User[]>;
}

export interface User {
    id: number;
    username: string;
}

type Nullable<T> = T | null;
