import createArielJS from '../src/ariel-js.js';

// Generated from Mermaid diagram
const builder = createArielJS();

// Build the flowchart
const chart = builder
    .graph('TD')
    // Define nodes
    .node('A', 'Start: Initialization', { shape: 'round' })
    .node('B', 'Process Data', { shape: 'diamond' })
    .node('C', 'Visualize Results', { shape: 'round' })
    .node('D', 'Log Error', { shape: 'round' })
    .node('E', 'End', { shape: 'round' })
    // Create edges
    .node('A')
    .edge('B')             // Connect A → B
    .node('B')             // Set current node to B
    .edge('C', 'Success')  // Connect B → C with Success label
    .node('B')             // Go back to B
    .edge('D', 'Failure')  // Connect B → D with Failure label
    .node('C')
    .edge('E')
    .node('D')
    .edge('E')
    // Apply styles
    .style('A', {"fill":"#a3d2ca","stroke":"#333","stroke-width":"2px"})
    .style('B', {"fill":"#f6c6ea","stroke":"#333","stroke-width":"2px"})
    .style('C', {"fill":"#ff97b7","stroke":"#333","stroke-width":"2px"})
    .style('D', {"fill":"#ff97b7","stroke":"#333","stroke-width":"2px"})
    .style('E', {"fill":"#e2eafc","stroke":"#333","stroke-width":"2px"})
;

// Generate the Mermaid syntax
const mermaidSyntax = chart.toMermaid();
console.log(mermaidSyntax);

// Export the chart
export default chart;
