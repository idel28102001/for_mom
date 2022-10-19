import { TelegramUpdate } from '../updates/telegram.update';
import { Composer, Context, session, SessionFlavor } from 'grammy';
import {
  ConversationFlavor,
  conversations,
  createConversation,
} from '@grammyjs/conversations';
import { telegramMenuUtility } from '../utility/telegramMenuUtility';
import { SignupsEnum } from '../../signups/enums/signups.enum';
import { CANCEL, Texts } from '../../common/texts';

export const composer = (thisv2: TelegramUpdate) => {
  const composer = new Composer<
    Context & SessionFlavor<Record<string, never>> & ConversationFlavor
  >();
  composer.use(session({ initial: () => ({}) }));
  composer.use(conversations());
  composer.hears(CANCEL, async (ctx) => {
    await ctx.conversation.exit();
    await telegramMenuUtility(ctx);
  });
  composer.use(
    createConversation(
      thisv2.telegramService.consDiagnostic.bind(
        thisv2,
        SignupsEnum.DIAGNOSTIC,
      ),
      'diagnostic',
    ),
  );
  composer.use(
    createConversation(
      thisv2.telegramService.consDiagnostic.bind(
        thisv2,
        SignupsEnum.CONSULTATION,
      ),
      'consultation',
    ),
  );
  composer.use(
    createConversation(
      thisv2.telegramService.makeMeAdmin.bind(thisv2),
      'secretcommandmakeadmin',
    ),
  );

  composer.use(
    createConversation(thisv2.telegramService.allMeets.bind(thisv2), 'show'),
  );
  composer.use(
    createConversation(
      thisv2.telegramService.cancelMeet.bind(thisv2),
      'cancel',
    ),
  );

  composer.use(
    createConversation(thisv2.telegramService.editMeet.bind(thisv2), 'edit'),
  );

  composer.hears(Texts.DIAGNOSTIC, async (ctx) => {
    try {
      await ctx.conversation.enter('diagnostic');
    } catch (e) {}
  });

  composer.hears(Texts.CONSULTATION, async (ctx) => {
    try {
      await ctx.conversation.enter('consultation');
    } catch (e) {}
  });

  composer.hears(Texts.EDIT, async (ctx) => {
    try {
      await ctx.conversation.enter('edit');
    } catch (e) {}
  });

  composer.hears(Texts.CANCEL, async (ctx) => {
    try {
      await ctx.conversation.enter('cancel');
    } catch (e) {}
  });

  composer.hears(Texts.SHOW, async (ctx) => {
    try {
      await ctx.conversation.enter('show');
    } catch (e) {}
  });

  composer.on('message', async (ctx) => {
    if (!ctx.session.conversation) {
      await telegramMenuUtility(ctx);
    }
  });

  return composer;
};
