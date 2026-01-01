---
tags:
- code-generation
- technical-writing
- prompt
- mermaidjs
- scripting
- obsidian
- markdown
- artificial-intelligence
- code-snippets
- flowchart
- diagram-generation
- prompt-engineering
- documentation
ai_processed: true
---

### **The Master Prompt for Mermaid.js Diagram Generation**

**Objective:** To generate clean, compatible, and error-free Mermaid.js code for a specified diagram based on user-provided content.

**Instructions for Me (Your AI Assistant):**
Upon receiving this completed prompt, you are to act as a Mermaid.js code generation expert. Your task is to interpret the user's content and generate the corresponding Mermaid.js code. You must adhere to the following critical rules to ensure maximum compatibility and prevent errors:

1.  **Use Universal Syntax:** Generate the most basic and universally compatible Mermaid.js syntax. **DO NOT** use advanced or experimental features like `style`, `classDef`, `linkStyle`, or `%%` comments unless explicitly requested by the user.
2.  **Quote All Complex Text:** This is the most important rule. **ALWAYS** enclose any node text in **double quotes (`"..."`)** if it contains special characters (like `(`, `)`, `{`, `}`), formatting (`<br/>`), or multiple lines. This prevents parsing errors.
3.  **Infer Logical Flow:** If the user lists nodes in a specific order but does not explicitly define all connections, infer the logical sequence and connect them accordingly.
4.  **Provide Clean Code Only:** Your final output should be a single, clean code block containing only the Mermaid.js code, ready to be copied and pasted. Do not add explanations unless asked.

---

### **[[[ USER: PLEASE FILL OUT THIS SECTION FOR YOUR DIAGRAM ]]]**

**1. Project Context (One sentence):**
`[e.g., A flowchart for the research methodology of the JobSeekerProfolio project.]`

**2. Diagram Type:**
`[e.g., flowchart TD, sequenceDiagram, gantt, classDiagram, pie]`

**3. Diagram Content:**
*(Provide the nodes/actors and the connections/messages. See the example below for the format.)*

*   **Nodes / Actors:**
    *   `[ID (Shape) ["Text Content"]]`
    *   `[ID (Shape) ["Text Content"]]`

*   **Connections / Messages:**
    *   `[ID1 --> ID2]`
    *   `[ID2 -->|With Text| ID3]`

---

### **Example Usage (How You Would Fill It Out)**

Here is how you would fill out the template to generate the "System Architecture" diagram we worked on.

**1. Project Context (One sentence):**
`A diagram showing the layered system architecture of the JobSeekerProfolio application.`

**2. Diagram Type:**
`flowchart TD`

**3. Diagram Content:**

*   **Nodes / Actors:**
    *   `User ([User in Browser])`
    *   `FE ("Next.js Frontend<br/>React, TypeScript<br/>Tailwind CSS, Radix UI")`
    *   `BE ("Next.js Backend<br/>API Routes, Server Actions<br/>Zod Validation")`
    *   `AUTH ("Authentication<br/>Next-Auth.js")`
    *   `ORM ("Prisma ORM")`
    *   `DB ((SQLite Database))`

*   **Connections / Messages:**
    *   `User --> FE`
    *   `FE --> BE`
    *   `BE <--> AUTH`
    *   `BE --> ORM`
    *   `ORM <--> DB`

*(You could also add instructions like "Group FE in 'Presentation Layer', Group BE and AUTH in 'Application Layer', and Group ORM and DB in 'Data Layer'.")*
