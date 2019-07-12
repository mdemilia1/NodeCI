const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionfactory');
const userFactory = require('../factories/userfactory');

class CustomPage 
{
    static async build()
    {
        const browser = await puppeteer.launch({
            headless: true,
            args:['--no-sandbox']
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function(target, property)
            {
                return customPage[property] || browser[property] ||  page[property];
            }
        });
    }

    constructor(page)
    {
        this.page = page;
    }

    async login()
    {
        const user = await userFactory();
        const {session, sig} = sessionFactory(user);
    
        await this.page.setCookie({name: 'session', value: session});
        await this.page.setCookie({name: 'session.sig', value: sig});
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf(selector)
    {
        return this.page.$eval(selector, el => el.innerHTML);
    }

    get(route)
    {
        return this.page.evaluate(
            (url) =>
            {
                return fetch(url, 
                {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json());
            }, route);
    }


    post(route,data)
    {
        return this.page.evaluate(
            (url, _data) =>
            {
                return fetch(url, 
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(_data)
                }).then(res => res.json());
            }, route, data);
    }
    
    execRequests(actions)
    {
        Promise.all(
            actions.map(({method, path, data}) =>
            {
                return this[method](path, data);
            })
        );
    }
}

module.exports = CustomPage;