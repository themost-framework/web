const {HttpApplication} = require('../index');
const path = require('path');
const { finalizeAppAsync } = require('./TestUtils');
describe('HttpApplication', () => {
   it('should create instance', async () => {
      let executionPath = path.resolve(__dirname, 'app1');
      const app = new HttpApplication(executionPath);
      expect(app).toBeTruthy();
      expect(app.getExecutionPath()).toBe(executionPath);
      await finalizeAppAsync(app);
   });
});
