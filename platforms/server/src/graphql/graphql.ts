
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface ProjectInput {
    username: string;
    password: string;
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
}

export interface Project {
    id: number;
    name: string;
    desc: string;
}

export interface IMutation {
    createProject(user: ProjectInput): Project | Promise<Project>;
    signIn(user: SignInUserInput): User | Promise<User>;
    signUp(user: SignUpUserInput): User | Promise<User>;
}

export interface User {
    id: number;
    username: string;
    nickname: string;
    email?: Nullable<string>;
}

export interface IQuery {
    currentUser(): User | Promise<User>;
}

type Nullable<T> = T | null;
