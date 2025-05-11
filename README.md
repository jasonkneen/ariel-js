
![alt text](public/arielJS.png)

# ArielJS Project

ArielJS is a jQuery-style, chainable JavaScript SDK for creating and converting Mermaid diagrams. It supports ALL Mermaid diagram types, with fluent API interfaces, bidirectional conversion, and customizable terminology.

## Supported Diagram Types

- **Flowcharts** - with simplified flow API for connected nodes
- **Sequence Diagrams** - for interactions between components
- **Class Diagrams** - for object-oriented relationships
- **Entity Relationship Diagrams** - for database modeling
- **State Diagrams** - for state machines and transitions
- **Gantt Charts** - for project planning and scheduling
- **Pie Charts** - for data visualization
- **User Journeys** - for user experience mapping
- **Mindmaps** - for organizing related ideas
- **Git Graphs** - for visualizing git workflows
- ... and more\!

## Installation

### Via npm

```bash
npm install ariel-js
```

### Manual Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/ariel-js-project.git
   ```

2. Navigate to the project directory:
   ```bash
   cd ariel-js-project
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Testing & Demos

- **Node.js Test**: Run the test script to see ArielJS in action:
  ```bash
  npm test
  ```

- **All Diagram Types**: View examples of all supported diagram types:
  ```bash
  node tests/all-diagram-types.js
  ```

- **Browser Demo**: Open `public/index.html` in a browser to visualize a Mermaid diagram.

- **Examples Viewer**: Launch the examples viewer to see all diagram types:
  ```bash
  cd charts && python3 -m http.server 8000
  ```
  Then open http://localhost:8000/examples-viewer.html in your browser.

## Usage

### Creating Diagrams

```javascript
// If installed via npm
import createArielJS from 'ariel-js';

// OR if using local files
// import createArielJS from './src/ariel-js.js';

// Create a specific diagram type
const ariel = createArielJS();
const flowchart = ariel('flowchart', 'TD');
const sequence = ariel('sequence');
const classDiagram = ariel('class');
const erDiagram = ariel('er');
// etc.
```

### Flowchart Examples

#### Classic Approach
```javascript
const chart = ariel('flowchart', 'LR')
    .node('A', 'Start')
    .edge('B', 'Next')
    .node('B', 'End');
```

#### Simplified Flow API
```javascript
const chart = ariel('flowchart', 'LR')
    .flow('A', 'Start', { shape: 'stadium' })
    .to('B', 'Process', { shape: 'rect' })
    .to('C', 'Decision', { shape: 'diamond' })
    
    // Create branches
    .flow('C')
    .to('D', 'Yes Path', {}, 'Yes')
    .to('F', 'End', { shape: 'stadium' })
    
    .flow('C')
    .to('E', 'No Path', {}, 'No')
    .to('F');
```

### Sequence Diagram Example

```javascript
const sequence = ariel('sequence')
    .participant('User', null, { type: 'actor' })
    .participant('Browser')
    .participant('Server')
    .message('User', 'Browser', 'Request Page')
    .message('Browser', 'Server', 'API Request')
    .message('Server', 'Browser', 'Response', { type: '-->' })
    .message('Browser', 'User', 'Display Page', { type: '-->' })
    .note('over', ['Browser', 'Server'], 'Critical Exchange');
```

### Class Diagram Example

```javascript
const classDiagram = ariel('class')
    .class('Animal')
    .attribute('Animal', 'name', 'String', '+')
    .method('Animal', 'makeSound', null, [], '+')
    .class('Dog')
    .attribute('Dog', 'breed', 'String', '+')
    .method('Dog', 'bark', null, [], '+')
    .inheritance('Dog', 'Animal');
```

### Entity Relationship Diagram Example

```javascript
const erDiagram = ariel('er')
    .entity('CUSTOMER')
    .attribute('CUSTOMER', 'id', 'string', 'PK')
    .attribute('CUSTOMER', 'name', 'string')
    .entity('ORDER')
    .attribute('ORDER', 'id', 'string', 'PK')
    .attribute('ORDER', 'customerId', 'string', 'FK')
    .oneToMany('CUSTOMER', 'ORDER', 'places');
```

### Gantt Chart Example

```javascript
const gantt = ariel('gantt')
    .setTitle('Project Schedule')
    .setDateFormat('YYYY-MM-DD')
    .section('Planning')
    .task('Requirements', 'req', { start: '2023-01-01', end: '2023-01-05' })
    .task('Design', 'design', { start: '2023-01-06', end: '2023-01-15' })
    .section('Development')
    .task('Implementation', 'impl', { start: '2023-01-16', end: '2023-01-31' });
```

### Custom Terminology

```javascript
const builder = createArielJS({
    methods: { addStep: 'node', connectTo: 'edge' },
    properties: { nodeType: 'shape' }
});
```

### Converting from Mermaid Syntax

```javascript
const mermaid = 'graph TD; A-->B;';
console.log(createArielJS().fromMermaid(mermaid));
```

## Files

- `src/ariel-js.js`: The ArielJS library
- `tests/test.js`: Basic test script
- `tests/all-diagram-types.js`: Examples of all diagram types
- `charts/examples-viewer.html`: Interactive diagram viewer
- `charts/examples/`: Example diagrams in Markdown format
- `LICENSE`: MIT License
