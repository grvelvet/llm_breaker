import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const hookStr = `
  // Restore settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('omoglyph_settings');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.keySalt) setKeySalt(p.keySalt);
        if (p.randomSlider !== undefined) setRandomSlider(p.randomSlider);
        if (p.shuffleSlider !== undefined) setShuffleSlider(p.shuffleSlider);
        if (p.aiSlider !== undefined) setAiSlider(p.aiSlider);
        if (p.classifierBypass !== undefined) setClassifierBypass(p.classifierBypass);
        if (p.injectStrategy) setInjectStrategy(p.injectStrategy);
        if (p.textStyle) setTextStyle(p.textStyle);
        if (p.translitMode) setTranslitMode(p.translitMode);
        if (p.breakTokenizer !== undefined) setBreakTokenizer(p.breakTokenizer);
        if (p.targetPlatform) setTargetPlatform(p.targetPlatform);
        if (p.payloadSplitting !== undefined) setPayloadSplitting(p.payloadSplitting);
        if (p.splitStrategy) setSplitStrategy(p.splitStrategy);
        if (p.splitStyle) setSplitStyle(p.splitStyle);
        if (p.splitChunkSize !== undefined) setSplitChunkSize(p.splitChunkSize);
      }
    } catch (e) {}
  }, []);

  // Save settings on change
  useEffect(() => {
    const settings = {
      keySalt, randomSlider, shuffleSlider, aiSlider, classifierBypass,
      injectStrategy, textStyle, translitMode, breakTokenizer, targetPlatform,
      payloadSplitting, splitStrategy, splitStyle, splitChunkSize
    };
    try {
      localStorage.setItem('omoglyph_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [keySalt, randomSlider, shuffleSlider, aiSlider, classifierBypass,
      injectStrategy, textStyle, translitMode, breakTokenizer, targetPlatform,
      payloadSplitting, splitStrategy, splitStyle, splitChunkSize]);

  // Calculate Dark Mode side effect
`;

code = code.replace('  // Calculate Dark Mode side effect', hookStr);

fs.writeFileSync('src/context/AppContext.tsx', code);
