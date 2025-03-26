
import { Credential } from "./types";

const STORAGE_KEY = "password-manager-credentials";

// Sample data for initial setup
const sampleCredentials: Credential[] = [
  {
    id: "1",
    title: "Gmail",
    username: "user@gmail.com",
    password: "password123",
    url: "https://gmail.com",
    category: "email",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "2",
    title: "Netflix",
    username: "netflix_user",
    password: "netflix_pass",
    url: "https://netflix.com",
    category: "entertainment",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "3",
    title: "GitHub",
    username: "github_user",
    password: "github_pass",
    url: "https://github.com",
    category: "development",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const getStoredCredentials = (): Credential[] => {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Initialize with sample data on first run
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleCredentials));
    return sampleCredentials;
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to parse credentials from storage:", error);
    return [];
  }
};

export const saveCredentials = (credentials: Credential[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
};

export const addCredential = (credential: Omit<Credential, "id" | "createdAt" | "updatedAt">): Credential => {
  const credentials = getStoredCredentials();
  const newCredential: Credential = {
    ...credential,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  saveCredentials([...credentials, newCredential]);
  return newCredential;
};

export const updateCredential = (credential: Credential): void => {
  const credentials = getStoredCredentials();
  const index = credentials.findIndex((c) => c.id === credential.id);
  
  if (index !== -1) {
    credentials[index] = {
      ...credential,
      updatedAt: Date.now(),
    };
    saveCredentials(credentials);
  }
};

export const deleteCredential = (id: string): void => {
  const credentials = getStoredCredentials();
  saveCredentials(credentials.filter((c) => c.id !== id));
};
