import { TelegramUpdate } from '../updates/telegram.update';
import { MyContext, MyConversation, prepareReply } from '../../common/utils';
import { CANCEL } from '../../common/texts';
import { menuKeyboard } from '../utility/telegramMenuUtility';

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
  if (meets > redis) {
    const keyboard = [
      [
        {
          text: 'Исправить',
        },
        { text: CANCEL },
      ],
    ];
    await prepareReply({
      ctx,
      conversation,
      text: '⚠️Наблюдаются сбои в системе. <b>Исправить?⚠</b>',
      keyboard,
      addToOther: { parse_mode: 'HTML' },
    });
    const response = await conversation.external(async () =>
      thisv2.tasksService
        .repairAll()
        .then((e) => 1)
        .catch((e) => 0),
    );
    if (response) {
      await ctx
        .reply('Всё исправлено успешно!', menuKeyboard(ctx))
        .catch(() => undefined);
    } else {
      await ctx
        .reply(
          'Что-то пошло не так, обратитесь к разработчику',
          menuKeyboard(ctx),
        )
        .catch(() => undefined);
    }
  }
};
