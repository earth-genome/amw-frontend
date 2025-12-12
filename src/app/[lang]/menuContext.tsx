// contexts/MenuContext.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface MenuContextType {
  menuOpen: boolean;
  setMenuOpen: (_open: boolean) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

interface MenuProviderProps {
  children: ReactNode;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <MenuContext.Provider value={{ menuOpen, setMenuOpen }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
