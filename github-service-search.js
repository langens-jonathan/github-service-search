const request = require('request');

const auth = "Basic " + new Buffer(process.env.GITHUB_USERNAME + ":" + process.env.GITHUB_PASSWORD).toString("base64");

// Makes a call to github and returns the names of the repositories that match
// the given name.
// @param name the name that the result set of services is supposed to match
//             if this is equal to the empty string then all services that match
//             the template type will be returned.
// @param template the template for which we want to get services (ie. javascript, ruby, ...)
const make_call_to_github = function(name, template) {
    let url = "http://api.github.com/search/code?q=" + template + "+" + name;

    return new Promise((resolve, reject) => {
        request({
            'uri': url,
            'headers': {
                'Authorization': auth,
                'User-Agent': 'Awesome-Octocat-App'
            }
        }, (error, response, body) => {
            if (error) reject(error);
            if (response.statusCode != 200) {
                reject('Invalid status code <' + response.statusCode + '>');
            }
            resolve(body);
        });
    });
};

// small helper function that will tell me if the repository was already
// found before.
// @param arr the array of services found
// @param repo the name of the repository
const repository_exists_in_array = function(arr, repo) {
    for(let i = 0; i < arr.length; ++i) {
        if(arr[i]["name"] === repo) {
            return true;
        }
    }
    return false;
};

// this function translates the github API response to an array of objects
// @param name the name that the result set of services is supposed to match
//             if this is equal to the empty string then all services that match
//             the template type will be returned.
// @param template the template for which we want to get services (ie. javascript, ruby, ...)
const get_services_for_template_and_name = async function(name, template) {
    let services_found = [];
    const jsonResponse = JSON.parse(await make_call_to_github(name, template));
    for(let i = 0; i < jsonResponse["items"].length; ++i) {
        let result = jsonResponse["items"][i];
        let repository = result["repository"]["full_name"];
        let label = result["repository"]["name"];
        if(!repository_exists_in_array(services_found, repository)) {
            services_found.push({
                'name': repository,
                'label': label
            });
        }
    }
    return services_found;
};

// this function will return an array with results for the passed name and each of the
// known micro service templates
// @param name the name that the result set of services is supposed to match
//             if this is equal to the empty string then all services that match
//             the template type will be returned.
const get_services_on_github_for_name = async function(name) {
    let services = [];

    const javascript_services = await get_services_for_template_and_name(name, "mu-javascript-template");
    services = services.concat(javascript_services);
    const ruby_services = await get_services_for_template_and_name(name, "mu-ruby-template");
    services = services.concat(ruby_services);

    return services;
};

export {
    get_services_on_github_for_name
}
