import { TelegramUpdate } from '../updates/telegram.update';
import { MyContext, MyConversation } from '../../common/utils';

export const technicsConversation = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
) => {
  const meets = await thisv2.signupsService.getCountOfMeets();
  const redis = await thisv2.redisService.getCounts();
  const tasks = await thisv2.tasksService.getCounts();
  await ctx
    .reply(
      `Встреч в ожиданий: <b>${meets}</b>\nВ памяти на восстановление: <b>${redis}</b>\nВ ожидании на уведомление: <b>${tasks}</b>`,
      {
        parse_mode: 'HTML',
      },
    )
    .catch((e) => console.log(e));
};
