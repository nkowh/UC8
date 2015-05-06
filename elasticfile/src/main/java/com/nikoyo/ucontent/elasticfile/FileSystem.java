package com.nikoyo.ucontent.elasticfile;

import java.io.IOException;

public interface FileSystem {

    String write(byte[] bytes) throws IOException;

    byte[] read(String location);


}
