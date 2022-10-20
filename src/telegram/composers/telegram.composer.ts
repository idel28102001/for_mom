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
import { MyContext, SessionData } from '../../common/utils';
import { RolesEnum } from '../../users-center/enums/roles.enum';

export const composer = (thisv2: TelegramUpdate) => {
  const composer = new Composer<
    Context & SessionFlavor<SessionData | any> & ConversationFlavor
  >();
  composer.use(
    session({
      initial: () => ({ role: undefined }),
    }),
  );
  composer.use(async (ctx: MyContext, next) => {
    if (!ctx.session.role) {
      const user = await thisv2.usersCenterService.repo.findOne({
        where: { telegramId: ctx.from.id.toString() },
        select: ['id', 'role'],
      });
      if (user) {
        ctx.session.role = user.role;
      } else {
        await thisv2.usersCenterService.saveToDBUser(ctx.from);
        ctx.session.role = RolesEnum.USER;
      }
    }
    await next();
  });
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
