import db from "./Dexie";
import { Database, UnitOfDBWork } from "./Database";
import { File as JFile } from "../file/File";
import { JournalSettings, DefaultSettings } from "../settings/JournalSettings";
import { Tag } from "../tags/Tag";
import { importFromJsonFile, exportToJson } from "./DatabaseBackup";
import { newId } from "../../util/Identity";
import { CodeFile } from "../code-editor/CodeFile";

const files = db.table<JFile, any>("files");
const settings = db.table<JournalSettings, any>("settings");
const tags = db.table<Tag, any>("tags");
const code = db.table<CodeFile, any>("code");

const ensureSettings = async () => {
  const records = await settings.toArray();
  if (records.length == 0) {
    await settings.add(DefaultSettings);
  }
};
ensureSettings();

export const JournalDatabase: Database = {
  getCollections: async () => {
    const results: JFile[] = [];
    await files.each((item) => {
      const { data, ...rest } = item;
      return results.push(rest);
    });
    return results;
  },
  getFile: async (id: string): Promise<JFile | undefined> => {
    return await files.get(id);
  },

  deleteFiles: async (ids: string[]): Promise<void> => {
    return await files.bulkDelete(ids);
  },

  addFile: async (file: JFile): Promise<void> => {
    if (!file.id) {
      file.id = newId();
    }
    file.locked = false;
    return files.add(file, file.id);
  },

  updateFile: async (id: string, changes: Partial<JFile>): Promise<number> => {
    return files.update(id, changes);
  },

  getCode: async (id: string): Promise<CodeFile | undefined> => {
    return await code.get(id);
  },
  getAllCodes: async (ids: string[]) => {
    return code.bulkGet(ids);
  },
  deleteCode: async (id: string): Promise<void> => {
    return await code.delete(id);
  },

  addCode: async (item: CodeFile): Promise<void> => {
    if (!item.id) {
      item.id = newId();
    }
    return code.add(item, item.id);
  },

  updateCode: async (
    id: string,
    changes: Partial<CodeFile>
  ): Promise<number> => {
    return code.update(id, changes);
  },

  getChildren: async (fileId: string, page: number, pageSize: number) => {
    let results: JFile[] = [];
    let count = 0;
    // TODO look at optimising this. It shoudln't be an issue for listing
    // files and folders but could be for images later.
    // See https://github.com/dfahlander/Dexie.js/issues/838
    count = await files.where("parentId").equals(fileId).count();
    results = await files
      .where("parentId")
      .equals(fileId)
      .reverse()
      .offset(page * pageSize)
      .limit(pageSize)
      .toArray();

    return { items: results, count, page, pageSize };
  },
  getSettings: async (): Promise<JournalSettings> => {
    const records = await settings.toArray();
    return records[0];
  },

  updateSettings: async (updated: JournalSettings) => {
    return settings.update(updated.id, updated);
  },

  getTags: (): Promise<Tag[]> => {
    return tags.toArray();
  },
  addTag: () => {
    return tags.add({
      name: "My tag",
      color: "mediumseagreen",
    } as Tag);
  },
  deleteTag: (tag: Tag) => {
    return tags.delete(tag.id);
  },
  updateTag: (tag: Tag) => {
    return tags.update(tag.id, tag);
  },

  transact: (work: UnitOfDBWork, tables: string[]) => {
    return db.transaction("rw", tables, work);
  },

  exportDb: async () => {
    const json = await exportToJson(db.backendDB());
    return new Blob([json], { type: "application/json" });
  },
  importDb: (file: File) => {
    return importFromJsonFile(db.backendDB(), file, true);
  },

  delete: () => {
    return db.delete();
  },
};