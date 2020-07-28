import {LyricListService} from "./LyricListService";
import {RhymingService} from "./RhymingService";
import {LyricService} from "./LyricService";
import {Top40Service} from "./Top40Service";
import * as Sinon from 'sinon';
import {expect} from 'chai';
import 'mocha';

describe('LyricListService', () => {

    let service: LyricListService;
    let mockRhymingService: RhymingService;
    let mockLyricService: LyricService;
    let mockTop40Service: Top40Service;

    let sandbox: Sinon.SinonSandbox;
    // @ts-ignore
    before(() => sandbox = Sinon.createSandbox());
    afterEach(() => sandbox.restore());


    beforeEach(() => {
        service = new LyricListService('fake-api-key');
        (service as any).rhymingService = mockRhymingService = sandbox.stub() as any;
        (service as any).lyricService = mockLyricService = sandbox.stub() as any;
        (service as any).top40Service = mockTop40Service = sandbox.stub() as any;
    });

    describe('findRhymingWords()', () => {
        it('should query for rhyming words given a single input word', async () => {
            const fetchRhymingWordsStub = sandbox.stub().resolves(['save']);
            mockRhymingService.fetchRhymingWords = fetchRhymingWordsStub;

            const result = await service.findRhymingWords({primary: ['gave'], secondary: []});
            expect(result).to.deep.equal({primary: ['gave', 'save'], secondary: []});
            expect(fetchRhymingWordsStub.callCount).to.equal(1);
            expect(fetchRhymingWordsStub.getCall(0).args).to.deep.equal(['gave']);
        });
    })
});
