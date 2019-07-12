const Page = require('./helpers/page');
let page;
//can do test.only() to run just a single test in the file isntead of every test as we add more tests

beforeEach(async () => {
    page = await Page.build();    
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

test('Lets launch a browser', async () => {
    
    //const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    const text = await page.getContentsOf('a.brand-logo');

    expect(text).toEqual('Blogster');
});

test('clicking login starts oAuth', async () => {
     await page.click('.right a');
     const url = await page.url();

     expect(url).toMatch(/accounts\.google\.com/);
});

//need to fake a session by taking user id from mongodb and turn it into a cookie
test('Check headers after login', async () => {
    await page.login();
    
    const text = await page.$eva('a[href="/auth/logout"]', el => el.innerHTML);

    expect(text).toEqual('Logout');
});