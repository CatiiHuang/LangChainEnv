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