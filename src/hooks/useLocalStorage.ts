import { useState, useCallback } from "react";

/**
 * A hook that persists state to localStorage with automatic JSON serialization.
 * Falls back to the provided default value if localStorage is empty or invalid.
 *
 * Important: The default value is NOT written to localStorage automatically.
 * Only explicit calls to setValue will persist to localStorage. This ensures
 * that code-side default changes are reflected on next load unless the user
 * has explicitly saved their own values.
 *
 * @param key - The localStorage key
 * @param defaultValue - Default value to use if nothing in localStorage
 * @returns [value, setValue] - Similar to useState
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    // Initialize state from localStorage or default
    const [value, setValue] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                return JSON.parse(stored) as T;
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        }
        return defaultValue;
    });

    // Wrapper for setValue that persists to localStorage on explicit changes.
    // If the new value matches the default, remove from localStorage so
    // code-side default updates are always reflected.
    const setStoredValue = useCallback(
        (newValue: T | ((prev: T) => T)) => {
            setValue((prev) => {
                const resolved = typeof newValue === "function" ? (newValue as (prev: T) => T)(prev) : newValue;
                try {
                    if (JSON.stringify(resolved) === JSON.stringify(defaultValue)) {
                        localStorage.removeItem(key);
                    } else {
                        localStorage.setItem(key, JSON.stringify(resolved));
                    }
                } catch (error) {
                    console.warn(`Error writing to localStorage key "${key}":`, error);
                }
                return resolved;
            });
        },
        [key, defaultValue],
    );

    return [value, setStoredValue];
}
