import { useState, useEffect, useRef } from "react";

interface VersionedData<T> {
    version: string;
    data: T;
}

/**
 * A hook that persists state to localStorage with version-gated serialization.
 *
 * On init the hook reads localStorage:
 *  - If the stored version matches `version`, state is hydrated from the saved data.
 *  - Otherwise (missing, corrupt, or outdated) the key is deleted and `defaultValue` is used.
 *
 * Writes are debounced (500 ms) so rapid edits don't thrash localStorage.
 *
 * @param key          localStorage key
 * @param version      Schema version string — bump when the stored shape changes
 * @param defaultValue Fallback value when nothing valid is stored
 */
export function useVersionedFormStorage<T>(
    key: string,
    version: string,
    defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
    const [value, setValue] = useState<T>(() => {
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed: VersionedData<T> = JSON.parse(raw);
                if (parsed.version === version) {
                    return parsed.data;
                }
                // Version mismatch — discard stale data
                localStorage.removeItem(key);
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            localStorage.removeItem(key);
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
                const wrapped: VersionedData<T> = { version, data: value };
                localStorage.setItem(key, JSON.stringify(wrapped));
            } catch (error) {
                console.warn(`Error writing to localStorage key "${key}":`, error);
            }
        }, 500);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [value, key, version]);

    return [value, setValue];
}
