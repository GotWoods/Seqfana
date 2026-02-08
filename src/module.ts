import { DataSourcePlugin } from '@grafana/data';
import { SeqDataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { SeqQuery, SeqDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<SeqDataSource, SeqQuery, SeqDataSourceOptions>(SeqDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);