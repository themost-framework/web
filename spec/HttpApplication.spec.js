const {HttpApplication} = require('../index');
const path = require('path');
describe('HttpApplication', () => {
   it('should create instance', () => {
      let executionPath = path.resolve(__dirname, 'app1');
      const app = new HttpApplication(executionPath);
      expect(app).toBeTruthy();
      expect(app.getExecutionPath()).toBe(executionPath);

   });
});
