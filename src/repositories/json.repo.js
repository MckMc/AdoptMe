import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class JsonRepo {
    constructor(fileRelativePath) {
        this.filePath = path.join(__dirname, '..', 'data', fileRelativePath);
    }

    async _read() {
        try {
        const txt = await fs.readFile(this.filePath, 'utf8');
            return txt.trim() ? JSON.parse(txt) : [];
        } catch (e) {
        if (e.code === 'ENOENT') {
            await fs.writeFile(this.filePath, '[]');
            return [];
        }
        throw e;
        }
    }

    async _write(data) {
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    }

  // helpers
    async getAll() { return this._read(); }
    async getById(id) {
        const all = await this._read();
        return all.find(x => String(x.id) === String(id)) || null;
    }
    async insert(obj) {
        const all = await this._read();
        all.push(obj);
        await this._write(all);
        return obj;
    }
    async updateById(id, patch) {
        const all = await this._read();
        const idx = all.findIndex(x => String(x.id) === String(id));
        if (idx === -1) return null;
        all[idx] = { ...all[idx], ...patch, id: all[idx].id };
        await this._write(all);
        return all[idx];
    }
    async deleteById(id) {
        const all = await this._read();
        const idx = all.findIndex(x => String(x.id) === String(id));
        if (idx === -1) return false;
        all.splice(idx, 1);
        await this._write(all);
        return true;
    }
}
