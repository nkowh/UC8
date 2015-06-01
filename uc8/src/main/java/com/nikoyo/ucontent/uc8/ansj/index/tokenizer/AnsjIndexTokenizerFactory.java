package com.nikoyo.ucontent.uc8.ansj.index.tokenizer;

import org.ansj.lucene.util.AnsjTokenizer;
import org.ansj.splitWord.analysis.IndexAnalysis;
import org.apache.lucene.analysis.Tokenizer;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.inject.assistedinject.Assisted;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.index.Index;
import org.elasticsearch.index.analysis.AbstractTokenizerFactory;
import org.elasticsearch.index.settings.IndexSettings;

import java.io.BufferedReader;
import java.io.Reader;

import static org.ansj.elasticsearch.index.config.AnsjElasticConfigurator.*;

/**
 * Created by zhangqinghua on 14-9-3.
 */
public class AnsjIndexTokenizerFactory extends AbstractTokenizerFactory {

    @Inject
    public AnsjIndexTokenizerFactory(Index index,@IndexSettings Settings indexSettings,@Assisted String name, @Assisted Settings settings) {
        super(index, indexSettings, name, settings);
        init(indexSettings, settings);
    }

    public Tokenizer create(Reader reader) {
        return new AnsjTokenizer(new IndexAnalysis(new BufferedReader(reader)), reader, filter, pstemming);
    }

}