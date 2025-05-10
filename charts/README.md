# ArielJS Charts Examples

This folder contains examples of using ArielJS to create Mermaid flowcharts.

## Files

- **examples/**: Directory containing various example diagrams in markdown format
- **examples-viewer.html**: Interactive viewer for diagrams with tabs for viewing the rendered chart, Mermaid syntax, and ArielJS code
- **example.md**: Original example Mermaid flowchart in markdown format
- **example-converted.js**: Sample ArielJS JavaScript code that generates a flowchart

## Usage

### Viewing Charts

Start a local server and open the examples viewer:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/examples-viewer.html` in your browser to see:
- The rendered diagrams
- The Mermaid syntax
- The equivalent ArielJS code

### Converting Mermaid to ArielJS

ArielJS has built-in conversion functionality. You can use it programmatically:

```javascript
import createArielJS from '../src/ariel-js.js';

// Parse Mermaid syntax
const mermaidText = 'graph TD; A-->B; B-->C;';
const jsCode = createArielJS().fromMermaid(mermaidText);
console.log(jsCode);
```

## Development

When developing new charts, you can:

1. Write Mermaid syntax directly and convert it to ArielJS
2. Create charts programmatically with ArielJS
3. Edit existing charts by modifying the JavaScript file

The bi-directional conversion enables easy switching between these approaches.