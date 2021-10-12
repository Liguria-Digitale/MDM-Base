model.success = false;
var disable = args.disable;
var uo = search.findNode(args.uo);
uo.properties["org:nodeUoDisabled"]=disable;
uo.save();
model.success = true;