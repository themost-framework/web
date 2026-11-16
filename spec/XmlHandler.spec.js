const {XmlHandler} = require('../index');
const path = require('path');
const util = require('util');
describe('XmlHandler', () => {
   it('should handle xml', async () => {
      const handler = new XmlHandler();
      expect(handler).toBeTruthy();
      const validateRequestAsync = util.promisify(handler.validateRequest);
      await validateRequestAsync({
          request: {
              method: 'POST',
              headers: {
                'content-type': 'application/xml',
              },
              body: `
                <note>
                    <to>Tove</to>
                    <from>Jani</from>
                    <heading>Reminder</heading>
                    <body>Don't forget me this weekend!</body>
                </note>
              `
          }
      });
   });
});
