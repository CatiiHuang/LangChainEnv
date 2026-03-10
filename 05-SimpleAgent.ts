import { createAgent, tool } from 'langchain';
import * as z from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { BAI_LIAN_API_KEY } from './env.js';
// 1. 定义模型
const model = new ChatOpenAI({
  model: 'qwen3.5-plus',
  temperature: 0,
  apiKey: BAI_LIAN_API_KEY,
  configuration: {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
});

// 2.1 定义获取天气工具
const weatherTool = tool(
  ({ date }) => {
    console.log('======Func Calling:=======');
    console.log('执行getWeather', date);
    // 这里应该是实际的天气API调用
    return `${date} 的天气是阴雨天`;
  },
  {
    name: 'Weather',
    description: '获取某天的天气，需要传入日期',
    schema: z.object({
      date: z.string().describe('某天的天气'),
    }),
  }
);

// 2.2 定义天气评分工具
const weatherScoreTool = tool(
  ({ weather }) => {
    console.log('======Func Calling:=======');

    console.log('执行getWeatherScore', weather);
    // 这里应该是实际的天气API调用
    return `${weather} 的得分是${Math.random() * 100}分`;
  },
  {
    name: 'WeatherScore',
    description: '获取某个天气的推荐出行得分，需要传入天气',
    schema: z.object({
      weather: z.string().describe('具体的天气名称'),
    }),
  }
);

(async () => {
  // 3. 创建智能体
  const agent = await createAgent({
    model: model,
    tools: [weatherScoreTool, weatherTool],
  });

  // 4. 触发对话
  console.log('=======触发对话=======');
  const result = await agent.invoke({
    messages: [
      {
        role: 'system',
        content: '你是一个问答助手，请回答用户的相关问题',
      },
      {
        role: 'user',
        content: `
    # 问题
    你好，告诉我2024-10-01日天气如何，并告诉我那个天气的出行得分
    # step1
    请先调用获取天气工具查询天气
    # step2
    以获取的天气调用得分查询工具
    # step3
    通过分步查询，聚合结果，给我想要的答案`,
      },
    ],
  });
  console.log('=========result===========');
  console.log(result.messages?.slice(-1)?.[0]?.content);
  console.log('=========result===========');
})();
