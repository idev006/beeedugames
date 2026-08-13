// FramingCopy — pure presentation for P1-3 (quotative + transfer framings).
//
// The engine ALWAYS builds `divisor` groups of `quotient` fruits each (n = d × q);
// a scenario's `framing` only decides how the question is asked and which
// number is the answer, so adding variety never touches the mechanic:
//   - partitive : แบ่ง n ให้ d ตัว ตัวละเท่าไร?          → answer = q (per basket)
//   - quotative : จัด n เป็นชุดละ q ผล ได้กี่ชุด?         → answer = d (groups)
//   - transfer  : สร้างกลุ่มให้ตรงกับประโยค n ÷ d = q    → answer = q (build the sentence)
// Pure strings + numbers, no Vue, no DOM — unit tests can pin every sentence.
export function framingPresentation({ scenario, fruitLabel }) {
  const framing = scenario.framing ?? 'partitive';
  const dividend = Number(scenario.dividend) || 0;
  const divisor = Number(scenario.divisor) || 1;
  const quotient = Number(scenario.quotient) || 1;
  const remainder = Number(scenario.remainder) || 0;
  const label = fruitLabel ?? 'ผลไม้';
  const groupWord = framing === 'quotative' ? 'ชุด' : framing === 'transfer' ? 'กลุ่ม' : 'ตะกร้า';

  if (framing === 'quotative') {
    return {
      framing,
      groupWord,
      orientLine1: `จัด${label} ${dividend} ผล`,
      orientLine2: `เป็นชุดละ ${quotient} ผล — ได้กี่ชุด?`,
      equationPrompt: { dividend, divisor: quotient, answer: '?' },
      equationSolved: { dividend, divisor: quotient, answer: divisor },
      equationAria: `${dividend} หาร ${quotient} เท่ากับเท่าไร`,
      guideHint: `ใส่ให้ครบชุดละ ${quotient} ผล`,
      feedbackCorrect: `ทุกชุดมี ${quotient} ผล`,
      completionEyebrow: 'จัดชุดครบแล้ว!',
      completionShort: `ชุดละ ${quotient} ผล — ครบ ${divisor} ชุด`,
      reflectionSentence: `${dividend} ÷ ${quotient} = ${divisor} ชุด เศษ ${remainder}`,
    };
  }
  if (framing === 'transfer') {
    return {
      framing,
      groupWord,
      orientLine1: 'สร้างกลุ่มให้ตรงกับประโยคสัญลักษณ์',
      orientLine2: `${dividend} ÷ ${divisor} = ${quotient}`,
      equationPrompt: { dividend, divisor, answer: quotient },
      equationSolved: { dividend, divisor, answer: quotient },
      equationAria: `ประโยคสัญลักษณ์ ${dividend} หาร ${divisor} เท่ากับ ${quotient}`,
      guideHint: `ใส่ให้ครบกลุ่มละ ${quotient} ผล`,
      feedbackCorrect: `ทุกกลุ่มมี ${quotient} ผล ครบ ${divisor} กลุ่ม`,
      completionEyebrow: 'สร้างกลุ่มตรงกับประโยคแล้ว!',
      completionShort: `กลุ่มละ ${quotient} ผล — ครบ ${divisor} กลุ่ม`,
      reflectionSentence: `${dividend} ÷ ${divisor} = ${quotient} เศษ ${remainder}`,
    };
  }
  // partitive (default)
  return {
    framing,
    groupWord,
    orientLine1: `ช่วยแบ่ง${label} ${dividend} ผล`,
    orientLine2: `ให้มอนเมล็ด ${divisor} ตัวเท่า ๆ กัน`,
    equationPrompt: { dividend, divisor, answer: '?' },
    equationSolved: { dividend, divisor, answer: quotient },
    equationAria: `${dividend} หาร ${divisor} เท่ากับเท่าไร`,
    guideHint: `ใส่ให้ครบตะกร้าละ ${quotient} ผล`,
    feedbackCorrect: `ทุกตะกร้ามี ${quotient} ผล`,
    completionEyebrow: 'งานเลี้ยงพร้อมแล้ว!',
    completionShort: `ตะกร้าละ ${quotient} ผล`,
    reflectionSentence: `${dividend} ÷ ${divisor} = ${quotient} เศษ ${remainder}`,
  };
}
