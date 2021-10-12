model.success = false;
var nodeToAssoc = search.findNode(args.nodetoassoc);
var node = search.findNode(args.node);
var nameAssoc = args.nameassoc;

node.createAssociation(nodeToAssoc, nameAssoc);

model.success = true;