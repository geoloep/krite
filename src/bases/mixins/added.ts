import Krite from '../../krite';

/**
 * Save reference to krite when added to an krite intance
 */
export default class AddedMixin {
    protected krite!: Krite;

    added(krite: Krite) {
        this.krite = krite;
    }

    get fetch() {
        if (!this.krite) {
            throw Error('Instance not added to an krite Instance');
        }
        return this.krite.options.fetch;
    }
}
