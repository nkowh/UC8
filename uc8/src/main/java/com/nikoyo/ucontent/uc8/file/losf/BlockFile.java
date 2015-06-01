package com.nikoyo.ucontent.uc8.file.losf;

public class BlockFile {

    private String name;
    private long position;
    private long length;


    public BlockFile() {
    }


    public BlockFile(String name, long position, long length) {
        this.name = name;
        this.position = position;
        this.length = length;
    }

    public static BlockFile valueOf(String s) {
        String[] parts = s.split(",");
        return new BlockFile(parts[0], Long.valueOf(parts[1]), Long.valueOf(parts[2]));
    }

    @Override
    public String toString() {
        return String.format("%s,%d,%d", name, position, length);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPosition(long position) {
        this.position = position;
    }

    public void setLength(long length) {
        this.length = length;
    }

    public long getPosition() {
        return position;
    }

    public long getLength() {
        return length;
    }
}
