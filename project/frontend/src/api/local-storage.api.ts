export interface SightReadingExercise {
  id: string;
  name: string;
  abc: string;
  createdAt: string;
  instrument: string;
  genre: string;
  difficult: string;
  additionalPrompt?: string;
  lastAccessed?: string;
}

// Heavily inspired by this blog post:
// https://meenumatharu.medium.com/a-practical-guide-to-using-local-storage-in-web-and-react-js-6d163a000c3a
export class LocalStorageList {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  private getItems(): SightReadingExercise[] {
    const data = localStorage.getItem(this.key);

    if (!data) {
      return [];
    }

    return JSON.parse(data);
  }

  private saveItems(items: SightReadingExercise[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  create(item: SightReadingExercise): void {
    const items = this.getItems();
    items.push(item);
    this.saveItems(items);
  }

  getAll(): SightReadingExercise[] {
    return this.getItems();
  }

  getById(id: string): SightReadingExercise | undefined {
    return this.getItems().find((item) => item.id === id);
  }

  update(id: string, changes: Partial<SightReadingExercise>): void {
    const items = this.getItems();

    const updated = items.map((item) =>
      item.id === id ? { ...item, ...changes } : item,
    );

    this.saveItems(updated);
  }

  delete(id: string): void {
    const items = this.getItems();

    const filtered = items.filter((item) => item.id !== id);

    this.saveItems(filtered);
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }
}

export class CurrentExercise {
  private key = "currentExerciseAbc";

  set(abc: string): void {
    localStorage.setItem(this.key, abc);
  }

  get(): string | null {
    return localStorage.getItem(this.key);
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }
}
