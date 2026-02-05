import { useState, useEffect, useCallback } from "react";

/**
 * A hook that persists state to localStorage with automatic JSON serialization.
 * Falls back to the provided default value if localStorage is empty or invalid.
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

    // Persist to localStorage whenever value changes
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Error writing to localStorage key "${key}":`, error);
        }
    }, [key, value]);

    // Wrapper for setValue that handles function updates
    const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
        setValue((prev) => {
            const resolved = typeof newValue === "function" ? (newValue as (prev: T) => T)(prev) : newValue;
            return resolved;
        });
    }, []);

    return [value, setStoredValue];
}
