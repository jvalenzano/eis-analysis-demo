// frontend/src/services/__mocks__/mockData.ts
import { Document } from '../../types/document'; // Import the Document type

// Define realistic mock documents with varied content
export const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    title: 'Forest Service EIS - Pine Mountain Project',
    date: '2023-05-15',
    description: 'Draft Environmental Impact Statement for the Pine Mountain Forest Management Project, focusing on wildfire prevention and forest health restoration in high-risk areas.',
    url: '/viewer/doc-001',
    status: 'completed',
    content: {
      summary: 'This EIS addresses critical forest health issues in the Pine Mountain region, where decades of fire suppression have led to dangerous fuel accumulation and increased wildfire risk. The project proposes a comprehensive forest management approach combining mechanical thinning, prescribed burns, and habitat restoration.',
      keyIssues: [
        'Extreme wildfire risk due to overgrown understory',
        'Declining forest health and disease resistance',
        'Threatened spotted owl habitat',
        'Watershed protection needs'
      ],
      impactTable: [
        { resource: 'Fire Management', beneficial: 'High', adverse: 'Minimal', mitigation: 'Staged prescribed burns with air quality monitoring' },
        { resource: 'Wildlife Habitat', beneficial: 'Moderate', adverse: 'Moderate', mitigation: 'Seasonal restrictions and spotted owl buffer zones' },
        { resource: 'Forest Health', beneficial: 'High', adverse: 'Low', mitigation: 'Selective thinning and native species replanting' },
        { resource: 'Watershed', beneficial: 'High', adverse: 'Low', mitigation: 'Enhanced riparian buffers and erosion control' },
        { resource: 'Recreation', beneficial: 'Moderate', adverse: 'Temporary', mitigation: 'Phased closures and alternative trail access' }
      ],
      timeline: [
        { phase: '2024 Q1', activity: 'Initial prescribed burns and thinning' },
        { phase: '2024 Q2-Q3', activity: 'Habitat restoration and replanting' },
        { phase: '2024 Q4', activity: 'Trail system improvements' },
        { phase: '2025 Q1-Q2', activity: 'Monitoring and adaptive management' }
      ]
    }
  },
  {
    id: 'doc-002',
    title: 'River Basin Restoration Plan - Public Comments',
    date: '2023-03-22',
    description: 'Collection of public comments and environmental analysis regarding the proposed River Basin ecosystem restoration initiative, focusing on salmon habitat recovery.',
    url: '/viewer/doc-002',
    status: 'completed',
    content: {
      summary: 'This document compiles and analyzes public feedback on the proposed River Basin restoration project, which aims to improve salmon spawning habitat, enhance water quality, and restore natural flood patterns while balancing agricultural water needs.',
      keyIssues: [
        'Declining salmon populations',
        'Agricultural water rights conflicts',
        'Flood control infrastructure impacts',
        'Wetland habitat degradation'
      ],
      impactTable: [
        { resource: 'Aquatic Habitat', beneficial: 'High', adverse: 'Minimal', mitigation: 'Phased implementation during low-flow periods' },
        { resource: 'Agriculture', beneficial: 'Moderate', adverse: 'Moderate', mitigation: 'Water-sharing agreements and irrigation efficiency programs' },
        { resource: 'Flood Management', beneficial: 'High', adverse: 'Low', mitigation: 'Enhanced levee systems and natural flood plains' },
        { resource: 'Water Quality', beneficial: 'High', adverse: 'Temporary', mitigation: 'Sediment control and monitoring' },
        { resource: 'Recreation', beneficial: 'High', adverse: 'Low', mitigation: 'New river access points and educational facilities' }
      ],
      timeline: [
        { phase: '2024 Q1', activity: 'Dam modification and fish passage installation' },
        { phase: '2024 Q2-Q3', activity: 'Wetland restoration and riparian planting' },
        { phase: '2024 Q4', activity: 'Agricultural infrastructure updates' },
        { phase: '2025 Q1-Q2', activity: 'Monitoring and adaptive management' }
      ]
    }
  },
  {
    id: 'doc-003',
    title: 'Wildlife Corridor Infrastructure Project - Final EIS',
    date: '2023-06-10',
    description: 'Final analysis of wildlife corridor impacts from the proposed Highway 7 expansion project, including innovative wildlife crossing structures.',
    url: '/viewer/doc-003',
    status: 'completed',
    content: {
      summary: 'This Final EIS evaluates the implementation of wildlife crossing structures along Highway 7, addressing habitat fragmentation while improving transportation safety. The project includes underpasses, overpasses, and fencing designed specifically for local species.',
      keyIssues: [
        'Wildlife-vehicle collisions',
        'Habitat connectivity',
        'Traffic flow during construction',
        'Long-term maintenance costs'
      ],
      impactTable: [
        { resource: 'Wildlife Movement', beneficial: 'High', adverse: 'Low', mitigation: 'Strategic placement of crossings based on migration patterns' },
        { resource: 'Traffic Safety', beneficial: 'High', adverse: 'Temporary', mitigation: 'Night construction and traffic management plan' },
        { resource: 'Habitat Connectivity', beneficial: 'High', adverse: 'Minimal', mitigation: 'Native vegetation restoration along corridors' },
        { resource: 'Construction Impact', beneficial: 'N/A', adverse: 'Moderate', mitigation: 'Seasonal timing and noise reduction measures' },
        { resource: 'Local Economy', beneficial: 'Moderate', adverse: 'Low', mitigation: 'Local contractor preferences and tourism opportunities' }
      ],
      timeline: [
        { phase: '2024 Q1', activity: 'Site preparation and initial construction' },
        { phase: '2024 Q2-Q3', activity: 'Major structure installation' },
        { phase: '2024 Q4', activity: 'Habitat restoration and fencing' },
        { phase: '2025 Q1-Q2', activity: 'Monitoring and effectiveness studies' }
      ]
    }
  },
  {
    id: 'doc-004',
    title: 'Mountain Valley Timber Sale - Draft EA',
    date: '2023-04-05',
    description: 'Draft Environmental Assessment for proposed timber harvesting activities in the Mountain Valley region, incorporating sustainable forestry practices.',
    url: '/viewer/doc-004',
    status: 'completed',
    content: {
      summary: 'This Environmental Assessment evaluates a proposed timber sale designed to demonstrate sustainable forestry practices while supporting local economies. The project emphasizes selective harvesting, habitat preservation, and long-term forest health.',
      keyIssues: [
        'Sustainable harvest levels',
        'Old-growth forest preservation',
        'Local economic benefits',
        'Road system impacts'
      ],
      impactTable: [
        { resource: 'Forest Sustainability', beneficial: 'High', adverse: 'Low', mitigation: 'Rotation harvesting and regeneration plans' },
        { resource: 'Wildlife Habitat', beneficial: 'Moderate', adverse: 'Moderate', mitigation: 'Wildlife tree retention and corridor preservation' },
        { resource: 'Soil Resources', beneficial: 'Low', adverse: 'Moderate', mitigation: 'Advanced harvesting techniques and erosion control' },
        { resource: 'Local Economy', beneficial: 'High', adverse: 'Minimal', mitigation: 'Local workforce training and contracting' },
        { resource: 'Recreation Access', beneficial: 'Moderate', adverse: 'Temporary', mitigation: 'Weekend operation restrictions and trail maintenance' }
      ],
      timeline: [
        { phase: '2024 Q1', activity: 'Marking and road preparation' },
        { phase: '2024 Q2-Q3', activity: 'Primary harvesting operations' },
        { phase: '2024 Q4', activity: 'Site restoration and replanting' },
        { phase: '2025 Q1-Q2', activity: 'Post-harvest monitoring' }
      ]
    }
  },
  {
    id: 'doc-005',
    title: 'Lakeside Recreation Development Plan',
    date: '2023-07-18',
    description: 'Public feedback and proposal details for new recreational facilities at Clearwater Lake, balancing access with environmental protection.',
    url: '/viewer/doc-005',
    status: 'completed',
    content: {
      summary: 'This plan outlines the development of sustainable recreation facilities at Clearwater Lake, including accessible trails, fishing piers, and educational facilities. The project aims to increase public access while protecting sensitive shoreline habitats.',
      keyIssues: [
        'Shoreline habitat protection',
        'Accessibility requirements',
        'Water quality maintenance',
        'Cultural resource preservation'
      ],
      impactTable: [
        { resource: 'Lake Ecosystem', beneficial: 'Moderate', adverse: 'Low', mitigation: 'Stormwater management and habitat buffers' },
        { resource: 'Public Access', beneficial: 'High', adverse: 'Minimal', mitigation: 'Designated access points and educational signage' },
        { resource: 'Cultural Resources', beneficial: 'High', adverse: 'Low', mitigation: 'Archaeological surveys and tribal consultation' },
        { resource: 'Visual Quality', beneficial: 'Moderate', adverse: 'Moderate', mitigation: 'Natural design elements and screening vegetation' },
        { resource: 'Wildlife', beneficial: 'Moderate', adverse: 'Low', mitigation: 'Seasonal closures and wildlife-friendly lighting' }
      ],
      timeline: [
        { phase: '2024 Q1', activity: 'Permitting and site preparation' },
        { phase: '2024 Q2-Q3', activity: 'Facility construction' },
        { phase: '2024 Q4', activity: 'Habitat enhancement' },
        { phase: '2025 Q1-Q2', activity: 'Program implementation' }
      ]
    }
  },
  {
    id: 'doc-006',
    title: 'Prairie Grassland Conservation Plan (Draft)',
    date: '2023-02-28',
    description: 'Draft conservation strategy focusing on endangered prairie grassland ecosystems and species protection measures.',
    url: '/viewer/doc-006',
    status: 'completed',
    content: {
      summary: 'This conservation plan addresses the critical decline of native prairie grasslands and associated species. The strategy combines habitat restoration, invasive species management, and sustainable grazing practices.',
      keyIssues: [
        'Native grassland loss',
        'Endangered species protection',
        'Invasive species management',
        'Sustainable grazing practices'
      ],
      impactTable: [
        { resource: 'Native Prairie', beneficial: 'High', adverse: 'Minimal', mitigation: 'Phased restoration and monitoring' },
        { resource: 'Endangered Species', beneficial: 'High', adverse: 'Low', mitigation: 'Species-specific management plans' },
        { resource: 'Grazing Operations', beneficial: 'Moderate', adverse: 'Moderate', mitigation: 'Rotational grazing and compensation programs' },
        { resource: 'Soil Health', beneficial: 'High', adverse: 'Low', mitigation: 'Native plant restoration and erosion control' },
        { resource: 'Cultural Resources', beneficial: 'High', adverse: 'Minimal', mitigation: 'Traditional use preservation and access' }
      ],
      timeline: [
        { phase: '2024 Q1', activity: 'Baseline surveys and planning' },
        { phase: '2024 Q2-Q3', activity: 'Invasive species treatment' },
        { phase: '2024 Q4', activity: 'Native species reintroduction' },
        { phase: '2025 Q1-Q2', activity: 'Grazing program implementation' }
      ]
    }
  }
];

// Mock preview data
export const mockPreview = {
  previewUrl: '/preview-not-available.pdf',
  status: 'available' as const,
  message: 'Document preview is ready.'
};

// Mock analysis job initiation response
export const mockAnalysisJob = {
  jobId: `mock-job-${uuidv4()}`,
  status: 'QUEUED',
  estimatedTimeSeconds: 60
};

// Helper function to generate mock UUIDs
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
