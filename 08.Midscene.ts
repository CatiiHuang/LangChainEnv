import { agentFromComputer } from '@midscene/computer';
import { ComputerDevice } from '@midscene/computer';
import {
  MIDSCENE_MODEL_API_KEY,
  MIDSCENE_MODEL_BASE_URL,
  MIDSCENE_MODEL_NAME,
  MIDSCENE_MODEL_FAMILY,
} from './env.js';

(async () => {
  // 连接到第一个可用的显示器
  const displays = await ComputerDevice.listDisplays();

  // 创建Agnet
  const agent = await agentFromComputer({
    displayId: displays[0].id,
    aiActionContext: '你正在自动化一个桌面应用。',
    modelConfig: {
      MIDSCENE_MODEL_API_KEY: MIDSCENE_MODEL_API_KEY,
      MIDSCENE_MODEL_BASE_URL: MIDSCENE_MODEL_BASE_URL,
      MIDSCENE_MODEL_NAME: MIDSCENE_MODEL_NAME,
      MIDSCENE_MODEL_FAMILY: MIDSCENE_MODEL_FAMILY,
    },
  });

  // @ts-ignore
  const result1 = await agent.ai('截图，并为我输出屏幕中的文字内容');
  console.log('=====result1======', result1);

  // @ts-ignore
  const result2 = await agent.ai('在VsCode编辑器中追加输入：“你好，我是Midcene助手”');
  console.log('=====result2======', result2);
})();
