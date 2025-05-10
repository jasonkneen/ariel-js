import createArielJS from '../src/ariel-js.js';

// Standard Mermaid terminology test
console.log('=== Standard Mermaid Terminology Test ===');
const builder = createArielJS();
const diagram = builder
    .graph('LR')
    .node('A', 'Start', { shape: 'rect', metadata: { status: 'running' } })
    .edge('B', 'Next', { type: '-->' })
    .node('B', 'Decision', { shape: 'diamond' })
    .edge('C', 'Success')
    .node('C', 'End', { shape: 'round' })
    .subgraph('Group', 'Processing', b => b
        .node('D', 'Subtask', { shape: 'rect' })
    )
    .style('A', { fill: '#f9f' })
    .class('important', 'A', 'C')
    .note('Workflow note', 'A');
console.log('Generated Mermaid:');
console.log(diagram.toMermaid());
console.log('\nGraph Data:');
console.log(JSON.stringify(diagram.getGraph(), null, 2));

// Custom terminology test
console.log('\n=== Custom Terminology Test ===');
const customBuilder = createArielJS({
    methods: {
        // Custom method names - mapped to Mermaid terms
        flowDirection: 'graph',
        addStep: 'node',
        connectTo: 'edge',
        group: 'subgraph',
        comment: 'note'
    },
    properties: {
        // Custom property names - mapped to Mermaid terms
        nodeType: 'shape',
        linkType: 'type'
    }
});

const customDiagram = customBuilder
    .flowDirection('TD')
    .addStep('X', 'Input', { nodeType: 'rect' })
    .connectTo('Y', 'Process', { linkType: '-->' })
    .addStep('Y', 'Output', { nodeType: 'rect' })
    .group('G', 'Pipeline', b => b
        .node('Z', 'Task', { shape: 'rect' })
    )
    .comment('Custom flowchart example');
console.log('Generated Mermaid (Custom Terms):');
console.log(customDiagram.toMermaid());
console.log('\nCustom Glossary:');
console.log(customDiagram.getGlossary());

// Parse Mermaid test
console.log('\n=== Parse Mermaid Test ===');
const mermaidText = `
graph TD;
    P[Prompt];
    L{LLM};
    O[Response];
    M[Memory];
    P -->|Process| L;
    L -->|Output| O;
    subgraph AI[AI System]
        L --> M;
    end
    style P fill:#aaf;
    %% AI pipeline note
`;
console.log('Parsed JavaScript Code:');
console.log(createArielJS().fromMermaid(mermaidText));