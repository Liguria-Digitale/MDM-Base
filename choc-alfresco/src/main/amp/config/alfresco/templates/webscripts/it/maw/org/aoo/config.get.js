Packages.org.alfresco.repo.security.authentication.AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();
var site = siteService.getSite(args.site);
model.site = site;

model.custom = Packages.it.maw.choc.util.AooUtil.buildCustomConfig(site.shortName);

