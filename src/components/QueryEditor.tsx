import React, { ChangeEvent } from 'react';
import { InlineField, Input, TextArea } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { SeqDataSource } from '../datasource';
import { SeqDataSourceOptions, SeqQuery, DEFAULT_QUERY } from '../types';

type Props = QueryEditorProps<SeqDataSource, SeqQuery, SeqDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onQueryTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...query, query: event.target.value });
  };

  const onSignalChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, signal: event.target.value });
  };

  const onCountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    onChange({ ...query, count: isNaN(value) ? DEFAULT_QUERY.count : value });
  };

  const { query: queryText, signal, count } = query;

  return (
    <div className="gf-form-group">
      <InlineField label="Filter" labelWidth={14} tooltip="Seq filter expression. Supports template variables like $app or $level.">
        <TextArea
          onChange={onQueryTextChange}
          onBlur={onRunQuery}
          value={queryText ?? ''}
          placeholder="@Level = 'Error' or @Message like '%exception%'"
          rows={3}
          cols={60}
        />
      </InlineField>

      <InlineField label="Signal" labelWidth={14} tooltip="Seq signal name (optional). Supports template variables.">
        <Input
          onChange={onSignalChange}
          onBlur={onRunQuery}
          value={signal ?? ''}
          placeholder="Signal name"
          width={40}
        />
      </InlineField>

      <InlineField label="Count" labelWidth={14} tooltip="Maximum number of events to return (1-10000)">
        <Input
          type="number"
          onChange={onCountChange}
          onBlur={onRunQuery}
          value={count ?? DEFAULT_QUERY.count}
          min={1}
          max={10000}
          width={10}
        />
      </InlineField>
    </div>
  );
}
