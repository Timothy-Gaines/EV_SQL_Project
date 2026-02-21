import Papa from 'papaparse';

export async function parseCSV<T>(path: string): Promise<T[]> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  const text = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn(`Parse warnings for ${path}:`, results.errors.slice(0, 3));
        }
        resolve(results.data);
      },
      error: (err: Error) => reject(err),
    });
  });
}

export async function parseStationsCSV<T>(path: string): Promise<T[]> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load stations: ${response.status}`);
  }
  const text = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (h) =>
        h.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => resolve(results.data),
      error: (err: Error) => reject(err),
    });
  });
}
