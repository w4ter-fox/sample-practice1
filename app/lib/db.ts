import Dexie, { type Table } from 'dexie';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Log {
  id: string;
  date: string;    // ISO文字列（開始日時）
  minutes: number;
  tagId: string;   // tagIdに統一
}

export class StudyDatabase extends Dexie {
  tags!: Table<Tag>;
  logs!: Table<Log>;

  constructor() {
    super('StudyTimerDB');
    this.version(1).stores({
      tags: 'id, name',
      logs: 'id, date, tagId'
    });
  }
}

export const db = new StudyDatabase();