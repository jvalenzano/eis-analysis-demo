// frontend/src/services/__mocks__/mockData.ts
import { Document } from '../../types/document'; // Import the Document type

// Define realistic mock documents
export const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    name: 'Forest Service EIS - Pine Mountain Project',
    date: '2023-05-15',
    size: 4582345,
    description: 'Draft Environmental Impact Statement for the Pine Mountain Forest Management Project located in the Whispering Pines district.',
    type: 'Draft EIS'
 },
  {
    id: 'doc-002',
    name: 'River Basin Restoration Plan - Public Comments',
    date: '2023-03-22',
    size: 3251487,
    description: 'Collection of public comments received regarding the proposed River Basin ecosystem restoration initiative.',
    type: 'Public Comments'
 },
  {
    id: 'doc-003',
    name: 'Wildlife Corridor Infrastructure Project - Final EIS',
    date: '2023-06-10',
    size: 2874521,
    description: 'Final analysis of wildlife corridor impacts from the proposed Highway 7 expansion project.',
    type: 'Final EIS'
 },
  {
    id: 'doc-004',
    name: 'Mountain Valley Timber Sale - Draft EA',
    date: '2023-04-05',
    size: 5124879,
    description: 'Draft Environmental Assessment for proposed timber harvesting activities in the Mountain Valley region.',
    type: 'Draft EA' // Example of different type
 },
  {
    id: 'doc-005',
    name: 'Lakeside Recreation Development Plan',
    date: '2023-07-18',
    size: 3684512,
    description: 'Public feedback and proposal details for new recreational facilities at Clearwater Lake.',
    type: 'Public Comments'
 },
  {
    id: 'doc-006',
    name: 'Prairie Grassland Conservation Plan (Draft)',
    date: '2023-02-28',
    size: 2451367,
    description: 'Draft conservation strategy focusing on endangered prairie grassland ecosystems and species protection measures.',
    type: 'Draft EIS'
 }
];

// Mock preview data (can be simple or more elaborate)
export const mockPreview = {
  // Example: Using a placeholder image service
  // preview_url: 'https://via.placeholder.com/800x1000.png?text=Document+Preview+Not+Available',
  preview_url: '', // Default to empty for 'not available'
  status: 'not_available', // Match potential backend status
  message: 'Preview is not available in mock mode.'
};

// Mock analysis job initiation response
export const mockAnalysisJob = {
  jobId: `mock-job-${uuidv4()}`, // Generate a unique mock ID
  status: 'QUEUED', // Initial status when job is accepted
  estimatedTimeSeconds: 60 // Provide an estimate
};

// Helper function to generate mock UUIDs if needed (simple version)
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
