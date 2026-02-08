import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface SeqQuery extends DataQuery {
  query?: string;
  signal?: string;
  count?: number;
}

export const DEFAULT_QUERY: Partial<SeqQuery> = {
  count: 100,
};

export interface SeqDataSourceOptions extends DataSourceJsonData {
  url?: string;
}

export interface SeqSecureJsonData {
  apiKey?: string;
}

export interface SeqEventProperty {
  Name: string;
  Value: any;
}

export interface SeqMessageToken {
  Text?: string;
  PropertyName?: string;
}

export interface SeqEvent {
  Timestamp: string;
  Properties: SeqEventProperty[];
  MessageTemplateTokens: SeqMessageToken[];
  RenderedMessage?: string;
  EventType: string;
  Level: string;
  Exception?: string;
  Id: string;
}

export type SeqApiResponse = SeqEvent[];
