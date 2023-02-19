
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum CategoryType {
    INCOME = "INCOME",
    EXPENDITURE = "EXPENDITURE",
    UNKNOWN = "UNKNOWN"
}

export enum CacheControlScope {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE"
}

export enum Direction {
    DESC = "DESC",
    ASC = "ASC"
}

export enum DateGroupBy {
    YEAR = "YEAR",
    MONTH = "MONTH",
    DAY = "DAY"
}

export interface AccountBookTagFilter {
    categoryId?: Nullable<string>;
}

export interface AccountBookFlowRecordFilter {
    traderId?: Nullable<string>;
    tagId?: Nullable<string>;
    categoryId?: Nullable<string>;
    savingAccountId?: Nullable<string>;
    startDealAt?: Nullable<Date>;
    endDealAt?: Nullable<Date>;
}

export interface AccountBookCategoryFilter {
    type?: Nullable<CategoryType>;
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

export interface FlowRecordTotalAmountFilter {
    categoryId?: Nullable<string>;
    categoryType?: Nullable<CategoryType>;
    traderId?: Nullable<string>;
    savingAccountId?: Nullable<string>;
    tagId?: Nullable<string>;
    startDealAt?: Nullable<Date>;
    endDealAt?: Nullable<Date>;
}

export interface FlowRecordTotalAmountPerTraderFilter {
    categoryId?: Nullable<string>;
    categoryType?: Nullable<CategoryType>;
    tagId?: Nullable<string>;
    savingAccountId?: Nullable<string>;
    startDealAt?: Nullable<Date>;
    endDealAt?: Nullable<Date>;
}

export interface FlowRecordTotalAmountPerCategoryFilter {
    categoryType?: Nullable<CategoryType>;
    traderId?: Nullable<string>;
    savingAccountId?: Nullable<string>;
    tagId?: Nullable<string>;
    startDealAt?: Nullable<Date>;
    endDealAt?: Nullable<Date>;
}

export interface CategoryFlowRecordFilter {
    savingAccountId?: Nullable<string>;
    tagId?: Nullable<string>;
    traderId?: Nullable<string>;
}

export interface CreateCategoryInput {
    name: string;
    desc?: Nullable<string>;
    type: CategoryType;
    accountBookId: string;
}

export interface UpdateCategoryInput {
    id: string;
    name?: Nullable<string>;
    desc?: Nullable<string>;
}

export interface FlowRecordTotalAmountPerTagFilter {
    traderId?: Nullable<string>;
    tagId?: Nullable<string>;
    savingAccountId?: Nullable<string>;
    startDealAt?: Nullable<Date>;
    endDealAt?: Nullable<Date>;
}

export interface CreateFlowRecordInput {
    desc?: Nullable<string>;
    dealAt: Date;
    amount: number;
    savingAccountId: string;
    tagId: string;
    traderId: string;
}

export interface UpdateFlowRecordInput {
    id: string;
    desc?: Nullable<string>;
    dealAt?: Nullable<Date>;
    amount?: Nullable<number>;
    savingAccountId?: Nullable<string>;
    tagId?: Nullable<string>;
    traderId?: Nullable<string>;
}

export interface SavingAccountFlowRecordFilter {
    tagId?: Nullable<string>;
    categoryId?: Nullable<string>;
    traderId?: Nullable<string>;
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

export interface TagFlowRecordFilter {
    savingAccountId?: Nullable<string>;
    traderId?: Nullable<string>;
}

export interface CreateTagInput {
    name: string;
    desc?: Nullable<string>;
    categoryId: string;
}

export interface UpdateTagInput {
    id: string;
    name?: Nullable<string>;
    desc?: Nullable<string>;
    categoryId?: Nullable<string>;
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

export interface OrderBy {
    field: string;
    direction: Direction;
}

export interface Pagination {
    limit?: Nullable<number>;
    offset?: Nullable<number>;
    orderBy?: Nullable<OrderBy[]>;
}

export interface EntityDateTime {
    createdAt: DateTime;
    createdBy: User;
    updatedAt: DateTime;
    updatedBy: User;
}

export interface AccountBookListWithPagintion {
    total: number;
    data: AccountBook[];
}

export interface AccountBook extends EntityDateTime {
    id: string;
    name: string;
    desc?: Nullable<string>;
    admins: User[];
    members: User[];
    createdAt: DateTime;
    createdBy: User;
    updatedAt: DateTime;
    updatedBy: User;
    savingAccounts: SavingAccountListWithPagintion;
    savingAccount: SavingAccount;
    categories: CategoryListWithPagintion;
    category: Category;
    tags?: Nullable<TagListWithPagintion>;
    tag: Tag;
    flowRecords: FlowRecordListWithPagintion;
    flowRecord: FlowRecord;
    statistics: AccountBookStatistics;
}

export interface IMutation {
    createAccountBook(accountBook: CreateAccountBookInput): AccountBook | Promise<AccountBook>;
    updateAccountBook(accountBook: UpdateAccountBookInput): AccountBook | Promise<AccountBook>;
    deleteAccountBook(id: string): boolean | Promise<boolean>;
    createCategory(category: CreateCategoryInput): Category | Promise<Category>;
    updateCategory(category: UpdateCategoryInput): Category | Promise<Category>;
    deleteCategory(id: string): boolean | Promise<boolean>;
    createFlowRecord(flowRecord: CreateFlowRecordInput): FlowRecord | Promise<FlowRecord>;
    updateFlowRecord(flowRecord: UpdateFlowRecordInput): FlowRecord | Promise<FlowRecord>;
    deleteFlowRecord(id: string): boolean | Promise<boolean>;
    createSavingAccount(savingAccount: CreateSavingAccountInput): SavingAccount | Promise<SavingAccount>;
    updateSavingAccount(savingAccount: UpdateSavingAccountInput): SavingAccount | Promise<SavingAccount>;
    deleteSavingAccount(id: string): boolean | Promise<boolean>;
    createTag(tag: CreateTagInput): Tag | Promise<Tag>;
    updateTag(tag: UpdateTagInput): Tag | Promise<Tag>;
    deleteTag(id: string): boolean | Promise<boolean>;
    signIn(user: SignInUserInput): DetailUser | Promise<DetailUser>;
    signUp(user: SignUpUserInput): DetailUser | Promise<DetailUser>;
}

export interface FlowRecordTotalAmountPerCategory {
    category: Category;
    amount: number;
}

export interface FlowRecordTotalAmountPerUser {
    trader: User;
    amount: number;
}

export interface FlowRecordTotalAmountGroupByDate {
    dealAt: string;
    amount: number;
}

export interface FlowRecordTotalAmountPerUserGroupByDate {
    trader: User;
    amountPerDate: FlowRecordTotalAmountGroupByDate[];
}

export interface AccountBookStatistics {
    id: string;
    flowRecordTotalAmount: number;
    flowRecordTotalAmountPerTrader: FlowRecordTotalAmountPerUser[];
    flowRecordTotalAmountGroupByDate: FlowRecordTotalAmountGroupByDate[];
    flowRecordTotalAmountPerTraderGroupByDate: FlowRecordTotalAmountPerUserGroupByDate[];
    flowRecordTotalAmountPerCategory: FlowRecordTotalAmountPerCategory[];
}

export interface Category extends EntityDateTime {
    id: string;
    name: string;
    desc?: Nullable<string>;
    type: CategoryType;
    order: number;
    accountBook: AccountBook;
    createdAt: DateTime;
    createdBy: User;
    updatedAt: DateTime;
    updatedBy: User;
    tags?: Nullable<TagListWithPagintion>;
    tag: Tag;
    flowRecords: FlowRecordListWithPagintion;
    flowRecord: FlowRecord;
    statistics: CategoryStatistics;
}

export interface CategoryListWithPagintion {
    total: number;
    data: Category[];
}

export interface FlowRecordTotalAmountPerTag {
    tag: Tag;
    amount: number;
}

export interface FlowRecordTotalAmountPerTagAndTrader {
    trader: User;
    data: FlowRecordTotalAmountPerTag[];
}

export interface CategoryStatistics {
    id: string;
    flowRecordTotalAmountPerTag: FlowRecordTotalAmountPerTag[];
    flowRecordTotalAmountPerTagAndTrader: FlowRecordTotalAmountPerTagAndTrader[];
}

export interface FlowRecordListWithPagintion {
    total: number;
    data: FlowRecord[];
}

export interface FlowRecord extends EntityDateTime {
    id: string;
    desc?: Nullable<string>;
    createdAt: DateTime;
    createdBy: User;
    updatedAt: DateTime;
    updatedBy: User;
    dealAt: Date;
    trader: User;
    amount: number;
    accountBook: AccountBook;
    savingAccount: SavingAccount;
    tag: Tag;
}

export interface IQuery {
    node(id: string): Node | Promise<Node>;
    nodes(ids: string[]): Node[] | Promise<Node[]>;
    currentUser(): DetailUser | Promise<DetailUser>;
    findUserListByNameLike(name: string, limit?: Nullable<number>, includeSelf?: Nullable<boolean>): User[] | Promise<User[]>;
}

export interface SavingAccountListWithPagintion {
    total: number;
    data: SavingAccount[];
}

export interface SavingAccount extends EntityDateTime {
    id: string;
    name: string;
    desc?: Nullable<string>;
    order: number;
    createdAt: DateTime;
    createdBy: User;
    updatedAt: DateTime;
    updatedBy: User;
    amount: number;
    accountBook: AccountBook;
    flowRecords: FlowRecordListWithPagintion;
    flowRecord: FlowRecord;
}

export interface TagListWithPagintion {
    total: number;
    data: Tag[];
}

export interface Tag extends EntityDateTime {
    id: string;
    name: string;
    desc?: Nullable<string>;
    order: number;
    createdAt: DateTime;
    createdBy: User;
    updatedAt: DateTime;
    updatedBy: User;
    accountBook: AccountBook;
    category: Category;
    flowRecords: FlowRecordListWithPagintion;
    flowRecord: FlowRecord;
}

export interface DetailUser {
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

export interface User {
    id: string;
    nickname: string;
    username: string;
    email?: Nullable<string>;
    avatar?: Nullable<string>;
}

export type DateTime = Date;
export type Node = User | AccountBook | AccountBookStatistics | SavingAccount | Tag | FlowRecord | Category | CategoryStatistics;
type Nullable<T> = T | null;
