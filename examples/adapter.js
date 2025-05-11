// Example of creating and using ArielJS adapters
import createArielJS from '../src/ariel-js.js';

// -------------------------------------------------
// 1. Simple method name customization
// -------------------------------------------------
const workflowBuilder = createArielJS({
  methods: {
    // Custom terminology for nodes and edges
    addStep: 'node',
    connectTo: 'edge',
    
    // Custom terminology for the simplified flow API
    startAt: 'flow',
    goTo: 'to'
  }
});

// Usage example with custom method names
const workflow = workflowBuilder('flowchart', 'TD')
  .addStep('A', 'Start Process', { shape: 'stadium' })
  .connectTo('B', 'Process Data')
  .addStep('C', 'Decision?', { shape: 'diamond' })
  
  // You can also use the flow API with custom names
  .startAt('C')
  .goTo('D', 'Yes Path', {}, 'Yes')
  .goTo('F', 'End', { shape: 'stadium' })
  
  .startAt('C')
  .goTo('E', 'No Path', {}, 'No')
  .goTo('F');

console.log('Workflow diagram:');
console.log(workflow.toMermaid());

// -------------------------------------------------
// 2. Property name customization
// -------------------------------------------------
const processBuilder = createArielJS({
  properties: {
    // Rename shape property
    stepType: 'shape',
    
    // Add custom styling properties
    primaryColor: 'fill',
    borderColor: 'stroke',
    
    // Rename edge properties
    connectionType: 'type'
  }
});

// Usage example with custom property names
const process = processBuilder('flowchart', 'TD')
  .node('A', 'Start', { 
    stepType: 'stadium',
    primaryColor: '#bbdefb',
    borderColor: '#1976d2' 
  })
  .edge('B', 'Process', { connectionType: '-->' })
  .node('B', 'End', { stepType: 'stadium' });

console.log('\nProcess diagram with custom properties:');
console.log(process.toMermaid());

// -------------------------------------------------
// 3. Advanced parameter reordering
// -------------------------------------------------
const apiBuilder = createArielJS({
  // Define parameter remapping for specific methods
  parameters: {
    // Swap the label and id parameters for node
    node: [1, 0, 2],  // New order: label, id, options
    
    // Move the label to be the first parameter for edge
    edge: [2, 0, 1]   // New order: label, targetId, options
  }
});

// Usage example with reordered parameters
const api = apiBuilder('flowchart', 'LR');
api
  // Instead of node(id, label, options)
  // We now use node(label, id, options)
  .node('Start Process', 'A', { shape: 'stadium' })
  
  // Instead of edge(targetId, label, options)
  // We now use edge(label, targetId, options)
  .edge('Process', 'B')
  
  .node('Process Data', 'B')
  .edge('Decide', 'C')
  .node('Decision?', 'C', { shape: 'diamond' });

console.log('\nAPI with reordered parameters:');
console.log(api.toMermaid());

// -------------------------------------------------
// 4. Creating a domain-specific adapter
// -------------------------------------------------
const createPipeline = () => {
  // Create a highly specialized adapter
  return createArielJS({
    // Custom method names for pipeline terminology
    methods: {
      source: 'node',
      processor: 'node',
      sink: 'node',
      pipe: 'edge'
    },
    
    // Custom properties for pipeline components
    properties: {
      sourceType: 'shape',
      processorType: 'shape',
      sinkType: 'shape',
      dataType: 'label'
    },
    
    // Custom methods that combine multiple operations
    customMethods: {
      // Create a standard pipeline segment
      segment: function(id, name, type, options = {}) {
        // Choose shape based on the type
        let shape;
        switch(type) {
          case 'source': shape = 'circle'; break;
          case 'processor': shape = 'rect'; break;
          case 'sink': shape = 'stadium'; break;
          default: shape = 'rect';
        }
        
        // Create the node with the appropriate shape and styling
        return this.node(id, name, { 
          shape,
          style: { fill: options.color || '#f5f5f5' },
          ...options
        });
      },
      
      // Connect pipeline components with appropriate data flow indication
      dataFlow: function(fromId, toId, dataType) {
        return this.edge(toId, dataType || 'data', { type: '-->' });
      }
    }
  })('flowchart', 'LR'); // Always create a left-to-right flowchart
};

// Usage example of domain-specific pipeline adapter
const pipeline = createPipeline();
pipeline
  .segment('SRC', 'Data Source', 'source', { color: '#bbdefb' })
  .dataFlow('SRC', 'PROC1', 'raw data')
  .segment('PROC1', 'Filter', 'processor', { color: '#c8e6c9' })
  .dataFlow('PROC1', 'PROC2', 'filtered data')
  .segment('PROC2', 'Transform', 'processor', { color: '#c8e6c9' })
  .dataFlow('PROC2', 'SINK', 'transformed data')
  .segment('SINK', 'Database', 'sink', { color: '#ffccbc' });

console.log('\nData pipeline with domain-specific adapter:');
console.log(pipeline.toMermaid());