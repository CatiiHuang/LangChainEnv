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
      new Command({ resume: { [info.id!]: "Alice" } }) as any,
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
