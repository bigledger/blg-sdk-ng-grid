import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError, timer, EMPTY } from 'rxjs';
import { map, catchError, retry, timeout, share, switchMap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import {
  DataSourceConfig,
  DataConnectionConfig,
  AuthenticationConfig,
  DataQueryConfig,
  DataTransformation,
  DataAggregation
} from '../interfaces/dashboard.interface.ts';

@Injectable({
  providedIn: 'root'
})
export class DataConnectorService {
  private readonly webSocketConnections = new Map<string, WebSocketSubject<any>>();
  private readonly cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  constructor(private http: HttpClient) {}

  /**
   * Load data from configured data source
   */
  loadData(config: DataSourceConfig, filters: Record<string, any> = {}): Observable<any> {
    // Check cache first
    const cacheKey = this.getCacheKey(config, filters);
    const cached = this.getCachedData(cacheKey, config.caching);
    if (cached) {
      return of(cached);
    }

    let data$: Observable<any>;

    switch (config.type) {
      case 'rest-api':
        data$ = this.loadFromRestApi(config, filters);
        break;
      case 'graphql':
        data$ = this.loadFromGraphQL(config, filters);
        break;
      case 'websocket':
        data$ = this.loadFromWebSocket(config, filters);
        break;
      case 'csv':
        data$ = this.loadFromCsv(config, filters);
        break;
      case 'excel':
        data$ = this.loadFromExcel(config, filters);
        break;
      case 'database':
        data$ = this.loadFromDatabase(config, filters);
        break;
      case 'bigquery':
        data$ = this.loadFromBigQuery(config, filters);
        break;
      case 'static':
        data$ = this.loadStaticData(config, filters);
        break;
      default:
        return throwError(() => new Error(`Unsupported data source type: ${config.type}`));
    }

    return data$.pipe(
      timeout(config.connection.timeout || 30000),
      retry(config.connection.retries || 0),
      map(data => this.processData(data, config.query)),
      map(data => {
        // Cache the result
        if (config.caching?.enabled) {
          this.cacheData(cacheKey, data, config.caching);
        }
        return data;
      }),
      catchError(error => {
        console.error('Data loading error:', error);
        return throwError(() => error);
      }),
      share()
    );
  }

  /**
   * Subscribe to real-time data updates
   */
  subscribeToRealTime(config: DataSourceConfig): Observable<any> {
    if (config.type !== 'websocket') {
      return EMPTY;
    }

    const connectionKey = `${config.id}_realtime`;
    
    if (!this.webSocketConnections.has(connectionKey)) {
      const ws = webSocket({
        url: config.connection.url!,
        protocol: this.getWebSocketProtocol(config.connection.authentication)
      });
      
      this.webSocketConnections.set(connectionKey, ws);
    }

    const ws = this.webSocketConnections.get(connectionKey)!;
    
    return ws.asObservable().pipe(
      map(data => this.processData(data, config.query)),
      catchError(error => {
        console.error('WebSocket error:', error);
        this.webSocketConnections.delete(connectionKey);
        return throwError(() => error);
      })
    );
  }

  /**
   * Load data from REST API
   */
  private loadFromRestApi(config: DataSourceConfig, filters: Record<string, any>): Observable<any> {
    const { url, method = 'GET', headers = {} } = config.connection;
    const authHeaders = this.getAuthHeaders(config.connection.authentication);
    
    const httpHeaders = new HttpHeaders({
      ...headers,
      ...authHeaders
    });

    const params = this.buildHttpParams(config.query, filters);

    if (method.toUpperCase() === 'GET') {
      return this.http.get(url!, { headers: httpHeaders, params });
    } else if (method.toUpperCase() === 'POST') {
      const body = this.buildRequestBody(config.query, filters);
      return this.http.post(url!, body, { headers: httpHeaders });
    } else {
      return throwError(() => new Error(`Unsupported HTTP method: ${method}`));
    }
  }

  /**
   * Load data from GraphQL endpoint
   */
  private loadFromGraphQL(config: DataSourceConfig, filters: Record<string, any>): Observable<any> {
    const { url, headers = {} } = config.connection;
    const authHeaders = this.getAuthHeaders(config.connection.authentication);
    
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      ...headers,
      ...authHeaders
    });

    const query = this.buildGraphQLQuery(config.query, filters);
    const body = {
      query,
      variables: filters
    };

    return this.http.post(url!, body, { headers: httpHeaders }).pipe(
      map((response: any) => {
        if (response.errors) {
          throw new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`);
        }
        return response.data;
      })
    );
  }

  /**
   * Load data from WebSocket
   */
  private loadFromWebSocket(config: DataSourceConfig, filters: Record<string, any>): Observable<any> {
    return this.subscribeToRealTime(config);
  }

  /**
   * Load data from CSV file
   */
  private loadFromCsv(config: DataSourceConfig, filters: Record<string, any>): Observable<any> {
    return this.http.get(config.connection.url!, { responseType: 'text' }).pipe(
      map(csvData => this.parseCsv(csvData)),
      map(data => this.applyFilters(data, filters))
    );
  }

  /**
   * Load data from Excel file
   */
  private loadFromExcel(config: DataSourceConfig, filters: Record<string, any>): Observable<any> {
    return this.http.get(config.connection.url!, { responseType: 'arraybuffer' }).pipe(
      map(buffer => this.parseExcel(buffer)),
      map(data => this.applyFilters(data, filters))
    );
  }

  /**
   * Load data from database
   */
  private loadFromDatabase(config: DataSourceConfig, filters: Record<string, any>): Observable<any> {
    // This would typically go through a backend API
    const { url } = config.connection;
    const authHeaders = this.getAuthHeaders(config.connection.authentication);
    
    const httpHeaders = new HttpHeaders(authHeaders);
    const body = {
      query: config.query.query,
      parameters: { ...config.query.parameters, ...filters }
    };

    return this.http.post(`${url}/execute`, body, { headers: httpHeaders });
  }

  /**
   * Load data from BigQuery
   */
  private loadFromBigQuery(config: DataSourceConfig, filters: Record<string, any>): Observable<any> {
    const { url } = config.connection;
    const authHeaders = this.getAuthHeaders(config.connection.authentication);
    
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      ...authHeaders
    });

    const body = {
      query: this.buildBigQuerySQL(config.query, filters),
      useLegacySql: false
    };

    return this.http.post(`${url}/queries`, body, { headers: httpHeaders }).pipe(
      map((response: any) => response.rows || [])
    );
  }

  /**
   * Load static data
   */
  private loadStaticData(config: DataSourceConfig, filters: Record<string, any>): Observable<any> {
    // Static data would be embedded in the query configuration
    const data = config.query.parameters?.data || [];
    return of(this.applyFilters(data, filters));
  }

  /**
   * Process loaded data with transformations and aggregations
   */
  private processData(data: any, query: DataQueryConfig): any {
    let processedData = data;

    // Apply transformations
    if (query.transformations) {
      for (const transformation of query.transformations) {
        processedData = this.applyTransformation(processedData, transformation);
      }
    }

    // Apply aggregations
    if (query.aggregations) {
      processedData = this.applyAggregations(processedData, query.aggregations);
    }

    return processedData;
  }

  /**
   * Apply data transformation
   */
  private applyTransformation(data: any[], transformation: DataTransformation): any[] {
    switch (transformation.type) {
      case 'filter':
        return this.filterData(data, transformation.config);
      case 'sort':
        return this.sortData(data, transformation.config);
      case 'group':
        return this.groupData(data, transformation.config);
      case 'calculate':
        return this.calculateData(data, transformation.config);
      case 'join':
        return this.joinData(data, transformation.config);
      default:
        return data;
    }
  }

  /**
   * Apply data aggregations
   */
  private applyAggregations(data: any[], aggregations: DataAggregation[]): any[] {
    const groups = new Map<string, any[]>();
    
    // Group data for aggregation
    data.forEach(row => {
      const key = 'total'; // Simplified grouping
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });

    // Apply aggregations
    const result: any[] = [];
    groups.forEach((groupData, key) => {
      const aggregatedRow: any = {};
      
      aggregations.forEach(agg => {
        const values = groupData.map(row => row[agg.field]).filter(v => v != null);
        const fieldName = agg.alias || agg.field;
        
        switch (agg.operation) {
          case 'sum':
            aggregatedRow[fieldName] = values.reduce((sum, val) => sum + Number(val), 0);
            break;
          case 'avg':
            aggregatedRow[fieldName] = values.reduce((sum, val) => sum + Number(val), 0) / values.length;
            break;
          case 'count':
            aggregatedRow[fieldName] = values.length;
            break;
          case 'min':
            aggregatedRow[fieldName] = Math.min(...values.map(Number));
            break;
          case 'max':
            aggregatedRow[fieldName] = Math.max(...values.map(Number));
            break;
          case 'distinct':
            aggregatedRow[fieldName] = new Set(values).size;
            break;
        }
      });
      
      result.push(aggregatedRow);
    });

    return result;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(auth?: AuthenticationConfig): Record<string, string> {
    if (!auth || auth.type === 'none') {
      return {};
    }

    switch (auth.type) {
      case 'basic':
        const basicAuth = btoa(`${auth.credentials!.username}:${auth.credentials!.password}`);
        return { Authorization: `Basic ${basicAuth}` };
      case 'bearer':
        return { Authorization: `Bearer ${auth.credentials!.token}` };
      case 'api-key':
        return { [auth.credentials!.keyName || 'X-API-Key']: auth.credentials!.keyValue };
      default:
        return {};
    }
  }

  /**
   * Build HTTP parameters from query config
   */
  private buildHttpParams(query: DataQueryConfig, filters: Record<string, any>): HttpParams {
    let params = new HttpParams();
    
    const allParams = { ...query.parameters, ...filters };
    Object.entries(allParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });
    
    return params;
  }

  /**
   * Build request body for POST requests
   */
  private buildRequestBody(query: DataQueryConfig, filters: Record<string, any>): any {
    return {
      ...query.parameters,
      ...filters,
      query: query.query
    };
  }

  /**
   * Build GraphQL query with variables
   */
  private buildGraphQLQuery(query: DataQueryConfig, filters: Record<string, any>): string {
    let graphqlQuery = query.query || '';
    
    // Replace variables in query
    Object.entries(filters).forEach(([key, value]) => {
      graphqlQuery = graphqlQuery.replace(new RegExp(`\\$${key}`, 'g'), JSON.stringify(value));
    });
    
    return graphqlQuery;
  }

  /**
   * Build BigQuery SQL with parameters
   */
  private buildBigQuerySQL(query: DataQueryConfig, filters: Record<string, any>): string {
    let sql = query.query || '';
    
    // Replace parameters in SQL
    Object.entries({ ...query.parameters, ...filters }).forEach(([key, value]) => {
      sql = sql.replace(new RegExp(`@${key}`, 'g'), this.formatSQLValue(value));
    });
    
    return sql;
  }

  /**
   * Format value for SQL queries
   */
  private formatSQLValue(value: any): string {
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    }
    return String(value);
  }

  /**
   * Parse CSV data
   */
  private parseCsv(csvData: string): any[] {
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || null;
      });
      return row;
    });
    
    return data;
  }

  /**
   * Parse Excel data (simplified implementation)
   */
  private parseExcel(buffer: ArrayBuffer): any[] {
    // This would typically use a library like SheetJS
    // For now, return empty array
    console.warn('Excel parsing not implemented');
    return [];
  }

  /**
   * Apply filters to data
   */
  private applyFilters(data: any[], filters: Record<string, any>): any[] {
    return data.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return true;
        }
        return row[key] === value;
      });
    });
  }

  /**
   * Filter data based on transformation config
   */
  private filterData(data: any[], config: any): any[] {
    return data.filter(row => {
      return Object.entries(config).every(([key, value]) => {
        return row[key] === value;
      });
    });
  }

  /**
   * Sort data based on transformation config
   */
  private sortData(data: any[], config: any): any[] {
    const { field, direction = 'asc' } = config;
    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Group data based on transformation config
   */
  private groupData(data: any[], config: any): any[] {
    const { field } = config;
    const groups = new Map<any, any[]>();
    
    data.forEach(row => {
      const key = row[field];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });
    
    return Array.from(groups.entries()).map(([key, values]) => ({
      [field]: key,
      items: values,
      count: values.length
    }));
  }

  /**
   * Calculate new fields based on transformation config
   */
  private calculateData(data: any[], config: any): any[] {
    const { field, formula } = config;
    
    return data.map(row => ({
      ...row,
      [field]: this.evaluateFormula(formula, row)
    }));
  }

  /**
   * Join data based on transformation config
   */
  private joinData(data: any[], config: any): any[] {
    // Simplified join implementation
    return data;
  }

  /**
   * Evaluate formula (simplified implementation)
   */
  private evaluateFormula(formula: string, row: any): any {
    // This would need a proper expression evaluator
    // For now, handle simple cases
    try {
      // Replace field references with values
      let expression = formula;
      Object.entries(row).forEach(([key, value]) => {
        expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
      });
      
      // Simple arithmetic evaluation (UNSAFE - would need proper parser in production)
      return new Function(`return ${expression}`)();
    } catch {
      return null;
    }
  }

  /**
   * Get WebSocket protocol based on authentication
   */
  private getWebSocketProtocol(auth?: AuthenticationConfig): string | undefined {
    if (!auth || auth.type === 'none') {
      return undefined;
    }
    // Return appropriate protocol based on auth type
    return undefined;
  }

  /**
   * Generate cache key for data request
   */
  private getCacheKey(config: DataSourceConfig, filters: Record<string, any>): string {
    return `${config.id}_${JSON.stringify(filters)}`;
  }

  /**
   * Get cached data if valid
   */
  private getCachedData(key: string, caching?: any): any | null {
    if (!caching?.enabled) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Cache data with TTL
   */
  private cacheData(key: string, data: any, caching: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: caching.ttl * 1000 // Convert to milliseconds
    });
  }
}