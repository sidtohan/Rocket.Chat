import { Meteor } from 'meteor/meteor';
import { CustomSounds } from '@rocket.chat/models';
import { api } from '@rocket.chat/core-services';
import type { ICustomSound } from '@rocket.chat/core-typings';
import type { ServerMethods } from '@rocket.chat/ui-contexts';

import { hasPermission } from '../../../authorization/server';
import { RocketChatFileCustomSoundsInstance } from '../startup/custom-sounds';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		deleteCustomSound(_id: ICustomSound['_id']): Promise<boolean>;
	}
}

Meteor.methods<ServerMethods>({
	async deleteCustomSound(_id) {
		let sound = null;

		if (this.userId && hasPermission(this.userId, 'manage-sounds')) {
			sound = await CustomSounds.findOneById(_id);
		} else {
			throw new Meteor.Error('not_authorized');
		}

		if (sound == null) {
			throw new Meteor.Error('Custom_Sound_Error_Invalid_Sound', 'Invalid sound', {
				method: 'deleteCustomSound',
			});
		}

		RocketChatFileCustomSoundsInstance.deleteFile(`${sound._id}.${sound.extension}`);
		await CustomSounds.removeById(_id);
		api.broadcast('notify.deleteCustomSound', { soundData: sound });

		return true;
	},
});
