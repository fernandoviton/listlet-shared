const fs = require('fs');
const path = require('path');

// Mock localStorage
const storage = {};
global.localStorage = {
    getItem: jest.fn(k => storage[k] || null),
    setItem: jest.fn((k, v) => { storage[k] = v; }),
    removeItem: jest.fn(k => { delete storage[k]; }),
    get length() { return Object.keys(storage).length; },
    key: jest.fn(i => Object.keys(storage)[i] || null)
};

// Load api.js into global scope
const code = fs.readFileSync(path.join(__dirname, '../../shared/api.js'), 'utf-8');
eval(code.replace('function createApi(', 'global.createApi = function createApi('));

beforeEach(() => {
    Object.keys(storage).forEach(k => delete storage[k]);
    jest.clearAllMocks();
});

describe('createApi mock mode', () => {
    test('isMock is true when CONFIG has no SUPABASE_URL', () => {
        global.CONFIG = { SUPABASE_URL: null };
        const api = createApi('test', 'myapp');
        expect(api.isMock).toBe(true);
        delete global.CONFIG;
    });

    describe('fetchData', () => {
        let api;
        beforeEach(() => {
            global.CONFIG = { SUPABASE_URL: null };
            api = createApi('mylist', 'myapp');
        });
        afterEach(() => { delete global.CONFIG; });

        test('returns mockDefault when no stored data', async () => {
            const result = await api.fetchData({ rows: [] });
            expect(result).toEqual({ rows: [] });
        });

        test('persists mockDefault to localStorage', async () => {
            await api.fetchData({ rows: [] });
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'listlet_myapp_mylist',
                JSON.stringify({ rows: [] })
            );
        });

        test('returns stored data when available', async () => {
            storage['listlet_myapp_mylist'] = JSON.stringify({ rows: [{ id: 1 }] });
            const result = await api.fetchData({ rows: [] });
            expect(result).toEqual({ rows: [{ id: 1 }] });
        });
    });

    describe('saveData', () => {
        let api;
        beforeEach(() => {
            global.CONFIG = { SUPABASE_URL: null };
            api = createApi('mylist', 'myapp');
        });
        afterEach(() => { delete global.CONFIG; });

        test('applies mutation and saves', async () => {
            storage['listlet_myapp_mylist'] = JSON.stringify({ count: 1 });
            const result = await api.saveData(d => { d.count = 2; });
            expect(result.count).toBe(2);
            expect(JSON.parse(storage['listlet_myapp_mylist']).count).toBe(2);
        });

        test('starts with empty object when no stored data', async () => {
            const result = await api.saveData(d => { d.items = [1, 2]; });
            expect(result).toEqual({ items: [1, 2] });
        });
    });
});

describe('createApi.getAllLists mock mode', () => {
    beforeEach(() => {
        global.CONFIG = { SUPABASE_URL: null };
    });
    afterEach(() => { delete global.CONFIG; });

    test('returns empty array when no matching keys', async () => {
        const result = await createApi.getAllLists('myapp');
        expect(result).toEqual([]);
    });

    test('returns lists matching container prefix', async () => {
        storage['listlet_myapp_list1'] = JSON.stringify({ title: 'First' });
        storage['listlet_myapp_list2'] = JSON.stringify({ title: 'Second' });
        storage['listlet_other_list3'] = JSON.stringify({ title: 'Other app' });

        const result = await createApi.getAllLists('myapp');
        expect(result).toHaveLength(2);
        expect(result.map(r => r.name).sort()).toEqual(['list1', 'list2']);
        expect(result[0].data).toBeDefined();
    });

    test('does not include keys from other apps', async () => {
        storage['listlet_otherapp_list1'] = JSON.stringify({ x: 1 });
        const result = await createApi.getAllLists('myapp');
        expect(result).toEqual([]);
    });
});

describe('createApi Supabase mode', () => {
    let api;
    beforeEach(() => {
        global.CONFIG = { SUPABASE_URL: 'https://test.supabase.co' };
        global.window = global.window || {};
        global.window.supabaseClient = {
            from: jest.fn(() => ({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            single: jest.fn(() => Promise.resolve({ data: { data: { items: [1] } }, error: null }))
                        }))
                    }))
                })),
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn(() => Promise.resolve({ data: { data: { items: [1, 2] } }, error: null }))
                    }))
                }))
            }))
        };
        api = createApi('mylist', 'myapp');
    });
    afterEach(() => {
        delete global.CONFIG;
        delete global.window.supabaseClient;
    });

    test('isMock is false', () => {
        expect(api.isMock).toBe(false);
    });
});
