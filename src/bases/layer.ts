import applyMixins from '../util/applyMixins';

import AddedMixin from './mixins/added';
import EventsMixin from './mixins/events';

class LayerBase {

}

// tslint:disable-next-line: interface-name
interface LayerBase extends AddedMixin, EventsMixin { }

applyMixins(LayerBase, [AddedMixin, EventsMixin]);

export default LayerBase;
