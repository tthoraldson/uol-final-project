import { createContext, useContext, useState } from "react";

type MusicContextType = {
  abc: string;
  setAbc: React.Dispatch<React.SetStateAction<string>>;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [abc, setAbc] = useState("");

  return (
    <MusicContext.Provider value={{ abc, setAbc }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);

  if (!context) {
    throw new Error("useMusic must be used inside MusicProvider");
  }

  return context;
}
