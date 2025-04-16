import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { User } from '../entities/user.entity';
import { hashPassword } from '../../../common/utils/password.util';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>): Promise<void> {
    const { entity } = event;
    if (entity.password) {
      entity.password = await hashPassword(entity.password);
    }
  }

  async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
    const { entity } = event;
    if (!entity || !entity.password) return;

    const isPasswordChanged = entity.password !== event.databaseEntity.password;

    const isHashed =
      entity.password.startsWith('$2a$') ||
      entity.password.startsWith('$2y$') ||
      entity.password.startsWith('$2b$');

    if (isPasswordChanged && !isHashed) {
      entity.password = await hashPassword(entity.password);
    }
  }
}
