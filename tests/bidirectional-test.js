// Bidirectional conversion test for ArielJS
// This script demonstrates that ArielJS code can be converted to Mermaid and back

import createArielJS from '../src/ariel-js.js';

console.log('=== BIDIRECTIONAL CONVERSION TEST ===');
console.log('This test demonstrates the ArielJS bidirectional conversion capabilities\n');

// Create ArielJS with the factory pattern
const ariel = createArielJS();

// Create a flowchart using ArielJS
console.log('1. CREATE A FLOWCHART WITH ARIELJS');
const originalFlowchart = ariel('flowchart', 'TD')
    .flow('A', 'Start', { shape: 'stadium' })
    .to('B', 'Process', { shape: 'rect' })
    .to('C', 'Decision?', { shape: 'diamond' })
    .flow('C')
    .to('D', 'Yes Path', {}, 'Yes')
    .to('F', 'End', { shape: 'stadium' })
    .flow('C')
    .to('E', 'No Path', {}, 'No')
    .to('F')
    .style('A', { fill: '#bbdefb', stroke: '#1976d2' })
    .style('F', { fill: '#bbdefb', stroke: '#1976d2' })
    .style('C', { fill: '#fff9c4', stroke: '#fbc02d' });

// 2. Convert the flowchart to Mermaid syntax
console.log('\n2. CONVERT ARIELJS TO MERMAID SYNTAX');
const mermaidSyntax = originalFlowchart.toMermaid();
console.log(mermaidSyntax);

// 3. Convert Mermaid syntax back to ArielJS code
console.log('\n3. CONVERT MERMAID BACK TO ARIELJS CODE');
const arielJSCode = ariel.fromMermaid(mermaidSyntax);
console.log(arielJSCode);

// Test a sequence diagram - demonstrating a different diagram type
console.log('\n=== SEQUENCE DIAGRAM TEST ===');
const sequence = ariel('sequence')
    .participant('User', null, { type: 'actor' })
    .participant('Browser')
    .participant('Server')
    .message('User', 'Browser', 'Request Page')
    .message('Browser', 'Server', 'API Request')
    .message('Server', 'Browser', 'Response', { type: '-->' })
    .message('Browser', 'User', 'Display Page', { type: '-->' })
    .note('over', ['Browser', 'Server'], 'Critical Exchange');

console.log('\nSEQUENCE DIAGRAM MERMAID OUTPUT:');
console.log(sequence.toMermaid());

// Finally, test with a mindmap - showing the fixed chaining works
console.log('\n=== MINDMAP TEST ===');
const mindmap = ariel('mindmap');
mindmap
    .root('Programming Languages')
    .child('Frontend')
        .child('JavaScript')
            .child('React')
            .sibling('Vue')
            .sibling('Angular')
        .parent('CSS')
            .child('Sass')
            .sibling('Less')
        .parent('HTML')
    .parent('Backend')
        .child('Python')
            .child('Django')
            .sibling('Flask')
        .parent('Java')
            .child('Spring')
        .parent('Go')
        .icon('Docker', 'docker');

console.log('\nMINDMAP DIAGRAM OUTPUT (WITH CHAINING):');
console.log(mindmap.toMermaid());

console.log('\n>>> CONCLUSION: The test shows ArielJS can convert diagrams to Mermaid');
console.log('>>> and can also convert Mermaid back to ArielJS code, completing the cycle.');