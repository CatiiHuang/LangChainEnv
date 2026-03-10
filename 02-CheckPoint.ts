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