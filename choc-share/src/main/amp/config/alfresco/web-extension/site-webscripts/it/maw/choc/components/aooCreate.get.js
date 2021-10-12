model.success = false;

var name = args.name,
	prefix = args.prefix;

// Call the repo to create the st:site folder structure
var conn = remote.connect("alfresco");
var repoResponse = conn.get("/choc/org/aoo/create?name="+encodeURIComponent(name)+"&prefix="+prefix);
if (repoResponse.status != 200) {
    status.setCode(repoResponse.status);
} else {
    var repoJSON = JSON.parse(repoResponse);
    // Check if we got a positive result from create site
    if (repoJSON.success)
    {
        // Yes we did, now create the Surf objects in the web-tier and the associated configuration elements
        // Retry a number of times until success - remove the site on total failure
        for (var r=0; r<3 && !model.success; r++)
        {
            var tokens = [];
            tokens["siteid"] = prefix;
            model.success = sitedata.newPreset("choc-site", tokens);
        }
        // if we get here - it was a total failure to create the site config - even after retries
        if (!model.success)
        {
            // Delete the st:site folder structure and set error handler
            conn.del("/api/sites/" + encodeURIComponent(prefix));
            status.setCode(status.STATUS_INTERNAL_SERVER_ERROR);
        }
    }
    else if (repoJSON.status.code)
    {
        // Default error handler to report failure to create st:site folder
        status.setCode(repoJSON.status.code, repoJSON.message);
    }
}