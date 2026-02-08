import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
  DataFrameType,
  dateTime,
} from '@grafana/data';
import { getBackendSrv, getTemplateSrv } from '@grafana/runtime';
import { lastValueFrom, Observable } from 'rxjs';
import { SeqQuery, SeqDataSourceOptions, SeqApiResponse, DEFAULT_QUERY } from './types';

export class SeqDataSource extends DataSourceApi<SeqQuery, SeqDataSourceOptions> {
  baseUrl: string;

  constructor(instanceSettings: DataSourceInstanceSettings<SeqDataSourceOptions>) {
    super(instanceSettings);
    this.baseUrl = instanceSettings.url ?? '';
  }

  async query(options: DataQueryRequest<SeqQuery>): Promise<DataQueryResponse> {
    const targets = options.targets.filter((t) => !t.hide);
    const promises = targets.map((target) => this.doRequest(target, options));
    const results = await Promise.all(promises);
    return { data: results };
  }

  async doRequest(query: SeqQuery, options: DataQueryRequest<SeqQuery>): Promise<MutableDataFrame> {
    const templateSrv = getTemplateSrv();

    const from = options.range.from.toISOString();
    const to = options.range.to.toISOString();
    const count = String(query.count ?? DEFAULT_QUERY.count);

    const params = new URLSearchParams({
      fromDateUtc: from,
      toDateUtc: to,
      count,
    });

    const queryText = templateSrv.replace(query.query ?? '', options.scopedVars);
    const signalText = templateSrv.replace(query.signal ?? '', options.scopedVars);

    if (queryText) {
      params.set('filter', queryText);
    }

    if (signalText) {
      params.set('signal', signalText);
    }

    const url = `${this.baseUrl}/seq/api/events?${params.toString()}&render`;

    const response = await lastValueFrom(
      getBackendSrv().fetch<SeqApiResponse>({
        url,
        method: 'GET',
      }) as unknown as Observable<{ data: SeqApiResponse }>
    );

    return this.buildDataFrame(response.data, query);
  }

  buildDataFrame(data: SeqApiResponse, query: SeqQuery): MutableDataFrame {
    const frame = new MutableDataFrame({
      refId: query.refId,
      meta: {
        type: DataFrameType.LogLines,
        preferredVisualisationType: 'logs',
      },
      fields: [
        { name: 'timestamp', type: FieldType.time },
        { name: 'body', type: FieldType.string },
        { name: 'severity', type: FieldType.string },
        { name: 'id', type: FieldType.string },
        { name: 'labels', type: FieldType.other },
      ],
    });

    for (const event of data) {
      const timestamp = dateTime(event.Timestamp).valueOf();
      const body = event.RenderedMessage ?? event.MessageTemplateTokens.map((t) => t.Text ?? '').join('');
      const severity = event.Level ?? 'Information';
      const id = event.Id ?? '';

      const labels: Record<string, string> = {};
      for (const prop of event.Properties) {
        labels[prop.Name] = String(prop.Value);
      }
      if (event.Exception) {
        labels['exception'] = event.Exception;
      }

      frame.add({ timestamp, body, severity, id, labels });
    }

    return frame;
  }

  async testDatasource() {
    const url = `${this.baseUrl}/seq/api/events?count=1&render`;
    await lastValueFrom(
      getBackendSrv().fetch<SeqApiResponse>({
        url,
        method: 'GET',
      }) as unknown as Observable<{ data: SeqApiResponse }>
    );
    return {
      status: 'success',
      message: 'Successfully connected to Seq server',
    };
  }
}
