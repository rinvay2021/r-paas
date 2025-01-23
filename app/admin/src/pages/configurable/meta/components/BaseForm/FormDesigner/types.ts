export interface Container {
  id: string;
  title: string;
  fields: Field[];
  columns: 1 | 2 | 3;
}

export interface Field {
  id: string;
  appCode: string;
  metaObjectCode: string;
  fieldCode: string;
  name: string;
  type: string;
}

export interface FormConfig {
  columns: 1 | 2 | 3;
  name: string;
}
