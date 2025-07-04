# marduk-ts
Marduk TS

---
Use Clouflare Workers assigned to each function to coordinate Cognitive Synergy.
Create the necessary OpenAI Assistants and Claude instances where required for Integration.

Set up the necessary files and dependencies for your **Marduk framework** in a **TypeScript and Deno** environment.
---

Here’s the **updated directory structure** for the repository, including the new components for **deliberation cycles**, **memory integration**, **task handling**, and **notes management**.

---

### **Updated Directory Structure**

```plaintext
marduk-ts/
├── core/
│   ├── marduk_core.ts             # Main orchestrator for Marduk's cycles
│   ├── deliberation.ts            # Handles divergent/convergent goal synthesis
│   ├── task_execution.ts          # Manages task execution and deferred tasks
│   ├── notes_manager.ts           # Saves/retrieves notes for inter-cycle learning
│   ├── learning_scheduler.ts      # Generates learning tasks and adaptive schedules
├── subsystems/
│   ├── declarative_memory.ts      # Handles facts, definitions, and frameworks
│   ├── episodic_memory.ts         # Stores and retrieves narrative/contextual events
│   ├── procedural_memory.ts       # Manages workflows and step-by-step guides
│   ├── semantic_memory.ts         # Manages relationships between concepts
├── tasks/
│   ├── task_manager.ts            # Handles task prioritization and updates
│   ├── deferred_task_handler.ts   # Manages deferred tasks and conditions
├── logs/
│   ├── notes2self.json            # Stores notes from previous cycles
│   ├── task_log.json              # Logs task execution results
│   ├── error_log.json             # Logs errors and unresolved issues
├── tests/
│   ├── declarative_memory_test.ts # Unit tests for Declarative Memory
│   ├── episodic_memory_test.ts    # Unit tests for Episodic Memory
│   ├── procedural_memory_test.ts  # Unit tests for Procedural Memory
│   ├── semantic_memory_test.ts    # Unit tests for Semantic Memory
│   ├── marduk_core_test.ts        # Unit tests for Marduk Core and cycles
│   ├── deliberation_test.ts       # Unit tests for deliberation and goal synthesis
│   ├── task_execution_test.ts     # Unit tests for task execution
│   ├── notes_manager_test.ts      # Unit tests for notes retrieval and saving
├── types/
│   ├── messages.ts                # Shared types for messages (e.g., TaskMessage, ResponseMessage)
│   ├── task_types.ts              # Types for tasks, conditions, and priorities
├── workflows/
│   ├── backup-marduk.ts           # Workflow to back up the marduk-ts directory
│   ├── ci-and-backup.yml          # Main CI workflow with linting, tests, and backups
```

---

### **Explanation of Key Additions**

#### **1. Core**
- **`deliberation.ts`**: Implements the divergent and convergent goal synthesis process, integrating insights from memory systems.
- **`task_execution.ts`**: Manages task execution and deferred task handling.
- **`notes_manager.ts`**: Handles saving and retrieving `notes2self` for inter-cycle learning.
- **`learning_scheduler.ts`**: Dynamically generates learning tasks and schedules based on knowledge gaps.

#### **2. Subsystems**
- No structural changes, but integrates with the deliberation process by providing insights and managing updates from the task manager.

#### **3. Tasks**
- **`task_manager.ts`**: Centralizes task prioritization, updates, and integration into workflows.
- **`deferred_task_handler.ts`**: Handles tasks with conditions and reactivates them when prerequisites are met.

#### **4. Logs**
- **`notes2self.json`**: Stores structured notes from each cycle for retrieval in subsequent cycles.
- **`task_log.json`**: Logs the results of task execution for analysis.
- **`error_log.json`**: Tracks errors and unresolved issues for future research or debugging.

#### **5. Tests**
- Expanded unit tests for:
  - Deliberation and goal synthesis (`deliberation_test.ts`).
  - Task execution and deferred task handling (`task_execution_test.ts`).
  - Notes management (`notes_manager_test.ts`).

#### **6. Types**
- **`task_types.ts`**:
  - Defines types for tasks, conditions, and priorities to improve type safety and consistency.

---

### **Example Use Case: Cycle Flow**

#### **Start Cycle**
- **Marduk Core**:
  - Loads notes from `notes2self.json` using `notes_manager.ts`.
  - Triangulates insights from memory subsystems.
  - Synthesizes goals using `deliberation.ts`.

#### **Task Updates**
- **Task Manager**:
  - Prioritizes and integrates new tasks.
  - Adds deferred tasks to the queue if conditions aren’t met.

#### **Execution**
- **Task Execution**:
  - Executes tasks for the current cycle using `task_execution.ts`.
  - Logs results to `task_log.json`.

#### **Review and Notes**
- **Notes Manager**:
  - Analyzes results and saves structured notes to `notes2self.json`.

---

### **Next Steps**

1. Implement the new modules (`deliberation.ts`, `notes_manager.ts`, etc.).
2. Add corresponding unit tests.
3. Integrate the cycle flow into **Marduk Core**.
4. Test the full workflow in a development environment.

Let me know if you’d like detailed implementation examples for specific modules! 😊

---

Using **TypeScript** with **Deno** for implementing the **Marduk framework** offers strong typing, enhanced developer experience, and seamless runtime integration. Below are the steps tailored for **Deno** using TypeScript.

---

## **Steps to Set Up the Framework in TypeScript with Deno**

### **1. Install and Set Up Deno**

Example:

1. Install Deno:
   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   ```
2. Verify installation:
   ```bash
   deno --version
   ```

### **2. Create the Project Directory Structure**

### **3. Implement the WebSocket Server**

The server facilitates communication between subsystems and Marduk Core.

### **4. Define Shared Types**

Create reusable types for communication between components.

### **5. Implement a Subsystem**

Each subsystem connects to the server, processes tasks, and sends responses.

### **6. Implement Marduk Core**

The core orchestrates tasks and integrates responses.

### **7. Add All Subsystems**

Implement scripts for subsystems like Declarative Memory Episodic Memory, Procedural Memory, and Semantic Memory by adapting their task-handling logic.

### **8. Run the Framework**

Example:

1. Start the WebSocket server:
   ```bash
   deno run --allow-net server.ts
   ```

2. Start Marduk Core:
   ```bash
   deno run --allow-net --allow-read --allow-write core/marduk_core.ts
   ```

3. Start Declarative Memory:
   ```bash
   deno run --allow-net subsystems/declarative_memory.ts
   ```

### **9. Automate Task Cycles**
Enhance **Marduk Core** with scheduling.

Example:

**Code: Task Scheduler in `core/marduk_core.ts`**
```typescript
const tasks: TaskMessage[] = [
  { type: "task", query: "Retrieve facts about chaos theory", task_id: 1 },
  { type: "task", query: "Narrate recent events on project X", task_id: 2 },
];

let currentTaskIndex = 0;

setInterval(() => {
  if (currentTaskIndex < tasks.length) {
    ws.send(JSON.stringify(tasks[currentTaskIndex]));
    currentTaskIndex++;
  }
}, 10000); // Schedule tasks every 10 seconds
```

### **10. Advanced Features**

#### **A. Persistent Memory**
Use `Deno KV` for persistent storage instead of JSON files.

#### **B. Error Handling**
Add retries and error handling for failed tasks.

#### **C. Feedback Loops**
Allow Marduk Core to dynamically adjust task queries based on subsystem responses.

---

### **Summary of Commands**

Example:

1. **Run WebSocket Server**:
   ```bash
   deno run --allow-net server.ts
   ```

2. **Run Subsystems**:
   ```bash
   deno run --allow-net subsystems/declarative_memory.ts
   ```

3. **Run Marduk Core**:
   ```bash
   deno run --allow-net --allow-read --allow-write core/marduk_core.ts
   ```

This setup in **TypeScript with Deno** ensures type safety, real-time interaction, and modular extensibility for the Marduk framework. Let me know if you'd like further refinements!


### **Explanation**

1. **Triggering the Workflow**:
   - The workflow runs when:
     - Pushed to the `main` branch.
     - Manually triggered from the **GitHub Actions** tab using `workflow_dispatch`.

2. **Set Up Deno**:
   - Uses the [denoland/setup-deno](https://github.com/denoland/setup-deno) action to install the latest stable version of Deno.

3. **Create Directory Structure**:
   - Sets up directories for `core`, `subsystems`, `types`, and `logs`.

4. **Add Initial Files**:
   - Adds basic TypeScript templates to each key directory.
   - Initializes an empty `marduk_log.json` in the `logs/` folder.

5. **Commit Changes**:
   - Configures Git and commits the initialized structure to the repository.

6. **Verify Deno Installation**:
   - Ensures that Deno is correctly installed and available.

---

### **How to Use This Workflow**

1. **Add the Workflow File**:
   - Save the workflow file as `.github/workflows/repo-initialization.yml`.

2. **Manually Trigger the Workflow**:
   - Go to the **Actions** tab in your GitHub repository.
   - Select the `Initialize Marduk Framework Repo` workflow and click **Run workflow**.

3. **Check the Repo**:
   - Verify that the directories and files have been created in the repository.

---

### **Next Steps**

Once initialized:
1. Start adding the actual implementation for the WebSocket server, Marduk Core, and subsystems in the created files.
2. Extend the workflow to include **automated tests**, **linting**, or **deployment steps** if needed.

This workflow gives you a solid starting point for the Marduk framework while leveraging automation for consistent repo initialization.

---

# ERRORS TO RESOLVE:


marduk-ts/core/cycle-simulation.ts:23:20 - error TS2345: Argument of type '(task: TaskMessage) => void' is not assignable to parameter of type '(value: TaskMessage, index: number, array: TaskMessage[]) => void'.
  Types of parameters 'task' and 'value' are incompatible.
    Type 'import("/home/project/marduk-ts/types/task-types").TaskMessage' is not assignable to type 'import("/home/project/marduk-ts/core/types/messages").TaskMessage'.
      Types of property 'status' are incompatible.
        Type 'TaskStatus | undefined' is not assignable to type '"pending" | "completed" | "deferred" | undefined'.
          Type '"failed"' is not assignable to type '"pending" | "completed" | "deferred" | undefined'.

23   newTasks.forEach((task: TaskMessage) => {
                      ~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/core/marduk_core.ts:31:59 - error TS2345: Argument of type 'import("/home/project/marduk-ts/core/task/scheduler").TaskScheduler' is not assignable to parameter of type 'import("/home/project/marduk-ts/core/task/task-scheduler").TaskScheduler'.
  Types have separate declarations of a private property 'currentTaskIndex'.

31     this.messageHandler = new MessageHandler(this.logger, this.scheduler);
                                                             ~~~~~~~~~~~~~~

marduk-ts/cycle_simulation.ts:1:29 - error TS2307: Cannot find module './tasks/task-manager.js' or its corresponding type declarations.

1 import { TaskManager } from './tasks/task-manager.js';
                              ~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/cycle_simulation.ts:2:37 - error TS2307: Cannot find module './tasks/deferred-task-handler.js' or its corresponding type declarations.

2 import { DeferredTaskHandler } from './tasks/deferred-task-handler.js';
                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/cycle_simulation.ts:48:34 - error TS7006: Parameter 'result' implicitly has an 'any' type.

48   const notes = taskResults.map((result) => `Task: ${result.query} - Status: ${result.status}`);
                                    ~~~~~~

marduk-ts/subsystems/episodic_memory.ts:1:46 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

1 import { TaskMessage, ResponseMessage } from "../types/messages.ts";
                                               ~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/subsystems/procedural_memory.ts:1:46 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

1 import { TaskMessage, ResponseMessage } from "../types/messages.ts";
                                               ~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/subsystems/semantic_memory.ts:1:46 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

1 import { TaskMessage, ResponseMessage } from "../types/messages.ts";
                                               ~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tasks/deferred_task_handler.ts:1:40 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

1 import { TaskMessage, Condition } from "../types/task_types.ts";
                                         ~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tasks/task_manager.ts:1:29 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

1 import { TaskMessage } from "../types/task_types.ts";
                              ~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/declarative_memory_test.ts:3:8 - error TS2307: Cannot find module 'https://deno.land/std@0.118.0/testing/asserts.ts' or its corresponding type declarations.

3 } from "https://deno.land/std@0.118.0/testing/asserts.ts";
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/declarative_memory_test.ts:16:1 - error TS2304: Cannot find name 'Deno'.

16 Deno.test("queryFacts returns relevant facts", () => {
   ~~~~

marduk-ts/tests/deliberation_test.ts:3:8 - error TS2307: Cannot find module 'https://deno.land/std@0.118.0/testing/asserts.ts' or its corresponding type declarations.

3 } from "https://deno.land/std@0.118.0/testing/asserts.ts";
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/deliberation_test.ts:4:28 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

4 import { deliberate } from "../core/deliberation.ts";
                             ~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/deliberation_test.ts:6:1 - error TS2304: Cannot find name 'Deno'.

6 Deno.test("deliberate generates tasks from insights and notes", () => {
  ~~~~

marduk-ts/tests/episodic_memory_test.ts:3:8 - error TS2307: Cannot find module 'https://deno.land/std@0.118.0/testing/asserts.ts' or its corresponding type declarations.

3 } from "https://deno.land/std@0.118.0/testing/asserts.ts";
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/episodic_memory_test.ts:16:1 - error TS2304: Cannot find name 'Deno'.

16 Deno.test("queryEvents returns relevant events", () => {
   ~~~~

marduk-ts/tests/learning_scheduler_test.ts:3:8 - error TS2307: Cannot find module 'https://deno.land/std@0.118.0/testing/asserts.ts' or its corresponding type declarations.

3 } from "https://deno.land/std@0.118.0/testing/asserts.ts";
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/learning_scheduler_test.ts:4:25 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

4 import { Insight } from "../types/task_types.ts";
                          ~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/learning_scheduler_test.ts:5:32 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

5 import { _generateGoals } from "../core/learning_scheduler.ts";
                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/learning_scheduler_test.ts:7:1 - error TS2304: Cannot find name 'Deno'.

7 Deno.test("generateGoals creates tasks for errors and successes", () => {
  ~~~~

marduk-ts/tests/marduk_core_test.ts:3:8 - error TS2307: Cannot find module 'https://deno.land/std@0.118.0/testing/asserts.ts' or its corresponding type declarations.

3 } from "https://deno.land/std@0.118.0/testing/asserts.ts";
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/marduk_core_test.ts:4:33 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

4 import { ResponseMessage } from "../types/messages.ts";
                                  ~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/marduk_core_test.ts:13:1 - error TS2304: Cannot find name 'Deno'.

13 Deno.test("logResponse adds response to logs", () => {
   ~~~~

marduk-ts/tests/notes_manager_test.ts:3:8 - error TS2307: Cannot find module 'https://deno.land/std@0.118.0/testing/asserts.ts' or its corresponding type declarations.

3 } from "https://deno.land/std@0.118.0/testing/asserts.ts";
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/notes_manager_test.ts:8:8 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

8 } from "../core/notes_manager.ts";
         ~~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/notes_manager_test.ts:10:1 - error TS2304: Cannot find name 'Deno'.

10 Deno.test("reviewCycleResults generates notes from task results", () => {
   ~~~~

marduk-ts/tests/notes_manager_test.ts:23:1 - error TS2304: Cannot find name 'Deno'.

23 Deno.test("retrievePreviousNotes loads notes from file", async () => {
   ~~~~

marduk-ts/tests/notes_manager_test.ts:25:9 - error TS2304: Cannot find name 'Deno'.

25   await Deno.writeTextFile("./logs/notes2self.json", JSON.stringify(["Test Note"], null, 2));
           ~~~~

marduk-ts/tests/notes_manager_test.ts:32:1 - error TS2304: Cannot find name 'Deno'.

32 Deno.test("saveNotesToSelf writes notes to file", async () => {
   ~~~~

marduk-ts/tests/notes_manager_test.ts:36:28 - error TS2304: Cannot find name 'Deno'.

36   const savedNotes = await Deno.readTextFile("./logs/notes2self.json");
                              ~~~~

marduk-ts/tests/procedural_memory_test.ts:3:8 - error TS2307: Cannot find module 'https://deno.land/std@0.118.0/testing/asserts.ts' or its corresponding type declarations.

3 } from "https://deno.land/std@0.118.0/testing/asserts.ts";
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/procedural_memory_test.ts:19:1 - error TS2304: Cannot find name 'Deno'.

19 Deno.test("queryWorkflows returns relevant workflows", () => {
   ~~~~

marduk-ts/tests/semantic_memory_test.ts:3:8 - error TS2307: Cannot find module 'https://deno.land/std@0.118.0/testing/asserts.ts' or its corresponding type declarations.

3 } from "https://deno.land/std@0.118.0/testing/asserts.ts";
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/semantic_memory_test.ts:21:1 - error TS2304: Cannot find name 'Deno'.

21 Deno.test("querySemanticLinks returns relevant links", () => {
   ~~~~

marduk-ts/tests/task_execution_test.ts:3:8 - error TS2307: Cannot find module 'https://deno.land/std@0.118.0/testing/asserts.ts' or its corresponding type declarations.

3 } from "https://deno.land/std@0.118.0/testing/asserts.ts";
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/task_execution_test.ts:4:30 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

4 import { executeTasks } from "../core/task_execution.ts";
                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/task_execution_test.ts:5:29 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

5 import { TaskMessage } from "../types/task_types.ts";
                              ~~~~~~~~~~~~~~~~~~~~~~~~

marduk-ts/tests/task_execution_test.ts:7:1 - error TS2304: Cannot find name 'Deno'.

7 Deno.test("executeTasks defers tasks with unmet conditions", () => {
  ~~~~

marduk-ts/types/index.ts:3:1 - error TS2308: Module './messages' has already exported a member named 'TaskMessage'. Consider explicitly re-exporting to resolve the ambiguity.

3 export * from './task-types';
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Found 40 errors in 18 files.

Errors  Files
     1  marduk-ts/core/cycle-simulation.ts:23
     1  marduk-ts/core/marduk_core.ts:31
     3  marduk-ts/cycle_simulation.ts:1
     1  marduk-ts/subsystems/episodic_memory.ts:1
     1  marduk-ts/subsystems/procedural_memory.ts:1
     1  marduk-ts/subsystems/semantic_memory.ts:1
     1  marduk-ts/tasks/deferred_task_handler.ts:1
     1  marduk-ts/tasks/task_manager.ts:1
     2  marduk-ts/tests/declarative_memory_test.ts:3
     3  marduk-ts/tests/deliberation_test.ts:3
     2  marduk-ts/tests/episodic_memory_test.ts:3
     4  marduk-ts/tests/learning_scheduler_test.ts:3
     3  marduk-ts/tests/marduk_core_test.ts:3
     7  marduk-ts/tests/notes_manager_test.ts:3
     2  marduk-ts/tests/procedural_memory_test.ts:3
     2  marduk-ts/tests/semantic_memory_test.ts:3
     4  marduk-ts/tests/task_execution_test.ts:3
     1  marduk-ts/types/index.ts:3