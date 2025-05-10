# State Diagram Example

A state diagram showing transitions between different states.

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start Job
    Processing --> Success: Job Complete
    Processing --> Error: Error Occurs
    Success --> Idle: Reset
    Error --> Idle: Reset
    Idle --> [*]: Shutdown
    
    state Processing {
        [*] --> Validating
        Validating --> Processing: Valid Input
        Validating --> Invalid: Invalid Input
        Invalid --> [*]: Return Error
        Processing --> Saving: Process Complete
        Saving --> [*]: Save Complete
    }
```