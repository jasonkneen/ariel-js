import createArielJS from '../src/ariel-js.js';

// Simplified Flow API Test
console.log('=== Simplified Flow API Test ===');

const builder = createArielJS();
const diagram = builder
    .graph('TD')
    // Main flow
    .flow('A', 'Start', { shape: 'stadium' })
    .to('B', 'Process 1', { shape: 'rect' })
    .to('C', 'Decision', { shape: 'diamond' })
    
    // Yes branch
    .flow('C')
    .to('D', 'Process 2', { shape: 'rect' }, 'Yes')
    .to('F', 'End', { shape: 'stadium' })
    
    // No branch
    .flow('C')
    .to('E', 'Process 3', { shape: 'rect' }, 'No')
    .to('F');

// Apply some styling
builder
    .style('A', { fill: '#d4f1f9', stroke: '#05445E' })
    .style('F', { fill: '#d4f1f9', stroke: '#05445E' })
    .style('C', { fill: '#ffadad', stroke: '#800000' })
    .style('B', { fill: '#fdffb6', stroke: '#5a5a5a' })
    .style('D', { fill: '#fdffb6', stroke: '#5a5a5a' })
    .style('E', { fill: '#fdffb6', stroke: '#5a5a5a' });

console.log('Generated Mermaid:');
console.log(diagram.toMermaid());

// Convert to Mermaid and back to JS code for verification
const mermaidCode = diagram.toMermaid();
console.log('\nConverted JS Code:');
console.log(createArielJS().fromMermaid(mermaidCode));