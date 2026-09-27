import { createContext, useContext, useEffect, useState } from "react";
import { CurrentExercise } from "../api/local-storage.api";

type MusicContextType = {
  abc: string;
  setAbc: React.Dispatch<React.SetStateAction<string>>;
  feedback: number[];
  setFeedback: React.Dispatch<React.SetStateAction<number[]>>;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [abc, setAbc] = useState("");
  const [feedback, setFeedback] = useState<number[]>([]);
  const currentExercise = new CurrentExercise();

  // on music context start
  useEffect(() => {
    const storedAbc = currentExercise.get();

    if (storedAbc !== null) {
      setAbc(storedAbc);
    }
  }, []);

  // on abc changes
  useEffect(() => {
    if (!abc) {
      return;
    }

    if (abc != "") {
      currentExercise.set(abc);
    } else {
      const storedAbc = currentExercise.get();
      if (storedAbc != null) {
        setAbc(storedAbc);
      }
    }
  }, [abc]);

  return (
    <MusicContext.Provider value={{ abc, setAbc, feedback, setFeedback }}>
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
