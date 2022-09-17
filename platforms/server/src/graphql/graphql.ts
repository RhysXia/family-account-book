
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum CategoryType {
    POSITIVE_AMOUNT = "POSITIVE_AMOUNT",
    NEGATIVE_AMOUNT = "NEGATIVE_AMOUNT",
    POSITIVE_OR_NEGATIVE_AMOUNT = "POSITIVE_OR_NEGATIVE_AMOUNT"
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
    traderId?: Nullable<string>;
    savingAccountId?: Nullable<string>;
    startDate?: Nullable<Date>;
    endDate?: Nullable<Date>;
}

export interface FlowRecordTotalAmountPerTraderFilter {
    categoryId?: Nullable<string>;
    savingAccountId?: Nullable<string>;
    startDate?: Nullable<Date>;
    endDate?: Nullable<Date>;
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

export interface CreateSavingAccountTransferRecord {
    name: string;
    desc?: Nullable<string>;
    amount: number;
    fromSavingAccountId: string;
    toSavingAccountId: string;
    dealAt: Date;
    traderId: string;
}

export interface UpdateSavingAccountTransferRecord {
    id: string;
    name?: Nullable<string>;
    desc?: Nullable<string>;
    amount?: Nullable<number>;
    fromSavingAccountId?: Nullable<string>;
    toSavingAccountId?: Nullable<string>;
    dealAt?: Nullable<Date>;
    traderId?: Nullable<string>;
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
    admins: User[];
    members: User[];
    creator: User;
    updater: User;
    createdAt: DateTime;
    updatedAt: DateTime;
    savingAccounts: SavingAccountListWithPagintion;
    savingAccount: SavingAccount;
    tags?: Nullable<TagListWithPagintion>;
    tag: Tag;
    flowRecords: FlowRecordListWithPagintion;
    flowRecord: FlowRecord;
    categories: CategoryListWithPagintion;
    category: Category;
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
    createSavingAccountTransferRecord(record: CreateSavingAccountTransferRecord): SavingAccountTransferRecord | Promise<SavingAccountTransferRecord>;
    updateSavingAccountTransferRecord(record: UpdateSavingAccountTransferRecord): SavingAccountTransferRecord | Promise<SavingAccountTransferRecord>;
    deleteSavingAccountTransferRecord(id: string): boolean | Promise<boolean>;
    createTag(tag: CreateTagInput): Tag | Promise<Tag>;
    updateTag(tag: UpdateTagInput): Tag | Promise<Tag>;
    deleteTag(id: string): boolean | Promise<boolean>;
    signIn(user: SignInUserInput): User | Promise<User>;
    signUp(user: SignUpUserInput): User | Promise<User>;
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
}

export interface Category extends EntityDateTime {
    id: string;
    name: string;
    desc?: Nullable<string>;
    type: CategoryType;
    accountBook: AccountBook;
    tags?: Nullable<TagListWithPagintion>;
    tag: Tag;
    creator: User;
    updater: User;
    createdAt: DateTime;
    updatedAt: DateTime;
    statistics: CategoryStatistics;
}

export interface CategoryListWithPagintion {
    total: number;
    data: Category[];
}

export interface CategoryStatistics {
    id: string;
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
    trader: User;
    creator: User;
    updater: User;
    amount: number;
    accountBook: AccountBook;
    savingAccount: SavingAccount;
    tag: Tag;
}

export interface IQuery {
    node(id: string): Node | Promise<Node>;
    nodes(ids: string[]): Node[] | Promise<Node[]>;
    getCurrentUser(): DetailUser | Promise<DetailUser>;
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
    createdAt: DateTime;
    updatedAt: DateTime;
    amount: number;
    creator: User;
    updater: User;
    accountBook: AccountBook;
    getHistoriesByDate: SavingAccountHistory[];
    flowRecords: FlowRecordListWithPagintion;
    flowRecord: FlowRecord;
}

export interface SavingAccountHistory {
    id: string;
    amount: number;
    dealAt: Date;
    savingAccount: SavingAccount;
    accountBook: AccountBook;
}

export interface SavingAccountTransferRecord extends EntityDateTime {
    id: string;
    name: string;
    desc?: Nullable<string>;
    amount: number;
    trader: User;
    creator: User;
    updater: User;
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
    desc?: Nullable<string>;
    category: Category;
    createdAt: DateTime;
    updatedAt: DateTime;
    creator: User;
    updater: User;
    accountBook: AccountBook;
    flowRecords: FlowRecordListWithPagintion;
    flowRecord: FlowRecord;
}

export interface DetailUser extends EntityDateTime {
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
    createdAt: DateTime;
    updatedAt: DateTime;
}

export type DateTime = Date;
export type Node = User | AccountBook | AccountBookStatistics | SavingAccount | Tag | FlowRecord | SavingAccountTransferRecord | SavingAccountHistory | Category | CategoryStatistics;
type Nullable<T> = T | null;
