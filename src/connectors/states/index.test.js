
const dynamodb = require('./dynamodb');
const cognitoStates = require('.');

jest.mock('./dynamodb');

describe('Cognito States', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when dynamodb works', () => {
    beforeEach(() => {
      dynamodb.dynamoGet.mockReturnValue(Promise.resolve());
      dynamodb.dynamoPut.mockReturnValue(Promise.resolve());
    });
    describe('save', () => {
      it('saves the state', () =>
        cognitoStates.save('1234').then(stateUuid => {
          expect(stateUuid).not.toBeNull();
          expect(stateUuid).to.be.a('string');
        }));
    });
    describe('get', () => {
      const UUID = 'KEY';
      describe('when the state exists', () => {
        beforeEach(() => {
          dynamodb.dynamoGet.mockImplementation(uuid => {
            expect(uuid).to.equal(UUID);
            return Promise.resolve({
              Item: {
                CognitoState: '1234'
              }
            });
          });
        });
        it('gets the state', () =>
          cognitoStates.get(UUID).then(cognitoState => {
            expect(cognitoState).toEqual('1234');
          }));
      });

      describe('when the state does not exist', () => {
        beforeEach(() => {
          dynamodb.dynamoGet.mockImplementation(uuid => {
            expect(uuid).to.equal(UUID);
            return Promise.resolve({});
          });
        });
        it('returns null', () =>
          cognitoStates.get(UUID).then(cognitoState => {
            expect(cognitoState).toEqual(null);
          }));
      });
    });
  });
});
