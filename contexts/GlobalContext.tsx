import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalContextType {
    hostURL: string;
    setHostURL: React.Dispatch<React.SetStateAction<string>>;
}

const defaultContextValue: GlobalContextType = {
    hostURL: '',
    setHostURL: () => {}, // A no-op function
};

const GlobalContext = createContext<GlobalContextType>(defaultContextValue);

interface GlobalProviderProps {
    children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
    const [hostURL, setHostURL] = useState<string>('');

    return (
        <GlobalContext.Provider value={{ hostURL, setHostURL }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return useContext(GlobalContext);
};

export default GlobalContext;
