# Styled Flowchart Example

A flowchart with custom styling and different node shapes.

```mermaid
flowchart TD
    start([START]) --> config[Load Configuration]
    config --> input[/User Input/]
    input --> valid{Valid Input?}
    
    valid -->|No| errorMsg>Error Message]
    errorMsg --> input
    
    valid -->|Yes| process[Process Data]
    process --> db[(Database)]
    db --> output{{Generate Output}}
    output --> decision{Looks Good?}
    
    decision -->|Yes| format[Format Results]
    decision -->|No| process
    
    format --> report[/Display Report/]
    report --> export([Export Function])
    export --> archive[/Save to Archive/]
    archive --> notify[Send Notification]
    notify --> finish([END])
    
    classDef start fill:#90EE90,stroke:#006400,stroke-width:2px,color:#000000,font-weight:bold;
    classDef process fill:#FFFACD,stroke:#DAA520,stroke-width:1px;
    classDef decision fill:#FFB6C1,stroke:#C71585,stroke-width:1px;
    classDef io fill:#87CEFA,stroke:#4682B4,stroke-width:1px;
    classDef error fill:#FFA07A,stroke:#FF0000,stroke-width:1px;
    classDef database fill:#DDA0DD,stroke:#9400D3,stroke-width:1px;
    classDef output fill:#AFEEEE,stroke:#008B8B,stroke-width:1px;
    classDef end fill:#90EE90,stroke:#006400,stroke-width:2px,color:#000000,font-weight:bold;
    
    class start,finish start;
    class process,format process;
    class valid,decision decision;
    class input,report,archive io;
    class errorMsg error;
    class db database;
    class output output;
```