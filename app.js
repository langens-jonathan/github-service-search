// see https://github.com/mu-semtech/mu-javascript-template for more info

import { app, query, errorHandler } from 'mu';

import { get_services_on_github_for_name } from './github-service-search';

app.get('/services', async function( req, res ) {
    let name = req.query.name || "";
    const services = await get_services_on_github_for_name(name);
    res.send(
        JSON.stringify(services)
    );
} );

app.use(errorHandler);
