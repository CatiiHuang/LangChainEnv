# 一、什么是LangGraph?

LangGraph是一个用于构建、部署和运行基于状态的多步骤AI/Agent工作流的框架。它基于图论的概念，允许开发者创建由节点和边组成的工作流，实现复杂的AI应用逻辑。

### 核心价值
- **工程化WorkFlow**：提供结构化的方式来定义和执行复杂的AI工作流
- **状态管理**：内置的全局状态管理，简化数据在工作流中的传递
- **并行执行**：原生支持节点并行执行，提高工作流效率
- **中断与恢复**：支持执行中断和恢复，实现交互式工作流
- **可扩展性**：灵活的节点和边定义，支持构建各种复杂的AI系统

### 应用场景
- **复杂Agent系统**：需要多步骤推理和决策的智能代理
- **交互式工作流**：需要用户输入和确认的AI辅助流程
- **多工具协作**：整合多个工具和服务的复杂任务
- **长时间运行的任务**：需要状态持久化的长时间执行任务

*一句话解释：工程化的Agent工作流搭建&运行`框架`，可以通过LangGraph快速搭建并运行AI-Workflow。*

# 二、LangGraph的基本概念

### 1. LangGraph中的关键节点

| 概念 | 英文 | 描述 |
|------|------|------|
| **图/工作流** | Graph | 自动化工作流，通过节点和边的编排，实现自动化驱动的AI工作流应用。是整个系统的顶层容器。 |
| **状态** | State | 每个图都拥有的全局状态，状态可以存储任意数据，但只能由节点更新。状态在整个工作流中传递和累积。 |
| **节点** | Node | 单步工作容器，执行具体的工作项、更新状态、选择下一个节点等。是工作流的基本执行单元。 |
| **边** | Edge | 定义节点间的流转关系，无需节点自行进行流转，系统会根据边的定义自动流转到下一个节点。 |
| **中断** | Interrupt | 图会暂停执行，将所有内容保存到检查点，后续可通过thread_id从中断处继续执行。用于需要用户交互的场景。 |
| **检查点** | Checkpoint | 图的运行状态快照，包含当前节点、状态数据、执行历史等信息。支持工作流的持久化和恢复。 |
| **起始节点** | START | 工作流的起点，所有执行都从这里开始。 |
| **结束节点** | END | 工作流的终点，到达这里表示工作流执行完成。 |

### 2. LangGraph的工作流程

#### 执行流程
1. **初始化**：
   - 创建状态模式（StateSchema/Annotation），定义状态的结构和默认值
   - 创建图结构（StateGraph），添加节点和边

2. **编译**：
   - 调用compile()方法将图结构编译为可执行的工作流
   - 可选择配置检查点（checkpointer）以支持状态持久化

3. **执行**：
   - 调用invoke()方法启动工作流，传入初始状态
   - 或调用stream()方法启动流式执行

4. **状态更新**：
   - 每个节点执行时接收当前状态
   - 节点处理完成后返回状态更新
   - 系统自动合并状态更新到全局状态

5. **流转**：
   - 根据边的定义自动流转到下一个节点
   - 支持条件流转和并行流转

6. **中断与恢复**：
   - 节点可调用interrupt()方法暂停执行
   - 系统保存当前状态到检查点
   - 后续可通过thread_id和恢复命令从中断点继续执行

#### 核心机制
- **状态合并**：多个节点的状态更新会被自动合并
- **并行执行**：多个输出边指向不同节点时，这些节点会并行执行
- **依赖等待**：多个输入边指向同一节点时，该节点会等待所有输入节点完成
- **状态持久化**：通过检查点机制实现状态的持久化和恢复

# 三、LangGraph与LangChain的区别

### 核心定位
- **LangChain**：基础AI应用搭建框架，提供构建LLM应用的基础组件和工具链
- **LangGraph**：上层AI工作流和多智能体框架，专注于搭建复杂的、有状态的、可中断的工作流系统

| 对比维度 | LangChain | LangGraph |
|---------|----------|----------|
| **框架定位** | 基础AI应用开发框架，提供LLM调用、工具集成等基础能力 | 上层工作流编排框架，专注于复杂AI工作流和多智能体系统的搭建 |
| **工作流模型** | 主要关注单个LLM调用和工具使用的链式组合，线性执行 | 提供完整的状态管理和节点编排，支持复杂的分支、并行和条件执行 |
| **状态管理** | 状态管理相对简单，主要通过链式传递，无全局状态 | 拥有全局状态，可在整个工作流中持久化和更新，支持状态累积 |
| **并行执行** | 主要是串行执行模式，缺乏原生并行支持 | 原生支持节点并行执行，提高复杂工作流的执行效率 |
| **中断与恢复** | 不支持执行中断和恢复，执行过程不可逆 | 支持执行中断和从中断点恢复，适合需要用户交互的场景 |
| **扩展性** | 适合构建相对简单的LLM应用，如问答、摘要等 | 适合构建复杂的、多步骤的AI系统，如多智能体协作、复杂任务规划等 |
| **核心概念** | Chains（链）、Agents（代理）、Tools（工具）、Prompts（提示词） | Nodes（节点）、Edges（边）、State（状态）、Interrupts（中断）、Checkpoints（检查点） |
| **执行模式** | 线性执行，每步依赖前一步结果，缺乏灵活性 | 基于图的执行，支持复杂的分支、并行和条件流转 |
| **状态持久化** | 无内置状态持久化机制，执行完成后状态丢失 | 内置检查点机制，支持状态持久化和工作流恢复 |
| **用户交互** | 有限的用户交互能力，主要是一次性输入输出 | 强大的用户交互支持，可在任意点中断等待用户输入 |
| **适用场景** | 简单的LLM应用、单步任务处理、基础工具集成 | 复杂的多步骤工作流、多智能体协作系统、需要状态管理的应用、交互式AI系统 |
| **与LangChain的关系** | 独立的基础框架 | 可与LangChain集成，使用LangChain的组件构建节点，同时提供更强大的工作流能力 |

*一句话解释：LangChain更偏向作为基础AI应用搭建的组件&工具链，LangGraph以前者为基础，更偏向于搭建复杂的、有状态的、AI工作流与更加复杂的AI应用*

# 四、LangGraph快速上手

## 1. 环境搭建

**步骤1：初始化项目**
```bash
mkdir langgraph-demo
cd langgraph-demo
npm init -y
```

**步骤2：安装依赖**
```bash
npm install @langchain/core @langchain/langgraph typescript ts-node
```

**步骤3：创建tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./"
  },
  "include": ["*.ts"],
  "exclude": ["node_modules", "dist"]
}
```
## 2. 上手案例

### 2.1 Graph示例

**创建graph.ts文件**：
```typescript
import {
  StateSchema,
  GraphNode,
  StateGraph,
  START,
  END,
} from '@langchain/langgraph';
import { z } from 'zod/v4';


/**
 * 最小化计算器工作流案例，start=>sumNode=>mutliNode=>end
 */
(async () => {
  // 定义图全局状态
  const State = new StateSchema({
    number1: z.number(),
    number2: z.number(),
    sum: z.number(),
    mutli: z.number(),
  });

  // 创建求和节点
  const sumNode: GraphNode<typeof State> = (state) => {
    return { sum: state.number1 + state.number2 };
  };

  // 创建乘法节点
  const mutliNode: GraphNode<typeof State> = (state) => {
    return { mutli: state.number1 * state.number2 };
  };

  // 构建图
  const graph = new StateGraph(State)
    .addNode('sumNode', sumNode)
    .addNode('mutliNode', mutliNode)
    .addEdge(START, 'sumNode')
    .addEdge('sumNode', 'mutliNode')
    .addEdge('mutliNode', END)
    .compile();

  // 执行图
  const result = await graph.invoke({ number1: 2, number2: 98 });
  console.log('运行结果:', result);
  // 运行结果: { number1: 2, number2: 98, sum: 100, mutli: 196 }
})();
```

**运行示例**：
```bash
npx ts-node graph.ts
```

### 2.2 Subgraph示例
**创建subGraph.ts文件**：
```typescript
import { StateGraph, StateSchema, START } from "@langchain/langgraph";
import { z } from "zod";

/**
 * 主子图运行案例
 */
(async () => {
    // 定义子图状态
    const SubgraphState = new StateSchema({
        result: z.string(), // 注意：这个键与父图状态共享
    });

    // 构建子图
    const subgraphBuilder = new StateGraph(SubgraphState)
        .addNode("step1", (state) => {
            return { result: state.result + ' -> 子图步骤1' };
        })
        .addNode("step2", (state) => {
            return { result: state.result + ' -> 子图步骤2' };
        })
        .addEdge(START, "step1")
        .addEdge("step1", "step2");
    const subgraph = subgraphBuilder.compile();

    // 定义父图状态
    const ParentState = new StateSchema({
        result: z.string(),
    });

    // 构建父图，将子图作为节点添加
    const builder = new StateGraph(ParentState)
        .addNode("开始", (state) => {
            return { result: state.result + ' -> 父图开始' };
        })
        .addNode("子图执行", subgraph) // 直接将子图作为节点添加
        .addEdge(START, "开始")
        .addEdge("开始", "子图执行");
    const graph = builder.compile();

    // 执行父图
    const result = await graph.invoke({ result: "初始值" });
    console.log("最终结果:", result);
    // 最终结果: { result: '初始值 -> 父图开始 -> 子图步骤1 -> 子图步骤2' }
})();
```

**运行示例**：
```bash
npx ts-node subGraph.ts
```

### 2.3 CheckPoints示例
**创建checkPoint.ts文件**：
```typescript
import { StateGraph, StateSchema, GraphNode, MemorySaver } from "@langchain/langgraph";
import * as z from "zod";

/** 检查点案例 */
(async () => {
  // 图状态
  const State = new StateSchema({
    topic: z.string(), // 主题
    joke: z.string(), // 笑话
    story: z.string(), // 故事
    combinedOutput: z.string(), // 组合输出
  });

  // 节点
  // 第一个节点：生成笑话（替换了LLM调用）
  const callLlm1: GraphNode<typeof State> = async (state) => {
    return { joke: `为什么${state.topic}坐在电脑上？因为它想监视鼠标！` };
  };

  // 第二个节点：生成故事（替换了LLM调用）
  const callLlm2: GraphNode<typeof State> = async (state) => {
    return { story: `从前，有一只叫 whiskers 的${state.topic}，它喜欢探索附近的街区。有一天，whiskers 发现了一个隐藏的花园，里面有五颜六色的花朵和友好的蝴蝶。这里成了 whiskers 每天下午最喜欢去的地方。` };
  };

  // 组合笑话、故事为单个输出
  const aggregator: GraphNode<typeof State> = async (state) => {
    const combined = `这是关于${state.topic}的故事、笑话和诗歌！\n\n` +
      `故事：\n${state.story}\n\n` +
      `笑话：\n${state.joke}\n\n`;
    return { combinedOutput: combined };
  };

  // 创建检查点容器
  const checkpointer = new MemorySaver();

  // 构建工作流
  const parallelWorkflow = new StateGraph(State)
    .addNode("callLlm1", callLlm1)
    .addNode("callLlm2", callLlm2)
    .addNode("aggregator", aggregator)
    .addEdge("__start__", "callLlm1")
    .addEdge("__start__", "callLlm2")
    .addEdge("callLlm1", "aggregator")
    .addEdge("callLlm2", "aggregator")
    .addEdge("aggregator", "__end__")
    .compile({ checkpointer });



  // 调用工作流 通过thread_id区分当前触发工作流的唯一标识,thread_id相同则会共享状态
  const result = await parallelWorkflow.invoke({ topic: "猫" }, { configurable: { thread_id: "233" } });
  console.log("\n完整状态:");
  console.log(result);


  // 通过thread_id获取状态历史记录
  const stateHistory = await parallelWorkflow.getStateHistory({ configurable: { thread_id: "233" } })
  for await (const item of stateHistory) {
    console.log(item)
  }


  // 通过thread_id重跑工作流
  const reRunResult = await parallelWorkflow.invoke({ topic: "狗" }, { configurable: { thread_id: "233" } });
  console.log("\n重跑完整状态:");
  console.log(reRunResult);
})()
```

**运行示例**：
```bash
npx ts-node checkPoint.ts
```

### 2.4 Interrupt示例
**创建interrupt.ts文件**：
```typescript
import { Annotation, Command, END, INTERRUPT, MemorySaver, START, StateGraph, interrupt, isInterrupted } from "@langchain/langgraph";

/**
 * 最小化中断案例
 */
(async () => {
  // 1. 定义状态和节点
  const State = Annotation.Root({ user_input: Annotation<string> });

  // 2. 定义图节点   start => step1 => step2 => end
  const graph = new StateGraph(State)
    .addNode("step1", () => {
      // 触发中断，图暂停
      const answer = interrupt("你的名字？") as string;
      return { user_input: answer }; // 恢复后更新状态
    })
    .addNode("step2", (state) => ({ user_input: `Hello, ${state.user_input}!` }))
    .addEdge(START, "step1")
    .addEdge("step1", "step2")
    .addEdge("step2", END)
    .compile({ checkpointer: new MemorySaver() }); // 配置 checkpointer 存储状态

  // 3. 定义运行配置
  const config = { configurable: { thread_id: "unique-id" } };

  console.log("--- 1. 开始执行 ---");
  // 4. 第一次运行，遇到 interrupt 暂停
  const result1 = await graph.invoke({ user_input: "" }, config);

  // 5. 检查是否中断
  if (isInterrupted(result1)) {
    const info = result1[INTERRUPT][0];
    console.log(`--- 2. 中断: "${info.value}" (ID: ${info.id}) ---`);

    // 6. 模拟用户延迟输入
    let userNameInput = ''
    await new Promise(r => setTimeout(() => {
      console.log(`--- 3. 并模拟用户延迟输入名字`)
      userNameInput = 'Alice'
      r(userNameInput)
    }, 2000));

    console.log("--- 4. 恢复执行 ---");
    // 使用 Command 恢复，将 "Alice" 传回给 interrupt()
    const result2 = await graph.invoke(
      new Command({ resume: { [info.id!]: userNameInput } }) as any,
      config
    );
    console.log("最终结果:", result2);
    // --- 1. 开始执行 ---
    // --- 2. 中断: "你的名字？" (ID: 3972285f061e62e115f2826b26442662) ---
    // --- 3. 并模拟用户延迟输入名字
    // --- 4. 恢复执行 ---
    // 最终结果: { user_input: 'Hello, Alice!' }
  }
})();
```

**运行示例**：
```bash
npx ts-node interrupt.ts
```

# 五、总结

LangGraph是一个强大的框架，用于构建复杂的AI工作流。它的核心优势包括：

1. **状态管理**：全局状态可在整个工作流中持久化和更新
2. **并行执行**：支持节点并行执行，提高效率
3. **中断与恢复**：可在任意点暂停执行，后续可恢复
4. **灵活的节点编排**：通过边定义节点间的流转关系
5. **可扩展性**：适合构建从简单到复杂的各种AI应用

# 六、更多参考资料

- **官方文档**：https://docs.langchain.com/langgraph
- **GitHub仓库**：https://github.com/langchain-ai/langgraph
- **示例代码**：https://github.com/langchain-ai/langgraph/tree/main/examples

