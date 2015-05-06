package com.nikoyo.ucontent.elasticfile;

import org.apache.commons.io.IOUtils;
import org.apache.commons.io.output.NullOutputStream;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.zip.CRC32;
import java.util.zip.CheckedInputStream;

public abstract class Utils {

    public static String checksumCRC32(byte[] buffer) throws IOException {
        CRC32 crc = new CRC32();
        crc.update(buffer);
        return String.format("%08X", crc.getValue());
    }
}
