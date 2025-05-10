// Use dynamic import to work around ESM limitations

console.log('=== MINDMAP CHAIN TEST ===');

// Dynamic import
(async () => {
  try {
    const module = await import('../src/ariel-js.js');
    const createArielJS = module.default;
    
    // Create an ArielJS instance with the useNewApi flag
    const ariel = createArielJS({useNewApi: true});
    
    // Create a mindmap
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

    console.log(mindmap.toMermaid());
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
})();