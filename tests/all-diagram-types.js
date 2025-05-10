import createArielJS from '../src/ariel-js.js';

// Create an instance of ArielJS with a configuration object to use the new API
const ariel = createArielJS({useNewApi: true});

// 1. Flowchart Example
console.log('=== FLOWCHART DIAGRAM ===');
const flowchart = ariel('flowchart', 'TD');
flowchart
    .node('A', 'Start', { shape: 'stadium' })
    .edge('B', 'Process')
    .node('C', 'Decision?', { shape: 'diamond' })
    .edge('D', 'Yes')
    .node('D', 'Process 2', { shape: 'rect' })
    .edge('F', '')
    .node('C')
    .edge('E', 'No')
    .node('E', 'Process 3', { shape: 'rect' })
    .edge('F', '')
    .node('F', 'End', { shape: 'stadium' })
    .style('A', { fill: '#bbdefb', stroke: '#1976d2' })
    .style('F', { fill: '#bbdefb', stroke: '#1976d2' })
    .style('C', { fill: '#fff9c4', stroke: '#fbc02d' });

console.log(flowchart.toMermaid());

// 2. Sequence Diagram Example
console.log('\n=== SEQUENCE DIAGRAM ===');
const sequence = ariel('sequence');
sequence
    .participant('User', null, { type: 'actor' })
    .participant('Browser')
    .participant('Server')
    .participant('Database')
    .message('User', 'Browser', 'Enter Data', { activate: true })
    .message('Browser', 'Server', 'Submit API Request', { activate: true })
    .message('Server', 'Database', 'Query', { activate: true })
    .message('Database', 'Server', 'Response', { type: '-->', deactivate: true })
    .message('Server', 'Browser', 'API Response', { type: '-->', deactivate: true })
    .message('Browser', 'User', 'Display Result', { type: '-->', deactivate: true })
    .note('over', ['Browser', 'Server'], 'Critical Exchange')
    .loop('Every 5s', loop => {
        sequence
            .message('Browser', 'Server', 'Keepalive', { type: '-.->' })
            .message('Server', 'Browser', 'Acknowledge', { type: '-.->',  });
    });

console.log(sequence.toMermaid());

// 3. Class Diagram Example
console.log('\n=== CLASS DIAGRAM ===');
const classDiagram = ariel('class');
classDiagram
    .class('Animal', builder => {
        builder
            .attribute('Animal', 'name', 'String', '+')
            .attribute('Animal', 'age', 'int', '+')
            .method('Animal', 'makeSound', null, [], '+')
            .method('Animal', 'move', null, [], '+');
    })
    .class('Dog')
    .attribute('Dog', 'breed', 'String', '+')
    .method('Dog', 'bark', null, [], '+')
    .class('Cat')
    .attribute('Cat', 'color', 'String', '+')
    .method('Cat', 'meow', null, [], '+')
    .inheritance('Dog', 'Animal')
    .inheritance('Cat', 'Animal')
    .note('Dogs and cats are types of animals', ['Dog', 'Cat']);

console.log(classDiagram.toMermaid());

// 4. Entity Relationship Diagram Example
console.log('\n=== ER DIAGRAM ===');
const erDiagram = ariel('er');
erDiagram
    .entity('CUSTOMER', {
        id: { type: 'string', key: 'PK', comment: 'Unique identifier' },
        name: { type: 'string', key: '', comment: 'Customer name' },
        email: { type: 'string', key: '', comment: 'Contact email' }
    })
    .entity('ORDER', {
        id: { type: 'string', key: 'PK', comment: 'Order number' },
        customerId: { type: 'string', key: 'FK', comment: 'Customer reference' },
        orderDate: { type: 'date', key: '', comment: 'When order was placed' },
        status: { type: 'string', key: '', comment: 'Order status' }
    })
    .oneToMany('CUSTOMER', 'ORDER', 'places');

console.log(erDiagram.toMermaid());

// 5. State Diagram Example
console.log('\n=== STATE DIAGRAM ===');
const stateDiagram = ariel('state');
stateDiagram
    .state('Idle')
    .state('Active')
    .state('Error', 'System Error')
    .state('Processing', null, procs => {
        procs
            .state('Validating')
            .state('Processing')
            .state('Saving')
            .transition('Validating', 'Processing', 'Valid Input')
            .transition('Processing', 'Saving', 'Process Complete')
            .start('Validating');
    })
    .start('Idle')
    .transition('Idle', 'Active', 'User Login')
    .transition('Active', 'Processing', 'Start Task')
    .transition('Processing', 'Idle', 'Task Complete')
    .transition('Active', 'Error', 'System Failure')
    .transition('Error', 'Idle', 'Reset')
    .note('This is the main system state diagram', 'Idle');

console.log(stateDiagram.toMermaid());

// 6. Gantt Chart Example
console.log('\n=== GANTT CHART ===');
const ganttChart = ariel('gantt');
ganttChart
    .setTitle('Development Schedule')
    .setDateFormat('YYYY-MM-DD')
    .section('Planning')
    .task('Requirements Analysis', 'req', { start: '2023-01-01', end: '2023-01-05' })
    .task('System Design', 'design', { start: '2023-01-06', end: '2023-01-15', crit: true })
    .section('Development')
    .task('Backend Implementation', 'back', { start: '2023-01-16', end: '2023-01-31' })
    .task('Frontend Implementation', 'front', { start: '2023-01-16', end: '2023-01-31' })
    .task('API Integration', 'api', { start: '2023-02-01', end: '2023-02-10', dependencies: ['back', 'front'] })
    .section('Testing')
    .task('QA Testing', 'test', { start: '2023-02-11', end: '2023-02-20', dependencies: ['api'] })
    .task('User Acceptance Testing', 'uat', { start: '2023-02-21', end: '2023-02-28', dependencies: ['test'] })
    .milestone('Release v1.0', 'release', '2023-03-01');

console.log(ganttChart.toMermaid());

// 7. Pie Chart Example
console.log('\n=== PIE CHART ===');
const pieChart = ariel('pie');
pieChart
    .title('Browser Market Share')
    .valueSet('Chrome', 64.1)
    .valueSet('Edge', 10.8)
    .valueSet('Firefox', 8.2)
    .valueSet('Safari', 14.5)
    .valueSet('Others', 2.4);

console.log(pieChart.toMermaid());

// 8. User Journey Example
console.log('\n=== USER JOURNEY ===');
const journeyChart = ariel('journey');
journeyChart
    .title('Customer Onboarding Experience')
    .section('Discovery')
    .task('Find our product', 4, ['Customer'])
    .task('Research features', 3, ['Customer'])
    .section('Signup')
    .task('Create account', 5, ['Customer'])
    .task('Verify email', 2, ['Customer', 'System'])
    .section('First Use')
    .task('Initial tutorial', 5, ['Customer', 'System'])
    .task('Create first project', 4, ['Customer']);

console.log(journeyChart.toMermaid());

// 9. Mindmap Example
console.log('\n=== MINDMAP ===');
const mindmap = ariel('mindmap');
mindmap
    .root('Web Development')
    .child('Frontend')
        .child('HTML')
        .sibling('CSS')
        .sibling('JavaScript')
    .parent('Backend')
        .child('Node.js')
        .sibling('Python')
        .sibling('Databases')
            .child('SQL')
            .sibling('NoSQL')
        // Demonstrate icon usage with chaining
        .parent('Tools')
            .child('VS Code')
            .sibling('Git')
            .icon('GitHub', 'github');

console.log(mindmap.toMermaid());

// 10. Git Graph Example
console.log('\n=== GIT GRAPH ===');
const gitGraph = ariel('git');
gitGraph
    .branch('main')
    .commit('Initial commit')
    .branch('feature')
    .checkout('feature')
    .commit('Add new functionality')
    .commit('Fix bugs in the feature')
    .checkout('main')
    .merge('feature', 'Merge new feature')
    .commit('Release version 1.0', { tag: 'v1.0' });

console.log(gitGraph.toMermaid());

// Using the flow-based API for flowcharts
console.log('\n=== FLOWCHART WITH FLOW API ===');
const flowBasedChart = ariel('flowchart', 'LR');
flowBasedChart
    .flow('A', 'Start', { shape: 'stadium' })
    .to('B', 'Process 1')
    .to('C', 'Decision', { shape: 'diamond' })
    .flow('C')
    .to('D', 'Process 2', {}, 'Yes')
    .to('F', 'End', { shape: 'stadium' })
    .flow('C')
    .to('E', 'Process 3', {}, 'No')
    .to('F');

console.log(flowBasedChart.toMermaid());