import { Resolver } from '@nestjs/graphql';

export type CategoryStatistics = {
  id: string;
};

@Resolver('CategoryStatistics')
export class CategoryStatisticsResolver {}
