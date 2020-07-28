import {parseSearchTerms} from "./search";
import {expect} from 'chai';

describe('search', () => {
    it('parseSearchTerms()', () => {
        expect(parseSearchTerms('save')).to.deep.equal({primary: ['save'], secondary: []});
        expect(parseSearchTerms('save me')).to.deep.equal({primary: ['save'], secondary: ['me']});
        expect(parseSearchTerms('save "me"')).to.deep.equal({primary: ['save', 'me'], secondary: []});
        expect(parseSearchTerms('"save me"')).to.deep.equal({primary: ['save me'], secondary: []});
    });
});
