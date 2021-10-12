package it.maw.choc.service;

import it.maw.choc.model.Service;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by Federico Tarantino on 12/05/15.
 */
public class Hookable extends Service {

    private HookableType type;
    private Map<String, Serializable> properties = new HashMap<>();

    public Hookable(HookableType htype){
        this.type = htype;
    }

    @Override
    protected boolean run() throws Exception {
        return true;
    }

    public enum HookableType {
        EXTEND_SITE_CONFIG
    }

    public HookableType getType() {
        return type;
    }

    public Map<String, Serializable> getProperties() {
        return properties;
    }

}
