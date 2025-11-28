"use client";

import {
    createContext,
    useCallback,
    useContext,
    useState,
    ReactNode,
} from "react";
import GlobalLoader from "@/components/ui/GlobalLoader";

type LoaderContextType = {
    isLoading: boolean;
    showLoader: () => void;
    hideLoader: () => void;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    const showLoader = useCallback(() => setIsLoading(true), []);
    const hideLoader = useCallback(() => setIsLoading(false), []);

    return (
        <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
            {children}
            {/* Overlay siempre montado, se controla con isLoading */}
            <GlobalLoader show={isLoading} />
        </LoaderContext.Provider>
    );
}

export function useGlobalLoader() {
    const ctx = useContext(LoaderContext);
    if (!ctx) {
        throw new Error("useGlobalLoader debe usarse dentro de <LoaderProvider>");
    }
    return ctx;
}
