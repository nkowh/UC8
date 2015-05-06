package com.nikoyo.ucontent.elasticfile;


import com.nikoyo.ucontent.elasticfile.local.LocalFileSystem;
import com.nikoyo.ucontent.elasticfile.losf.BlockFileSystem;
import com.nikoyo.ucontent.elasticfile.s3.S3FileSystem;
import org.elasticsearch.client.Client;

public class FileSystemFactory {

    private final Client client;

    public FileSystemFactory(Client client) {
        this.client = client;
    }

    public FileSystem newFileSystem() {
        String fs = Configuration.UC_PROPERTIES.getProperty("fs", "local");
        if ("local".equalsIgnoreCase(fs)) {
            return new LocalFileSystem();
        } else if ("losf".equalsIgnoreCase(fs)) {
            return new BlockFileSystem(client.settings().get("node.name"));
        } else if ("s3".equalsIgnoreCase(fs)) {
            return new S3FileSystem();
        }
        return null;

    }

}
