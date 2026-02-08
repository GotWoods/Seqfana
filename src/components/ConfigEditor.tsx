import React, { ChangeEvent } from 'react';
import { InlineField, Input, SecretInput } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { SeqDataSourceOptions, SeqSecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<SeqDataSourceOptions> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as SeqSecureJsonData;

  const onURLChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: { ...options.jsonData, url: event.target.value },
    });
  };

  const onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        ...options.secureJsonData,
        apiKey: event.target.value,
      },
    });
  };

  const onResetAPIKey = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiKey: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiKey: '',
      },
    });
  };

  return (
    <div className="gf-form-group">
      <InlineField label="Seq URL" labelWidth={14} tooltip="URL of your Seq server, e.g. http://localhost:5341">
        <Input
          onChange={onURLChange}
          value={jsonData.url || ''}
          placeholder="http://localhost:5341"
          width={40}
        />
      </InlineField>

      <InlineField label="API Key" labelWidth={14} tooltip="Seq API key. Stored encrypted on the Grafana server and never sent to the browser.">
        <SecretInput
          isConfigured={(secureJsonFields && secureJsonFields.apiKey) as boolean}
          value={secureJsonData.apiKey || ''}
          placeholder="Enter API key (optional)"
          width={40}
          onReset={onResetAPIKey}
          onChange={onAPIKeyChange}
        />
      </InlineField>
    </div>
  );
}
