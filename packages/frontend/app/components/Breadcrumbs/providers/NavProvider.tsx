import { useCallback, useEffect, useState } from "react";
import { NavContext } from "../context/NavContext";

export interface NavProviderProps {
  children: React.ReactNode;
}

export const NavProvider = ({ children }: NavProviderProps) => {
  const [isNavOpened, setIsNavOpened] = useState(false);

  const toggleNav = useCallback(() => {
    setIsNavOpened((s) => !s);
  }, [setIsNavOpened]);

  useEffect(() => {
    document.body.style.overflow = isNavOpened ? "hidden" : "revert";
  }, [isNavOpened]);

  return (
    <NavContext.Provider value={{ isNavOpened, toggleNav }}>
      {children}
    </NavContext.Provider>
  );
};
