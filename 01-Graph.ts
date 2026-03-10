import { StateSchema, GraphNode, StateGraph, START, END } from '@langchain/langgraph';
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
    console.log('sunNode1', state);
    return { sum: state.number1 + state.number2 };
  };

  // 创建乘法节点
  const mutliNode: GraphNode<typeof State> = (state) => {
    console.log('mutilNode2', state);

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
  const result = await graph.stream({ number1: 2, number2: 98 });
  console.log('运行结果:', result);
  // 运行结果: { number1: 2, number2: 98, sum: 100, mutli: 196 }
})();
