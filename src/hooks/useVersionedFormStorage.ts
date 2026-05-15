import { useState, useEffect, useRef } from "react";

/**
 * A hook that persists state to localStorage with version-keyed storage.
 *
 * The version is embedded in the localStorage key itself (e.g. "my_key_v1.2.3"),
 * so data from different versions coexist without interfering. On init, stale
 * keys (same base key, different version suffix) are pruned automatically.
 *
 * Writes are debounced (500 ms) so rapid edits don't thrash localStorage.
 *
 * @param key          Base localStorage key (version suffix is appended automatically)
 * @param version      Schema version string — bump when the stored shape changes
 * @param defaultValue Fallback value when nothing valid is stored
 */
export function useVersionedFormStorage<T>(
    key: string,
    version: string,
    defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    const versionedKey = `${key}_v${version}`;

    const [value, setValue] = useState<T>(() => {
        // Prune stale keys from other versions
        try {
            const prefix = `${key}_v`;
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const k = localStorage.key(i);
                if (k && k.startsWith(prefix) && k !== versionedKey) {
                    localStorage.removeItem(k);
                }
            }
        } catch {
            // Ignore storage enumeration errors
        }

        try {
            const raw = localStorage.getItem(versionedKey);
            if (raw) {
                return JSON.parse(raw) as T;
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${versionedKey}":`, error);
            localStorage.removeItem(versionedKey);
        }
        return defaultValue;
    });

    // Debounced save — writes 500 ms after the last change
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Skip saving on mount (initial hydration)
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            try {
                localStorage.setItem(versionedKey, JSON.stringify(value));
            } catch (error) {
                console.warn(`Error writing to localStorage key "${versionedKey}":`, error);
            }
        }, 500);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [value, versionedKey]);

    /** Clears the stored value and resets state to defaultValue */
    const clearStorage = () => {
        try {
            localStorage.removeItem(versionedKey);
        } catch {
            // Ignore
        }
        setValue(defaultValue);
    };

    return [value, setValue, clearStorage];
}
