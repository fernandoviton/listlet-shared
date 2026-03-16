// API layer - Supabase backed with localStorage mock mode

function createApi(listName) {
    var isMock = !CONFIG.SUPABASE_URL;
    var storageKey = 'listlet_' + CONFIG.DB_TABLE + '_' + listName;

    return {
        isMock: isMock,
        listName: listName,

        /**
         * Fetch data for this list
         * @param {Object} mockDefault - Default data if no existing row
         * @returns {Promise<Object>}
         */
        async fetchData(mockDefault) {
            if (mockDefault === undefined) mockDefault = {};

            if (isMock) {
                var saved = localStorage.getItem(storageKey);
                if (saved) return JSON.parse(saved);
                localStorage.setItem(storageKey, JSON.stringify(mockDefault));
                return mockDefault;
            }

            var result = await window.supabaseClient
                .from(CONFIG.DB_TABLE)
                .select('data')
                .eq('name', listName)
                .maybeSingle();

            if (result.error) throw new Error(result.error.message);

            if (!result.data) {
                // Row not found — create it with default
                var insertResult = await window.supabaseClient
                    .from(CONFIG.DB_TABLE)
                    .upsert({ name: listName, data: mockDefault })
                    .select('data')
                    .single();
                if (insertResult.error) throw new Error(insertResult.error.message);
                return insertResult.data.data;
            }

            return result.data.data;
        },

        /**
         * Save data using fetch-mutate-upsert pattern
         * @param {Function} mutate - Function that mutates the data object
         * @returns {Promise<Object>}
         */
        async saveData(mutate) {
            if (isMock) {
                var current = JSON.parse(localStorage.getItem(storageKey) || '{}');
                if (mutate) mutate(current);
                localStorage.setItem(storageKey, JSON.stringify(current));
                return current;
            }

            // Fetch current
            var fetchResult = await window.supabaseClient
                .from(CONFIG.DB_TABLE)
                .select('data')
                .eq('name', listName)
                .maybeSingle();

            var data = (fetchResult.data && fetchResult.data.data) || {};
            if (mutate) mutate(data);

            // Upsert back
            var saveResult = await window.supabaseClient
                .from(CONFIG.DB_TABLE)
                .upsert({ name: listName, data: data })
                .select('data')
                .single();

            if (saveResult.error) throw new Error(saveResult.error.message);
            return saveResult.data.data;
        }
    };
}

/**
 * Get all lists
 * @returns {Promise<Array>}
 */
createApi.getAllLists = async function() {
    var isMock = !CONFIG.SUPABASE_URL;

    if (isMock) {
        var prefix = 'listlet_' + CONFIG.DB_TABLE + '_';
        var lists = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && key.indexOf(prefix) === 0) {
                var name = key.substring(prefix.length);
                var data = JSON.parse(localStorage.getItem(key));
                lists.push({ name: name, data: data });
            }
        }
        return lists;
    }

    var result = await window.supabaseClient
        .from(CONFIG.DB_TABLE)
        .select('name, data, updated_at')
        .order('updated_at', { ascending: false });

    if (result.error) throw new Error(result.error.message);
    return result.data || [];
};
