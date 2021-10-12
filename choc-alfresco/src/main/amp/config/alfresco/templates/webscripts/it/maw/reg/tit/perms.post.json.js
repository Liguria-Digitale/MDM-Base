var jsonObj = jsonUtils.toObject(json),
	node = search.findNode(jsonObj.noderef),
	perms = jsonObj.perms;

if(Packages.it.maw.choc.model.ChocModel.getServiceRegistry().getPermissionService().hasPermission(node.nodeRef, "Write")){
    Packages.org.alfresco.repo.security.authentication.AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();
    var ps = Packages.it.maw.choc.model.ChocModel.getServiceRegistry().getPermissionService();
    ps.deletePermissions(node.nodeRef);
    for(var authority in perms){
        ps.setPermission(node.nodeRef, authority, perms[authority], true);
    }
}
