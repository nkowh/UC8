package com.nikoyo.ucontent.uc8.file;

import java.io.IOException;

public interface FileSystem {

    String write(byte[] bytes) throws IOException;

    byte[] read(String location);


}
