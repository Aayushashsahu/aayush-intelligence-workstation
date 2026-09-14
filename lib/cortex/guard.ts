/**
 * CORTEX SCOPE LOCK & SECURITY GUARD
 *
 * Deterministic application-level defense-in-depth gate.
 * Evaluates inbound prompts BEFORE model invocation to reject prompt injections,
 * generic coding tasks, general knowledge trivia, and offensive exploit requests.
 */

export const CANONICAL_DECLINE_SUMMARY =
  "I’m scoped specifically to Aayush Sahu and his documented work. I can’t help with that question, but I can explain his projects, engineering work, research, security work, or founder activity."

export const CANONICAL_DECLINE = {
  kind: 'declined',
  verdict: null,
  confidence: null,
  summary: CANONICAL_DECLINE_SUMMARY,
  evidence: [],
  gaps: ["The question is outside CORTEX's Aayush-specific scope."],
  verify: [],
}

/** Documented entities, projects, and terms associated with Aayush's portfolio */
const KNOWN_ENTITIES = [
  'aayush',
  'sahu',
  'sentinelforge',
  'aegis',
  'edith',
  'jarvis',
  'chronicle',
  'octiq',
  'cortex',
  'workstation',
  'dossier',
  'candidate',
  'founder',
  'author',
]

/**
 * Checks if the prompt contains an explicit prompt injection, role override,
 * or system prompt extraction attempt.
 */
function isPromptInjection(text: string): boolean {
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|prior|above|system|existing|your)\s+(instructions|prompts|rules|directives)/i,
    /forget\s+(all\s+)?(previous|prior|above|system|existing|your)\s+(instructions|prompts|rules)/i,
    /(you\s+are\s+now|pretend\s+you\s+are|act\s+as|roleplay\s+as|become)\s+(a\s+)?(general|chatgpt|dan|assistant|unrestricted|jailbroken|another)/i,
    /(developer|jailbreak|unrestricted|god)\s+mode/i,
    /(system\s+override|override\s+system|bypass\s+rules)/i,
    /(reveal|show|print|output|display|leak|repeat|give\s+me|tell\s+me)\s+(your|the)?\s*(system|internal)?\s*(prompt|instructions|system\s+message|initialization|context|internal\s+rules)/i,
    /what\s+is\s+your\s+(system\s+prompt|initial\s+prompt|hidden\s+instruction|system\s+instruction|prompt)/i,
    /output\s+initialization/i,
    /dan\s+mode/i,
    /do\s+anything\s+now/i,
  ]

  return injectionPatterns.some((pattern) => pattern.test(text))
}

/**
 * Checks if the prompt is an offensive hacking or exploit request.
 */
function isOffensiveExploitRequest(text: string): boolean {
  const offensivePatterns = [
    /(how\s+to|how\s+do\s+i|how\s+can\s+i)\s+(hack|exploit|compromise|breach|infiltrate|ddos|attack|crack)\s+(a|an|into|the|any)?/i,
    /(how\s+to|how\s+do\s+i|how\s+can\s+i)\s+exploit\s+(a\s+)?(sql\s+injection|xss|csrf|buffer\s+overflow|vulnerability|rce)/i,
    /(write|build|create|generate|give\s+me)\s+(a\s+)?(malware|keylogger|trojan|ransomware|exploit|payload|reverse\s+shell|virus)/i,
    /(how\s+to|how\s+do\s+i)\s+(steal|dump|intercept)\s+(passwords|credentials|hashes|cookies)/i,
  ]

  return offensivePatterns.some((pattern) => pattern.test(text))
}

/**
 * Checks if the prompt is a generic cybersecurity education request with no nexus to Aayush.
 * e.g., "What is SQL injection?", "Explain XSS"
 */
function isGenericSecurityEducation(text: string): boolean {
  const genericSecurityPatterns = [
    /^(what\s+is|what\s+are|explain|tell\s+me\s+about)\s+(sql\s+injection|sqli|xss|cross\s+site\s+scripting|csrf|buffer\s+overflow|zero\s+day|metasploit|ddos|man\s+in\s+the\s+middle|port\s+scanning)\b/i,
    /^(how\s+does|how\s+do)\s+(sql\s+injection|xss|csrf|buffer\s+overflow|ddos)\s+work/i,
  ]

  return genericSecurityPatterns.some((pattern) => pattern.test(text))
}

/**
 * Checks if the prompt is a generic coding, debugging, or creative writing request with no nexus to Aayush.
 * e.g., "Write a Python scraper", "Write me a function to...", "Tell me a joke"
 */
function isGenericCodingOrWritingTask(text: string): boolean {
  const genericTaskPatterns = [
    /^(write|code|create|generate|build|make)\s+(me\s+)?(a|an)?\s*(python|javascript|typescript|bash|sql|java|c\+\+|rust|react|node|html|css|go|php)?\s*(scraper|script|bot|app|crawler|parser|program|function|calculator|game|website|tool|algo|macro)/i,
    /^(solve|debug|fix|write)\s+(this|my)?\s*(code|leetcode|homework|equation|math|bug|algorithm|regex|sql):/i,
    /^(write|generate)\s+(me\s+)?(an\s+essay|a\s+poem|a\s+story|an\s+article|a\s+song|lyrics|cover\s+letter|resume)\s+(about|on|for)/i,
    /^(tell\s+me|write\s+(me\s+)?(a\s+)?)\s*(a\s+)?(joke|pun|story|riddle|poem|fairy\s+tale)\b/i,
  ]

  return genericTaskPatterns.some((pattern) => pattern.test(text))
}

/**
 * Checks if the prompt is general knowledge trivia, science, math, or generic CS/AI education with no nexus to Aayush.
 * e.g., "What is the capital of France?", "Explain how transformers work in machine learning", "Explain quantum mechanics"
 */
function isGeneralTriviaOrScience(text: string): boolean {
  const triviaPatterns = [
    /^(what\s+is\s+the\s+capital\s+of|who\s+is\s+the\s+president\s+of|who\s+was\s+the\s+first|how\s+far\s+is\s+the|what\s+year\s+did)\b/i,
    /^(explain|what\s+is)\s+(quantum\s+mechanics|quantum\s+physics|photosynthesis|theory\s+of\s+relativity|string\s+theory|plate\s+tectonics|thermodynamics|the\s+solar\s+system|black\s+holes)\b/i,
    /^(explain|what\s+is|how\s+does|how\s+do)\s+(how\s+)?(transformers|attention\s+mechanisms?|backpropagation|neural\s+networks?|gradient\s+descent|cnns?|rnns?|lstms?|diffusion\s+models?|machine\s+learning|deep\s+learning|reinforcement\s+learning|llms?|large\s+language\s+models?)\b/i,
    /^(what\s+is|calculate|evaluate)\s+\d+\s*[\+\-\*\/x\^]\s*\d+/i,
    /^(what\s+is\s+the\s+weather|what\s+time\s+is\s+it)\b/i,
    /^(who\s+is|who\s+was)\s+(?!aayush|he|the\s+engineer|the\s+candidate|the\s+founder)\b/i,
  ]

  return triviaPatterns.some((pattern) => pattern.test(text))
}

/**
 * Returns true if the message has an explicit nexus to Aayush, his documented entities,
 * or his workstation persona.
 */
function hasAayushNexus(text: string): boolean {
  const lower = text.toLowerCase()
  // Check known entity names
  if (KNOWN_ENTITIES.some((entity) => lower.includes(entity))) {
    return true
  }

  // Check personal/evaluative pronouns commonly used by interviewers/evaluators
  // e.g., "What are his strengths?", "Would he fit an AI role?", "Does he have experience with..."
  const pronounPatterns = [
    /\b(he|his|him)\b/i,
    /\b(you|your)\b/i,
    /\b(the\s+engineer|the\s+developer|the\s+candidate|the\s+founder)\b/i,
  ]
  return pronounPatterns.some((p) => p.test(text))
}

export type ScopeCheckResult =
  | { allowed: true }
  | { allowed: false; reason: string }

/**
 * Evaluates an inbound question against CORTEX scope rules.
 */
export function evaluateScope(message: string): ScopeCheckResult {
  const trimmed = message.trim()
  if (!trimmed) {
    return { allowed: false, reason: 'Empty question.' }
  }

  // 1. Prompt injection / jailbreak check (always blocks regardless of entity mention)
  if (isPromptInjection(trimmed)) {
    return { allowed: false, reason: 'Prompt injection or role override attempt detected.' }
  }

  // 2. Offensive hacking / exploit request (always blocks)
  if (isOffensiveExploitRequest(trimmed)) {
    return { allowed: false, reason: 'Offensive exploitation request is out of scope.' }
  }

  // 3. Generic security education (e.g. "What is SQL injection?")
  // If no explicit nexus to Aayush, decline
  if (isGenericSecurityEducation(trimmed) && !hasAayushNexus(trimmed)) {
    return { allowed: false, reason: 'General cybersecurity education without Aayush nexus.' }
  }

  // 4. Generic coding or writing tasks (e.g. "Write a Python scraper")
  if (isGenericCodingOrWritingTask(trimmed) && !hasAayushNexus(trimmed)) {
    return { allowed: false, reason: 'Generic coding or content generation task.' }
  }

  // 5. General trivia, science, or math (e.g. "What is the capital of France?")
  if (isGeneralTriviaOrScience(trimmed) && !hasAayushNexus(trimmed)) {
    return { allowed: false, reason: 'General knowledge or trivia request.' }
  }

  // In all other cases, proceed to the model layer (Layer 2 will enforce the strict boundary)
  return { allowed: true }
}

/**
 * Enforces the CORTEX response contract and sanitizes output.
 */
export function sanitizeCortexResponse(parsed: any): any {
  if (!parsed || typeof parsed !== 'object') {
    return CANONICAL_DECLINE
  }

  const kind = parsed.kind
  if (kind === 'declined') {
    return {
      kind: 'declined',
      verdict: null,
      confidence: null,
      summary: parsed.summary || CANONICAL_DECLINE_SUMMARY,
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
      gaps:
        Array.isArray(parsed.gaps) && parsed.gaps.length > 0
          ? parsed.gaps
          : ["The question is outside CORTEX's Aayush-specific scope."],
      verify: Array.isArray(parsed.verify) ? parsed.verify : [],
    }
  }

  return {
    kind: typeof parsed.kind === 'string' ? parsed.kind : 'profile',
    verdict: parsed.verdict ?? null,
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : null,
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
    gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
    verify: Array.isArray(parsed.verify) ? parsed.verify : [],
  }
}
