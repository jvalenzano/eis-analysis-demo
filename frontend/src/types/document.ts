// frontend/src/types/document.ts
/**
 * Represents an Environmental Impact Statement document in the system.
 */
export interface Document {
  /** Unique identifier for the document */
  id: string;
  /** Human-readable title of the document */
  title: string;
  /** Optional document description */
  description: string;
  /** Date when the document was created or uploaded */
  date: string;
  /** Optional URL to access the document */
  url: string;
  /** Optional document status */
  status: 'pending' | 'processing' | 'completed' | 'error';
  /** Detailed content of the document */
  content?: {
    /** Executive summary of the document */
    summary: string;
    /** Key issues addressed in the document */
    keyIssues: string[];
    /** Environmental impact assessment table */
    impactTable: Array<{
      resource: string;
      beneficial: string;
      adverse: string;
      mitigation: string;
    }>;
    /** Project implementation timeline */
    timeline: Array<{
      phase: string;
      activity: string;
    }>;
  };
}

/**
 * Response format expected from the backend API when fetching a list of documents.
 */
export interface DocumentsResponse {
  documents: Document[];
}
