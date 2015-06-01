package com.nikoyo.ucontent.uc8.file;


import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class Configuration {
    public static final Properties UC_PROPERTIES = new Properties();

    static {
        loadProperty();
    }

    private static void loadProperty() {
        InputStream is = null;
        try {
            is = FileUtils.openInputStream(new File("ucontent.properties"));
            UC_PROPERTIES.load(is);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            IOUtils.closeQuietly(is);
        }
    }

    public static File concat(String fullFilenameToAdd) {
        return new File(FilenameUtils.concat(UC_PROPERTIES.getProperty("filestore"), fullFilenameToAdd));

    }


}
