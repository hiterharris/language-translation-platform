import { v4 as uuidv4 } from 'uuid';
import sampleData from './sample-data.json';

export interface Document {
  id: string;
  title: string;
  file_path: string;
  file_type: string;
  source_language: string;
  target_language: string;
  status: string;
  content: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  translations: Translation[];
}

export interface Translation {
  id: string;
  document_id: string;
  content: string | null;
  status: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  language: string;
}

class LocalStorage {
  private documents: Document[];
  private translations: Translation[];

  constructor() {
    this.documents = sampleData.documents;
    this.translations = sampleData.translations;
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    return this.documents;
  }

  async getDocument(id: string): Promise<Document | null> {
    return this.documents.find(doc => doc.id === id) || null;
  }

  async createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    const newDocument = {
      ...document,
      id: uuidv4(),
      content: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.documents.push(newDocument);
    return newDocument;
  }

  // Translation methods
  async getTranslations(documentId: string): Promise<Translation[]> {
    return this.translations.filter(t => t.document_id === documentId);
  }

  async createTranslation(translation: Omit<Translation, 'id' | 'created_at' | 'updated_at'>): Promise<Translation> {
    const newTranslation = {
      ...translation,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.translations.push(newTranslation);
    return newTranslation;
  }

  async updateTranslation(id: string, updates: Partial<Translation>): Promise<Translation | null> {
    const index = this.translations.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    const updatedTranslation = {
      ...this.translations[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    this.translations[index] = updatedTranslation;
    return updatedTranslation;
  }
}

export const storage = new LocalStorage();