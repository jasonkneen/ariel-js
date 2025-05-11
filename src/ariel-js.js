// ariel-js.js
// ArielJS: A jQuery-style, chainable JavaScript SDK for building Mermaid diagrams
// Supports all Mermaid diagram types with customizable terminology and bidirectional conversion

// Base class for all diagram types
class MermaidDiagram {
    constructor(type) {
        this.type = type;
        this.content = [];
        this.indentation = 4;
    }

    addLine(line, indent = 1) {
        this.content.push(' '.repeat(this.indentation * indent) + line);
        return this;
    }

    addLines(lines, indent = 1) {
        for (const line of lines) {
            this.addLine(line, indent);
        }
        return this;
    }

    toMermaid() {
        return [this.getHeader(), ...this.content].join('\n');
    }

    getHeader() {
        return `${this.type}`;
    }
}

// Base class for flowchart-like diagrams
class FlowchartDiagram extends MermaidDiagram {
    constructor(type, direction = 'TD') {
        super(type);
        this.direction = direction;
        this.currentNode = null;
        this.currentSubgraph = null;
        this._lastCreatedNode = null;
        this.nodes = {};
        this.edges = [];
        this.subgraphs = [];
        this.styles = [];
        this.classes = [];
        this.annotations = [];
    }

    getHeader() {
        return `${this.type} ${this.direction}`;
    }
}

// Flowchart implementation
class FlowchartJS extends FlowchartDiagram {
    constructor(direction = 'TD') {
        super('flowchart', direction);
    }

    // Direction can be TB, TD, BT, RL, LR
    setDirection(dir) {
        this.direction = dir.toUpperCase();
        return this;
    }

    // Alias for direction to match Mermaid examples
    graph(dir) {
        return this.setDirection(dir);
    }

    // Alias for backwards compatibility
    direction(dir) {
        return this.setDirection(dir);
    }

    node(id, label, options = {}) {
        // If only id is provided, we're just changing the current node for edge creation
        if (label === undefined && Object.keys(options).length === 0) {
            this.currentNode = id;
            return this;
        }

        // Create or update a node with full details
        const { shape = 'rect', style = {}, metadata = {} } = options;
        const node = { id, label, shape: shape.toLowerCase(), style, metadata };
        
        if (this.currentSubgraph) {
            this.currentSubgraph.nodes[id] = node;
        } else {
            this.nodes[id] = node;
        }
        
        // Build mermaid syntax for the node
        const nodeStr = this.buildNodeString(id, label || '', shape);
        
        if (this.currentSubgraph) {
            this.currentSubgraph.addLine(nodeStr);
        } else {
            this.addLine(nodeStr);
        }
        
        this.currentNode = id;
        return this;
    }

    buildNodeString(id, label, shape) {
        label = (label || '').replace(/"/g, '\\"').replace(/\n/g, '\\n');
        
        switch (shape.toLowerCase()) {
            case 'round': return `${id}(${label});`;
            case 'stadium': return `${id}([${label}]);`;
            case 'subroutine': return `${id}[[${label}]];`;
            case 'cylindrical': return `${id}[(${label})];`;
            case 'circle': return `${id}((${label}));`;
            case 'asymmetric': return `${id}>${label}];`;
            case 'rhombus':
            case 'diamond': return `${id}{${label}};`;
            case 'hexagon': return `${id}{{${label}}};`;
            case 'parallelogram': return `${id}[/${label}/];`;
            case 'parallelogram-alt': return `${id}[\\${label}\\];`;
            case 'trapezoid': return `${id}[/${label}\\];`;
            case 'trapezoid-alt': return `${id}[\\${label}/];`;
            case 'doublecirc': return `${id}(((${label})));`;
            default: return `${id}[${label}];`;
        }
    }

    edge(targetId, label = '', options = {}) {
        if (!this.currentNode) {
            throw new Error('Current node must be set before creating an edge');
        }

        const { type = '-->', style = {}, metadata = {} } = options;
        const edge = { from: this.currentNode, to: targetId, label, arrow: type, style, metadata };
        
        const labelStr = label ? `|${label.replace(/\|/g, '\\|').replace(/\n/g, '\\n')}|` : '';
        const edgeStr = `${edge.from}${edge.arrow}${labelStr}${edge.to};`;
        
        if (this.currentSubgraph) {
            this.currentSubgraph.edges.push(edge);
            this.currentSubgraph.addLine(edgeStr);
        } else {
            this.edges.push(edge);
            this.addLine(edgeStr);
        }
        
        this.currentNode = targetId;
        return this;
    }

    subgraph(id, label, callback) {
        const subgraph = new SubgraphJS(id, label);
        const previousSubgraph = this.currentSubgraph;
        this.currentSubgraph = subgraph;
        
        // Add the subgraph header
        this.addLine(`subgraph ${id}[${label || ''}]`);
        
        // Execute the callback to define subgraph content
        callback(this);
        
        // End the subgraph
        this.addLine('end');
        
        // Restore the previous context
        this.currentSubgraph = previousSubgraph;
        this.subgraphs.push(subgraph);
        
        return this;
    }

    style(selector, properties) {
        const props = Object.entries(properties)
            .map(([k, v]) => `${k}:${v}`)
            .join(',');
            
        this.addLine(`style ${selector} ${props};`);
        this.styles.push({ selector, properties });
        return this;
    }

    class(className, ...nodeIds) {
        this.addLine(`class ${nodeIds.join(',')} ${className};`);
        this.classes.push({ className, nodes: nodeIds });
        return this;
    }

    // For comments (represented by %% in Mermaid)
    note(text, target = null) {
        const targetStr = target ? ` for ${target}` : '';
        this.addLine(`%% ${text}${targetStr}`);
        this.annotations.push({ text, target });
        return this;
    }

    // Simplified API for creating flows
    flow(id, label, options = {}) {
        this.node(id, label, options);
        this._lastCreatedNode = id;
        return this;
    }

    to(id, label, nodeOptions = {}, edgeLabel = '', edgeOptions = {}) {
        if (!this._lastCreatedNode) {
            return this.flow(id, label, nodeOptions);
        }

        const savedCurrentNode = this.currentNode;
        this.currentNode = this._lastCreatedNode;

        // Create edge to the new node
        this.edge(id, edgeLabel, edgeOptions);

        // Check if the node already exists
        const nodeExists = this.nodes[id] ||
            (this.currentSubgraph && this.currentSubgraph.nodes[id]);

        // Create the node if it doesn't exist yet
        if (!nodeExists) {
            this.node(id, label, nodeOptions);
        }

        this._lastCreatedNode = id;
        return this;
    }

    // For backwards compatibility with original API
    getGraph() {
        return {
            nodes: this.nodes,
            edges: this.edges,
            subgraphs: this.subgraphs,
            annotations: this.annotations,
            styles: this.styles,
            classes: this.classes
        };
    }

    getGlossary() {
        return {
            methods: {
                // Flow direction methods
                'graph': 'Sets the direction of the flowchart',
                'setDirection': 'Sets the direction of the flowchart (TB, TD, BT, RL, LR)',
                'direction': 'Sets the direction of the flowchart (alias for setDirection)',

                // Node and edge methods
                'node': 'Creates or selects a node in the flowchart',
                'edge': 'Creates an edge between the current node and a target node',

                // Simplified flow API
                'flow': 'Starts a flow from a specific node (creates it if needed)',
                'to': 'Adds a node connected to the previous node in the flow',

                // Structure and organization
                'subgraph': 'Creates a subgraph containing nodes and edges',

                // Styling
                'style': 'Applies CSS-style properties to a node or edge',
                'class': 'Assigns one or more CSS classes to nodes'
            },
            properties: {
                // Node properties
                'shape': 'The shape of a node (rect, round, stadium, diamond, circle, etc.)',
                'style': 'Custom CSS style properties for visual appearance',
                'metadata': 'Additional data to store with the node (not rendered)',

                // Edge properties
                'type': 'The type of an edge (-->, -.-, etc.)',
                'style': 'Custom CSS style properties for the edge',
                'metadata': 'Additional data to store with the edge (not rendered)'
            }
        };
    }
}

// Subgraph implementation for flowcharts
class SubgraphJS {
    constructor(id, label) {
        this.id = id;
        this.label = label;
        this.nodes = {};
        this.edges = [];
        this.content = [];
    }

    addLine(line) {
        this.content.push(line);
        return this;
    }
}

// Sequence Diagram implementation
class SequenceDiagramJS extends MermaidDiagram {
    constructor() {
        super('sequenceDiagram');
        this.actors = new Set();
        this.notes = [];
        this.loops = [];
        this.alts = [];
        this.participants = [];
    }

    participant(name, alias = null, options = {}) {
        const displayName = alias ? `${name} as ${alias}` : name;
        const actorId = alias || name;
        
        this.actors.add(actorId);
        this.participants.push({ name, alias, options });
        
        if (options.type === 'actor') {
            this.addLine(`actor ${displayName}`);
        } else {
            this.addLine(`participant ${displayName}`);
        }
        
        return this;
    }

    message(from, to, text, options = {}) {
        const { type = '->>', activate = false, deactivate = false } = options;
        
        // Ensure actors exist
        [from, to].forEach(actor => {
            if (!this.actors.has(actor)) {
                this.participant(actor);
            }
        });
        
        // Add the message line
        this.addLine(`${from}${type}${to}: ${text}`);
        
        // Handle activation/deactivation
        if (activate) {
            this.addLine(`activate ${to}`);
        }
        if (deactivate) {
            this.addLine(`deactivate ${to}`);
        }
        
        return this;
    }

    note(position, actors, text) {
        if (Array.isArray(actors)) {
            this.addLine(`Note ${position} ${actors.join(',')}: ${text}`);
        } else {
            this.addLine(`Note ${position} ${actors}: ${text}`);
        }
        return this;
    }

    noteOver(actors, text) {
        return this.note('over', actors, text);
    }

    noteLeft(actor, text) {
        return this.note('left of', actor, text);
    }

    noteRight(actor, text) {
        return this.note('right of', actor, text);
    }

    loop(label, callback) {
        this.addLine(`loop ${label}`);
        callback(this);
        this.addLine('end');
        return this;
    }

    alt(label, callback) {
        this.addLine(`alt ${label}`);
        callback(this);
        return this;
    }

    else(label, callback) {
        this.addLine(`else ${label}`);
        callback(this);
        return this;
    }

    opt(label, callback) {
        this.addLine(`opt ${label}`);
        callback(this);
        this.addLine('end');
        return this;
    }

    par(label, callback) {
        this.addLine(`par ${label}`);
        callback(this);
        return this;
    }

    and(label, callback) {
        this.addLine(`and ${label}`);
        callback(this);
        return this;
    }

    critical(label, callback) {
        this.addLine(`critical ${label}`);
        callback(this);
        return this;
    }

    breakFor(label, callback) {
        this.addLine(`break ${label}`);
        callback(this);
        this.addLine('end');
        return this;
    }

    rect(color, callback) {
        this.addLine(`rect ${color}`);
        callback(this);
        this.addLine('end');
        return this;
    }

    activate(actor) {
        this.addLine(`activate ${actor}`);
        return this;
    }

    deactivate(actor) {
        this.addLine(`deactivate ${actor}`);
        return this;
    }

    destroy(actor) {
        this.addLine(`destroy ${actor}`);
        return this;
    }
}

// Class Diagram Implementation
class ClassDiagramJS extends MermaidDiagram {
    constructor() {
        super('classDiagram');
        this.classes = {};
        this.relationships = [];
    }

    class(name, definition = null) {
        this.classes[name] = { name, members: [] };
        
        if (definition) {
            this.addLine(`class ${name} {`);
            if (typeof definition === 'function') {
                definition(this);
            } else if (typeof definition === 'string') {
                this.addLine(definition, 2);
            }
            this.addLine('}');
        } else {
            this.addLine(`class ${name}`);
        }
        
        return this;
    }

    classWithMembers(name, members = {}) {
        const { attributes = [], methods = [] } = members;
        
        this.addLine(`class ${name} {`);
        
        // Add attributes
        for (const attr of attributes) {
            this.addLine(attr, 2);
        }
        
        // Add methods
        for (const method of methods) {
            this.addLine(method, 2);
        }
        
        this.addLine('}');
        return this;
    }

    member(className, member) {
        if (this.classes[className]) {
            this.classes[className].members.push(member);
            
            // If the class is already defined, redefine it with the new member
            const classContent = this.content.findIndex(line => 
                line.trim().startsWith(`class ${className} {`) ||
                line.trim() === `class ${className}`
            );
            
            if (classContent >= 0 && !this.content[classContent].includes('{')) {
                // Replace the simple class declaration with one that has members
                this.content.splice(classContent, 1, 
                    `    class ${className} {`, 
                    `        ${member}`,
                    '    }');
            } else if (classContent >= 0) {
                // Find the closing brace and insert before it
                const closingBrace = this.content.findIndex((line, idx) => 
                    idx > classContent && line.trim() === '}');
                
                if (closingBrace >= 0) {
                    this.content.splice(closingBrace, 0, `        ${member}`);
                }
            }
        } else {
            // Create a new class with this member
            this.addLine(`class ${className} {`);
            this.addLine(member, 2);
            this.addLine('}');
            this.classes[className] = { name: className, members: [member] };
        }
        
        return this;
    }

    method(className, methodName, returnType = null, params = [], visibility = null) {
        const methodPrefix = visibility ? `${visibility} ` : '';
        const methodParams = params.join(', ');
        const methodReturnType = returnType ? ` ${returnType}` : '';
        
        const methodDef = `${methodPrefix}${methodName}(${methodParams})${methodReturnType}`;
        
        return this.member(className, methodDef);
    }

    attribute(className, attrName, type = null, visibility = null) {
        const attrPrefix = visibility ? `${visibility} ` : '';
        const attrType = type ? ` ${type}` : '';
        
        const attrDef = `${attrPrefix}${attrName}${attrType}`;
        
        return this.member(className, attrDef);
    }

    // Define relationships between classes
    // types: <|-- (inheritance), *-- (composition), o-- (aggregation), --> (association), -- (link), ..> (dependency), ..|> (realization), 
    relationship(from, to, type = '-->', label = '') {
        // Ensure both classes exist
        if (!this.classes[from]) this.class(from);
        if (!this.classes[to]) this.class(to);
        
        this.relationships.push({ from, to, type, label });
        
        const fromLabel = label.split('|')[0] || '';
        const toLabel = label.split('|')[1] || '';
        
        const relationshipStr = fromLabel 
            ? `${from} "${fromLabel}" ${type} "${toLabel}" ${to}`
            : `${from} ${type} ${to}`;
            
        this.addLine(relationshipStr);
        
        return this;
    }

    inheritance(child, parent, label = '') {
        return this.relationship(child, parent, '<|--', label);
    }

    composition(container, contained, label = '') {
        return this.relationship(container, contained, '*--', label);
    }

    aggregation(container, contained, label = '') {
        return this.relationship(container, contained, 'o--', label);
    }

    association(from, to, label = '') {
        return this.relationship(from, to, '-->', label);
    }

    dependency(dependent, dependency, label = '') {
        return this.relationship(dependent, dependency, '..>', label);
    }

    realization(implementation, interfaceClass, label = '') {
        return this.relationship(implementation, interfaceClass, '..|>', label);
    }

    note(text, classNames) {
        if (Array.isArray(classNames)) {
            this.addLine(`note for ${classNames.join(',')}: ${text}`);
        } else {
            this.addLine(`note for ${classNames}: ${text}`);
        }
        return this;
    }

    link(className, url) {
        this.addLine(`link ${className} "${url}"`);
        return this;
    }

    callback(callbackText) {
        this.addLine(`callback ${callbackText}`);
        return this;
    }

    namespace(name, callback) {
        this.addLine(`namespace ${name} {`);
        callback(this);
        this.addLine('}');
        return this;
    }
}

// Entity Relationship Diagram
class ERDiagramJS extends MermaidDiagram {
    constructor() {
        super('erDiagram');
        this.entities = {};
        this.relationships = [];
    }

    entity(name, attributes = null) {
        this.entities[name] = { name, attributes: {} };
        
        if (attributes) {
            this.addLine(`${name} {`);
            
            if (typeof attributes === 'function') {
                attributes(this);
            } else if (typeof attributes === 'object') {
                // Convert the object of attributes to lines
                for (const [attrName, attr] of Object.entries(attributes)) {
                    const { type, key = '', comment = '' } = attr;
                    const commentStr = comment ? ` "${comment}"` : '';
                    this.addLine(`${type} ${attrName} ${key}${commentStr}`, 2);
                }
            }
            
            this.addLine('}');
        }
        
        return this;
    }

    attribute(entityName, name, type, key = '', comment = '') {
        if (!this.entities[entityName]) {
            this.entity(entityName);
        }
        
        this.entities[entityName].attributes[name] = { type, key, comment };
        
        // If we already defined the entity block, find and update it
        const entityStart = this.content.findIndex(line => 
            line.trim() === `${entityName} {`);
        
        const commentStr = comment ? ` "${comment}"` : '';
        
        if (entityStart >= 0) {
            // Find the closing brace
            const entityEnd = this.content.findIndex((line, idx) => 
                idx > entityStart && line.trim() === '}');
            
            if (entityEnd >= 0) {
                // Insert the attribute before the closing brace
                this.content.splice(entityEnd, 0, 
                    `        ${type} ${name} ${key}${commentStr}`);
            }
        } else {
            // Create a new entity block with this attribute
            this.addLine(`${entityName} {`);
            this.addLine(`${type} ${name} ${key}${commentStr}`, 2);
            this.addLine('}');
        }
        
        return this;
    }

    // Define relationships between entities
    // Cardinality: |o (zero or one), || (exactly one), }o (zero or many), }| (one or many)
    relationship(entity1, cardinality1, cardinality2, entity2, label, attributeBlock = null) {
        // Ensure both entities exist
        if (!this.entities[entity1]) this.entity(entity1);
        if (!this.entities[entity2]) this.entity(entity2);
        
        const relationshipStr = `${entity1} ${cardinality1}--${cardinality2} ${entity2} : ${label}`;
        this.addLine(relationshipStr);
        
        if (attributeBlock) {
            this.addLine(`${entity1}--${entity2} : ${attributeBlock}`);
        }
        
        this.relationships.push({ 
            entity1, 
            cardinality1, 
            entity2, 
            cardinality2, 
            label, 
            attributeBlock 
        });
        
        return this;
    }

    oneToOne(entity1, entity2, label) {
        return this.relationship(entity1, '||', '||', entity2, label);
    }

    oneToMany(entity1, entity2, label) {
        return this.relationship(entity1, '||', '}|', entity2, label);
    }

    manyToOne(entity1, entity2, label) {
        return this.relationship(entity1, '}|', '||', entity2, label);
    }

    manyToMany(entity1, entity2, label) {
        return this.relationship(entity1, '}|', '|{', entity2, label);
    }

    zeroOrOneToMany(entity1, entity2, label) {
        return this.relationship(entity1, '|o', '}|', entity2, label);
    }

    zeroOrOneToOne(entity1, entity2, label) {
        return this.relationship(entity1, '|o', '||', entity2, label);
    }
}

// State Diagram
class StateDiagramJS extends MermaidDiagram {
    constructor(version = 'v2') {
        super(`stateDiagram${version === 'v2' ? '-v2' : ''}`);
        this.states = new Set(['[*]']); // Start and end state always exist
        this.transitions = [];
        this.notes = [];
        this.concurrentStates = {};
    }

    state(name, label = null, callback = null) {
        this.states.add(name);
        
        if (label && callback) {
            // Composite state
            this.addLine(`state ${label} as ${name} {`);
            callback(this);
            this.addLine('}');
        } else if (label) {
            // State with description
            this.addLine(`state "${label}" as ${name}`);
        } else if (callback) {
            // Anonymous composite state
            this.addLine(`state ${name} {`);
            callback(this);
            this.addLine('}');
        } else {
            // Simple state
            this.addLine(`state ${name}`);
        }
        
        return this;
    }

    transition(from, to, label = null, options = {}) {
        // Add states if they don't exist yet
        if (!this.states.has(from)) this.state(from);
        if (!this.states.has(to)) this.state(to);
        
        // Create the transition string
        let transitionStr = `${from} --> ${to}`;
        if (label) transitionStr += ` : ${label}`;
        
        this.addLine(transitionStr);
        this.transitions.push({ from, to, label, options });
        
        return this;
    }

    start(to, label = null) {
        return this.transition('[*]', to, label);
    }

    end(from, label = null) {
        return this.transition(from, '[*]', label);
    }

    note(text, stateName, position = 'right of') {
        this.addLine(`note ${position} ${stateName}: ${text}`);
        this.notes.push({ text, stateName, position });
        return this;
    }

    noteLeft(text, stateName) {
        return this.note(text, stateName, 'left of');
    }

    noteRight(text, stateName) {
        return this.note(text, stateName, 'right of');
    }

    concurrentState(name, callback) {
        this.addLine(`state ${name} {`);
        this.addLine('[*] --> fork');
        this.addLine('fork --> branch1');
        this.addLine('fork --> branch2');
        
        if (callback) callback(this);
        
        this.addLine('branch1 --> join');
        this.addLine('branch2 --> join');
        this.addLine('join --> [*]');
        this.addLine('}');
        
        return this;
    }

    fork(name, callback) {
        this.addLine(`state ${name} <<fork>>`);
        if (callback) callback(this);
        return this;
    }

    join(name, callback) {
        this.addLine(`state ${name} <<join>>`);
        if (callback) callback(this);
        return this;
    }

    choice(name, callback) {
        this.addLine(`state ${name} <<choice>>`);
        if (callback) callback(this);
        return this;
    }
}

// Gantt Chart
class GanttChartJS extends MermaidDiagram {
    constructor() {
        super('gantt');
        this.sections = {};
        this.tasks = [];
        this.dateFormat = 'YYYY-MM-DD';
        this.axisFormat = '%Y-%m-%d';
        this.title = 'Gantt Chart';
        this.excludes = [];
        this.todayMarker = 'off';
    }

    setTitle(title) {
        this.title = title;
        this.addLine(`title ${title}`);
        return this;
    }

    setDateFormat(format) {
        this.dateFormat = format;
        this.addLine(`dateFormat ${format}`);
        return this;
    }

    setAxisFormat(format) {
        this.axisFormat = format;
        this.addLine(`axisFormat ${format}`);
        return this;
    }

    setExcludes(daysOrDateRanges) {
        const excludeStr = Array.isArray(daysOrDateRanges) 
            ? daysOrDateRanges.join(', ') 
            : daysOrDateRanges;
            
        this.excludes = daysOrDateRanges;
        this.addLine(`excludes ${excludeStr}`);
        return this;
    }

    setTodayMarker(style) {
        this.todayMarker = style;
        this.addLine(`todayMarker ${style}`);
        return this;
    }

    section(name) {
        this.sections[name] = { name, tasks: [] };
        this.addLine(`section ${name}`);
        return this;
    }

    task(name, id, options = {}) {
        const { start, end, dependencies = [], milestone = false, done = false, crit = false, active = false } = options;
        
        let taskStr = name;
        const statusMarkers = [];
        
        if (done) statusMarkers.push('done');
        if (active) statusMarkers.push('active');
        if (crit) statusMarkers.push('crit');
        if (milestone) statusMarkers.push('milestone');
        
        if (statusMarkers.length > 0) {
            taskStr += ` :${statusMarkers.join(',')}`;
        }
        
        taskStr += `, ${id}`;
        
        if (start && end) {
            taskStr += `, ${start}, ${end}`;
        } else if (start && dependencies.length === 0) {
            taskStr += `, ${start}`;
        }
        
        if (dependencies.length > 0) {
            taskStr += `, after ${dependencies.join(' ')}`;
        }
        
        this.addLine(taskStr);
        
        // Add to the current section if there is one
        const currentSection = Object.keys(this.sections).pop();
        if (currentSection) {
            this.sections[currentSection].tasks.push({ name, id, options });
        }
        
        this.tasks.push({ name, id, section: currentSection, options });
        
        return this;
    }

    milestone(name, id, date = null) {
        return this.task(name, id, { milestone: true, start: date });
    }

    criticalTask(name, id, options = {}) {
        return this.task(name, id, { ...options, crit: true });
    }

    activeTask(name, id, options = {}) {
        return this.task(name, id, { ...options, active: true });
    }

    completedTask(name, id, options = {}) {
        return this.task(name, id, { ...options, done: true });
    }

    toMermaid() {
        let result = 'gantt\n';
        
        // Add title and config if not already added
        if (!this.content.some(line => line.startsWith('    title '))) {
            result += `    title ${this.title}\n`;
        }
        
        if (!this.content.some(line => line.startsWith('    dateFormat '))) {
            result += `    dateFormat ${this.dateFormat}\n`;
        }
        
        if (this.axisFormat && !this.content.some(line => line.startsWith('    axisFormat '))) {
            result += `    axisFormat ${this.axisFormat}\n`;
        }
        
        if (this.excludes.length > 0 && !this.content.some(line => line.startsWith('    excludes '))) {
            const excludeStr = Array.isArray(this.excludes) 
                ? this.excludes.join(', ') 
                : this.excludes;
                
            result += `    excludes ${excludeStr}\n`;
        }
        
        if (this.todayMarker !== 'off' && !this.content.some(line => line.startsWith('    todayMarker '))) {
            result += `    todayMarker ${this.todayMarker}\n`;
        }
        
        // Add all the content
        result += this.content.join('\n');
        
        return result;
    }
}

// Pie Chart
class PieChartJS extends MermaidDiagram {
    constructor() {
        super('pie');
        this.data = {};
        this.chartTitle = 'Pie Chart';
        this.showLegend = true;
    }

    title(title) {
        this.chartTitle = title;
        this.addLine(`title ${title}`);
        return this;
    }

    showData(show) {
        this.showLegend = show;
        this.addLine(`showData ${show}`);
        return this;
    }

    valueSet(label, value) {
        this.data[label] = value;
        this.addLine(`"${label}" : ${value}`);
        return this;
    }

    data(dataObject) {
        for (const [label, value] of Object.entries(dataObject)) {
            this.valueSet(label, value);
        }
        return this;
    }

    toMermaid() {
        let result = 'pie\n';
        
        // Add title if not already added
        if (!this.content.some(line => line.startsWith('    title '))) {
            result += `    title ${this.chartTitle}\n`;
        }
        
        // Add showData if needed
        if (!this.showLegend && !this.content.some(line => line.startsWith('    showData '))) {
            result += '    showData false\n';
        }
        
        // Add all the content (data entries)
        result += this.content.join('\n');
        
        return result;
    }
}

// User Journey
class JourneyChartJS extends MermaidDiagram {
    constructor() {
        super('journey');
        this.tasks = {};
        this.chartTitle = 'User Journey';
        this.sections = [];
    }

    title(title) {
        this.chartTitle = title;
        this.addLine(`title ${title}`);
        return this;
    }

    section(name) {
        this.sections.push(name);
        this.addLine(`section ${name}`);
        return this;
    }

    task(name, score, participants = ['User']) {
        if (score < 1 || score > 5) {
            throw new Error('Score must be between 1 and 5');
        }
        
        const participantStr = Array.isArray(participants) 
            ? participants.join(',') 
            : participants;
            
        this.addLine(`${name}: ${score}: ${participantStr}`);
        
        // Add to tasks dictionary
        this.tasks[name] = { score, participants };
        
        return this;
    }
}

// Mindmap diagram
class MindmapJS extends MermaidDiagram {
    constructor() {
        super('mindmap');
        this.rootNode = null;
        this.currentLevel = 0;
        this.currentIndent = 0;
    }

    root(text) {
        this.rootNode = text;
        this.addLine(`root(${text})`);
        this.currentLevel = 1;
        return this;
    }

    node(text, shape = null, indent = null) {
        // If indentation is specified, use it; otherwise use the current level
        const nodeIndent = indent !== null ? indent : this.currentLevel;
        
        // Shape syntax: () () for root, (x) for square, [x] for rounded rect, ((x)) for circle,
        // >x] for bang, {x} for rhombus, {{x}} for hexagon, [/x/] for parallelogram,
        // [\x\] for trapezoid, /x/ for ellipse, (((x))) for stadium, (x) for subroutine
        let shapePrefix = '';
        let shapeSuffix = '';
        
        if (shape) {
            switch (shape.toLowerCase()) {
                case 'round': shapePrefix = '('; shapeSuffix = ')'; break;
                case 'square': shapePrefix = '['; shapeSuffix = ']'; break;
                case 'circle': shapePrefix = '(('; shapeSuffix = '))'; break;
                case 'bang': shapePrefix = '>'; shapeSuffix = ']'; break;
                case 'rhombus': shapePrefix = '{'; shapeSuffix = '}'; break;
                case 'hexagon': shapePrefix = '{{'; shapeSuffix = '}}'; break;
                case 'parallelogram': shapePrefix = '[/'; shapeSuffix = '/]'; break;
                case 'trapezoid': shapePrefix = '[\\'; shapeSuffix = '\\]'; break;
                case 'ellipse': shapePrefix = '/'; shapeSuffix = '/'; break;
                case 'stadium': shapePrefix = '((('; shapeSuffix = ')))'; break;
                case 'subroutine': shapePrefix = '['; shapeSuffix = ']'; break;
                case 'cylinder': shapePrefix = '[('; shapeSuffix = ')]'; break;
                case 'cloud': shapePrefix = '('; shapeSuffix = ')'; break;
            }
        }
        
        const nodeStr = '  '.repeat(nodeIndent) + `${shapePrefix}${text}${shapeSuffix}`;
        this.addLine(nodeStr, 0); // Use 0 because we're manually indenting
        
        return this;
    }

    child(text, shape = null) {
        this.currentLevel++;
        this.node(text, shape);
        return this;
    }

    sibling(text, shape = null) {
        this.node(text, shape);
        return this;
    }

    parent(text, shape = null) {
        if (this.currentLevel > 1) {
            this.currentLevel--;
        }
        this.node(text, shape);
        return this;
    }

    icon(text, iconName) {
        return this.node(`${text}::icon(${iconName})`);
    }
}

// Git Graph
class GitGraphJS extends MermaidDiagram {
    constructor(options = {}) {
        super('gitGraph');
        this.options = options;
        this.branches = [];
        this.commits = [];
        this.currentBranch = 'main';
        
        // Set the options
        if (options.showBranches !== undefined) {
            this.addLine(`showBranches ${options.showBranches}`);
        }
        
        if (options.showCommitLabel !== undefined) {
            this.addLine(`showCommitLabel ${options.showCommitLabel}`);
        }
        
        if (options.mainBranchName) {
            this.currentBranch = options.mainBranchName;
            this.addLine(`mainBranchName ${options.mainBranchName}`);
        }
        
        if (options.mainBranchOrder !== undefined) {
            this.addLine(`mainBranchOrder ${options.mainBranchOrder}`);
        }
    }

    branch(name, order = null) {
        this.branches.push(name);
        this.currentBranch = name;
        
        const orderStr = order !== null ? ` order: ${order}` : '';
        this.addLine(`branch ${name}${orderStr}`);
        
        return this;
    }

    checkout(branchName) {
        if (!this.branches.includes(branchName) && branchName !== this.currentBranch) {
            this.branch(branchName);
        }
        
        this.currentBranch = branchName;
        this.addLine(`checkout ${branchName}`);
        
        return this;
    }

    commit(message = '', options = {}) {
        const { id, tag, type } = options;
        
        let commitStr = 'commit';
        
        if (message) {
            commitStr += ` "${message}"`;
        }
        
        if (id) {
            commitStr += ` id: "${id}"`;
        }
        
        if (tag) {
            commitStr += ` tag: "${tag}"`;
        }
        
        if (type) {
            commitStr += ` type: ${type}`;
        }
        
        this.addLine(commitStr);
        this.commits.push({ message, branch: this.currentBranch, options });
        
        return this;
    }

    merge(branchName, commitMessage = '') {
        let mergeStr = `merge ${branchName}`;
        
        if (commitMessage) {
            mergeStr += ` "${commitMessage}"`;
        }
        
        this.addLine(mergeStr);
        
        return this;
    }

    cherryPick(commitId, options = {}) {
        let cherryPickStr = `cherry-pick ${commitId}`;
        
        if (options.tag) {
            cherryPickStr += ` tag: "${options.tag}"`;
        }
        
        this.addLine(cherryPickStr);
        
        return this;
    }
}

// Base Diagram Factory Class
class ArielJSFactory {
    static createDiagram(type, ...args) {
        switch (type.toLowerCase()) {
            case 'flowchart':
            case 'flow':
            case 'graph':
                return new FlowchartJS(...args);
                
            case 'sequence':
            case 'sequencediagram':
                return new SequenceDiagramJS();
                
            case 'class':
            case 'classdiagram':
                return new ClassDiagramJS();
                
            case 'er':
            case 'erdiagram':
            case 'entityrelationship':
                return new ERDiagramJS();
                
            case 'state':
            case 'statediagram':
                return new StateDiagramJS();
                
            case 'gantt':
            case 'ganttchart':
                return new GanttChartJS();
                
            case 'pie':
            case 'piechart':
                return new PieChartJS();
                
            case 'journey':
            case 'userjourney':
                return new JourneyChartJS();
                
            case 'mindmap':
                return new MindmapJS();
                
            case 'git':
            case 'gitgraph':
                return new GitGraphJS(...args);
                
            default:
                throw new Error(`Unsupported diagram type: ${type}`);
        }
    }
    
    static fromMermaid(mermaidText) {
        // Detect the type of diagram from the first line
        const firstLine = mermaidText.trim().split('\n')[0].trim();
        
        // Extract the diagram type
        let diagramType;
        if (firstLine.startsWith('graph ') || firstLine.startsWith('flowchart ')) {
            diagramType = 'flowchart';
        } else if (firstLine.startsWith('sequenceDiagram')) {
            diagramType = 'sequence';
        } else if (firstLine.startsWith('classDiagram')) {
            diagramType = 'class';
        } else if (firstLine.startsWith('erDiagram')) {
            diagramType = 'er';
        } else if (firstLine.startsWith('stateDiagram')) {
            diagramType = 'state';
        } else if (firstLine.startsWith('gantt')) {
            diagramType = 'gantt';
        } else if (firstLine.startsWith('pie')) {
            diagramType = 'pie';
        } else if (firstLine.startsWith('journey')) {
            diagramType = 'journey';
        } else if (firstLine.startsWith('mindmap')) {
            diagramType = 'mindmap';
        } else if (firstLine.startsWith('gitGraph')) {
            diagramType = 'git';
        } else {
            throw new Error(`Unsupported or unrecognized diagram type in: ${firstLine}`);
        }
        
        return this.parseMermaidByType(diagramType, mermaidText);
    }
    
    static parseMermaidByType(type, mermaidText) {
        const lines = mermaidText.split('\n').map(line => line.trim()).filter(line => line);
        let jsCode = '';
        
        switch(type) {
            case 'flowchart':
                return this.parseFlowchart(lines);
            case 'sequence':
                return this.parseSequenceDiagram(lines);
            case 'class':
                return this.parseClassDiagram(lines);
            case 'er':
                return this.parseERDiagram(lines);
            case 'state':
                return this.parseStateDiagram(lines);
            case 'gantt':
                return this.parseGanttChart(lines);
            case 'pie':
                return this.parsePieChart(lines);
            case 'journey':
                return this.parseJourneyChart(lines);
            case 'mindmap':
                return this.parseMindmap(lines);
            case 'git':
                return this.parseGitGraph(lines);
            default:
                throw new Error(`Parser not implemented for ${type} diagrams`);
        }
    }
    
    // Only implementing the parseFlowchart for backwards compatibility
    static parseFlowchart(lines) {
        let jsCode = 'new FlowchartJS()';
        let currentSubgraphLevel = 0;
        const subgraphStack = [];

        // Process nodes first to ensure they're defined before edges
        const nodeLines = [];
        const edgeLines = [];
        const otherLines = [];

        for (const line of lines) {
            if (line.match(/^graph\s+\w+/i) ||
                line.match(/^flowchart\s+\w+/i) ||
                line.startsWith('%%') ||
                line.match(/^subgraph/) ||
                line === 'end' ||
                line.match(/^style/) ||
                line.match(/^class/)) {
                otherLines.push(line);
            } else if (line.match(/(\w+)\s*(\[([^\]]*)\]|\(([^)]+)\)|{([^}]+)}|\(\(([^)]+)\)\))/)) {
                nodeLines.push(line);
            } else if (line.match(/(\w+)\s*(-+>|-->\|([^|]*?)\||-->|==>|-.->)\s*(\w+)/)) {
                edgeLines.push(line);
            } else {
                otherLines.push(line);
            }
        }

        // Process direction, nodes, edges, and other elements
        const allLines = [...otherLines];
        // Insert nodes and edges at appropriate positions
        let nodeIndex = allLines.findIndex(line => line.match(/^subgraph/)) || allLines.length;
        if (nodeIndex === -1) nodeIndex = allLines.length;
        allLines.splice(nodeIndex, 0, ...nodeLines);
        allLines.splice(nodeIndex + nodeLines.length, 0, ...edgeLines);

        for (const line of allLines) {
            if (line.match(/^graph\s+\w+/i) || line.match(/^flowchart\s+\w+/i)) {
                const direction = line.match(/(?:graph|flowchart)\s+(\w+)/i)?.[1];
                if (direction) jsCode += `\n    .graph('${direction}')`;
                continue;
            }
            if (line.startsWith('%%')) {
                const text = line.slice(2).trim().replace(/'/g, "\\'");
                const targetMatch = line.match(/%%.*for\s+(\w+)/);
                const indent = '    '.repeat(currentSubgraphLevel + 1);
                if (targetMatch) {
                    jsCode += `\n${indent}.note('${text}', '${targetMatch[1]}')`;
                } else {
                    jsCode += `\n${indent}.note('${text}')`;
                }
                continue;
            }
            if (line.match(/^subgraph\s+\w+/)) {
                const match = line.match(/subgraph\s+(\w+)\s*\[(.*?)\]/);
                if (match) {
                    const [, id, label] = match;
                    const indent = '    '.repeat(currentSubgraphLevel + 1);
                    jsCode += `\n${indent}.subgraph('${id}', '${label.replace(/'/g, "\\'")}', builder => builder`;
                    subgraphStack.push(id);
                    currentSubgraphLevel++;
                }
                continue;
            }
            if (line === 'end') {
                currentSubgraphLevel--;
                // If we're closing the last subgraph, don't add a newline after the closing parenthesis
                if (currentSubgraphLevel === 0) {
                    jsCode += `)`;
                } else {
                    jsCode += `);\n`;
                }
                subgraphStack.pop();
                continue;
            }
            const nodeMatch = line.match(/(\w+)\s*(\[([^\]]*)\]|\(([^)]+)\)|{([^}]+)}|\(\(([^)]+)\)\))/);
            if (nodeMatch) {
                const [, id, , rectLabel, roundLabel, diamondLabel, circleLabel] = nodeMatch;
                const label = (rectLabel || roundLabel || diamondLabel || circleLabel || '').replace(/'/g, "\\'");
                const shape = rectLabel ? 'rect' : roundLabel ? 'round' : diamondLabel ? 'diamond' : 'circle';
                const indent = '    '.repeat(currentSubgraphLevel + 1);
                jsCode += `\n${indent}.node('${id}', '${label}', { shape: '${shape}' })`;
                continue;
            }
            const edgeMatch = line.match(/(\w+)\s*(-+>|-->\|([^|]*?)\||-->|==>|-.->)\s*(\w+)/);
            if (edgeMatch) {
                const [, from, arrow, label, to] = edgeMatch;
                const indent = '    '.repeat(currentSubgraphLevel + 1);
                if (label) {
                    jsCode += `\n${indent}.node('${from}')`;
                    jsCode += `\n${indent}.edge('${to}', '${label.replace(/'/g, "\\'")}', { type: '${arrow}' })`;
                } else {
                    jsCode += `\n${indent}.node('${from}')`;
                    jsCode += `\n${indent}.edge('${to}', '', { type: '${arrow}' })`;
                }
                continue;
            }
            const styleMatch = line.match(/style\s+(\w+)\s+(.+)/);
            if (styleMatch) {
                const [, selector, props] = styleMatch;
                const properties = props.split(',').reduce((acc, prop) => {
                    const [key, value] = prop.split(':').map(s => s.trim());
                    if (key && value) acc[key] = value;
                    return acc;
                }, {});
                const indent = '    '.repeat(currentSubgraphLevel + 1);
                jsCode += `\n${indent}.style('${selector}', ${JSON.stringify(properties)})`;
                continue;
            }
            const classMatch = line.match(/class\s+(.+)\s+(\w+)/);
            if (classMatch) {
                const [, nodes, className] = classMatch;
                const nodeIds = nodes.split(',').map(n => n.trim());
                const indent = '    '.repeat(currentSubgraphLevel + 1);
                jsCode += `\n${indent}.class('${className}', '${nodeIds.join("', '")}')`;
                continue;
            }
        }

        jsCode += ';';
        return jsCode;
    }
    
    // Other parser methods would be implemented here
}

// Main entry point for ArielJS
function createArielJS(config = {}) {
    const factory = new ArielJSFactory();

    // Handle the legacy direct flowchart return vs. factory function
    const isFactoryMode = Boolean(config.factoryMode !== false);

    // First, set up basic diagram factory or flowchart
    let result;

    if (isFactoryMode) {
        // Modern API: Create a function that returns a new diagram based on type
        result = function(type = 'flowchart', ...args) {
            return ArielJSFactory.createDiagram(type, ...args);
        };

        // Add static methods to the function
        result.fromMermaid = ArielJSFactory.fromMermaid.bind(ArielJSFactory);

        // Add convenience method for creating flowcharts
        result.create = (direction = 'TD') => result('flowchart', direction);

        // Add glossary method for documentation
        result.getGlossary = () => {
            const flowchart = new FlowchartJS();
            return flowchart.getGlossary();
        };
    } else {
        // Legacy API: Return a flowchart directly
        result = new FlowchartJS();
        result.fromMermaid = ArielJSFactory.fromMermaid.bind(ArielJSFactory);
    }

    // Handle custom terminology mapping
    if (config.methods || config.properties) {
        // For factory mode, we'll create a wrapper function with custom terminology
        if (isFactoryMode) {
            const originalFactory = result;

            // Create a new factory function that applies terminology mapping
            result = function(type = 'flowchart', ...args) {
                const diagram = originalFactory(type, ...args);
                applyTerminologyMapping(diagram, config);
                return diagram;
            };

            // Copy over the static methods
            result.fromMermaid = originalFactory.fromMermaid;
            result.create = originalFactory.create;
            result.getGlossary = originalFactory.getGlossary;
        } else {
            // For direct flowchart, apply terminology mapping directly
            applyTerminologyMapping(result, config);
        }
    }

    return result;
}

// Helper function to apply terminology mapping
function applyTerminologyMapping(diagram, config) {
    // Add custom method names
    if (config.methods) {
        for (const [customName, originalName] of Object.entries(config.methods)) {
            if (diagram[originalName]) {
                diagram[customName] = function(...args) {
                    return this[originalName](...args);
                };
            }
        }
    }

    // Support property name mapping for methods with options objects
    if (config.properties) {
        // Get all methods on the diagram object
        const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(diagram))
            .filter(name => typeof diagram[name] === 'function' && name !== 'constructor');

        // For each method, check if it has options parameters
        for (const methodName of methodNames) {
            const originalMethod = diagram[methodName];

            // Skip any method that has already been mapped
            if (originalMethod._isMapped) continue;

            // Create a wrapper method that maps property names
            diagram[methodName] = function(...args) {
                // Look for objects in args that might be options
                const mappedArgs = args.map(arg => {
                    if (arg && typeof arg === 'object' && !Array.isArray(arg)) {
                        // Create a copy of the options
                        const mappedOptions = { ...arg };

                        // Map property names
                        for (const [customProp, origProp] of Object.entries(config.properties)) {
                            if (mappedOptions[customProp] !== undefined) {
                                mappedOptions[origProp] = mappedOptions[customProp];
                                delete mappedOptions[customProp];
                            }
                        }

                        return mappedOptions;
                    }
                    return arg;
                });

                // Call the original method with the mapped arguments
                return originalMethod.apply(this, mappedArgs);
            };

            // Mark the method as mapped to avoid double-wrapping
            diagram[methodName]._isMapped = true;
        }
    }

    // If there are parameter mappings, apply them
    if (config.parameters) {
        // For each method that has parameter transformations
        for (const [methodName, paramMap] of Object.entries(config.parameters)) {
            if (diagram[methodName]) {
                const originalMethod = diagram[methodName];

                // Create a wrapper that remaps parameters
                diagram[methodName] = function(...args) {
                    // Transform args based on parameter mapping
                    const newArgs = [];

                    // Use the map to place args in their new positions
                    for (let i = 0; i < paramMap.length; i++) {
                        const sourceIndex = paramMap[i];
                        newArgs[i] = args[sourceIndex !== undefined ? sourceIndex : i];
                    }

                    return originalMethod.apply(this, newArgs);
                };
            }
        }
    }

    // Apply any additional custom methods that perform complex operations
    if (config.customMethods) {
        for (const [methodName, implementation] of Object.entries(config.customMethods)) {
            diagram[methodName] = function(...args) {
                // Bind the implementation to this diagram instance
                return implementation.apply(this, args);
            };
        }
    }

    return diagram;
}

export default createArielJS;