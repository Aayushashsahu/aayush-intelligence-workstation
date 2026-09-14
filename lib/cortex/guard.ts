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
 * persona escape, or internal system extraction attempt.
 */
function isPromptInjection(text: string): boolean {
  const injectionPatterns = [
    // Override / ignore instructions
    /(ignore|forget|override|bypass)\s+(all\s+)?(the\s+)?(aayush\s+context|previous|prior|above|system|existing|your|any)\s+(context|instructions|prompts|rules|directives|restrictions)/i,
    /you\s+should\s+ignore\s+(your\s+)?(restrictions|rules|instructions|prompts)/i,

    // Roleplay / persona escape / jailbreak
    /(you\s+are\s+now|pretend\s+you\s+are|act\s+as|roleplay\s+as|become|impersonate)\s+(a\s+)?(general|chatgpt|dan|assistant|unrestricted|jailbroken|another|cybersecurity\s+assistant|aayush)/i,
    /(developer|jailbreak|unrestricted|god)\s+mode/i,
    /(system\s+override|override\s+system|bypass\s+rules)/i,
    /dan\s+mode/i,
    /do\s+anything\s+now/i,

    // System prompt, hidden context, or internal configuration extraction
    /(reveal|show|print|output|display|leak|repeat|give\s+me|tell\s+me)\s+(me\s+)?(everything\s+in\s+)?(your|the)?\s*(system|hidden|internal)?\s*(prompt|instructions|system\s+message|initialization|context|internal\s+rules|secrets?|private\s+secrets?)/i,
    /what\s+is\s+your\s+(system\s+prompt|initial\s+prompt|hidden\s+instruction|system\s+instruction|prompt|hidden\s+context)/i,
    /what\s+(instructions|prompts)\s+(were\s+you\s+given|did\s+you\s+receive|do\s+you\s+have)/i,
    /what\s+(environment\s+variables|api\s+keys?|secrets?|credentials?)\s+(does|do|are)\s+(this|the|you)/i,
    /output\s+initialization/i,

    // Personal questions directed to the AI assistant / CORTEX persona
    /^(tell\s+me\s+)?(what\s+is\s+)?(your|cortex('s)?)\s+favorite\s+(programming\s+language|language|color|food|movie|hobby|game)/i,
  ]

  return injectionPatterns.some((pattern) => pattern.test(text))
}

/**
 * Checks if the prompt is an offensive hacking or exploit request.
 * Always rejects regardless of project mentions (e.g. "How do I exploit SentinelForge?").
 */
function isOffensiveExploitRequest(text: string): boolean {
  const offensivePatterns = [
    /(how\s+to|how\s+do\s+i|how\s+can\s+i)\s+(hack|exploit|compromise|breach|infiltrate|ddos|attack|crack)\b/i,
    /(how\s+to|how\s+do\s+i|how\s+can\s+i)\s+exploit\s+(a\s+)?(sql\s+injection|xss|csrf|buffer\s+overflow|vulnerability|rce|sentinelforge|aegis|\w+)/i,
    /(write|build|create|generate|give\s+me|help\s+me\s+write)\s+(a\s+)?(malware|keylogger|trojan|ransomware|exploit|payload|reverse\s+shell|virus)/i,
    /(how\s+to|how\s+do\s+i)\s+(steal|dump|intercept)\s+(passwords|credentials|hashes|cookies)/i,
  ]

  return offensivePatterns.some((pattern) => pattern.test(text))
}

/**
 * Checks if the prompt is a request to write code, scripts, or apps for the visitor.
 * CORTEX is an evidence engine, not a personal coding assistant.
 * Even requests disguised as "relevant to Aayush" (e.g. "Write a Python script for me, but make it relevant to Aayush")
 * must be rejected.
 */
function isVisitorCodeGenerationRequest(text: string): boolean {
  return (
    /^(write|generate|code|create|build|make)\s+(me\s+)?(a\s+)?(python|javascript|typescript|bash|sql|java|c\+\+|rust|react|node)?\s*script\s+(for\s+me|for\s+my)/i.test(text) ||
    /^(write|generate|code)\s+(me\s+)?a\s+(python|javascript|typescript|bash|sql|java|c\+\+|rust)?\s*script\b/i.test(text) ||
    /^(write|code|create|build)\s+me\s+(a|an)\s+(python|javascript|typescript|bash|sql|scraper|bot|app|tool|crawler)/i.test(text)
  )
}

/**
 * Checks if the prompt is a generic cybersecurity education request with no nexus to Aayush.
 * e.g., "What is SQL injection?", "Explain XSS"
 */
function isGenericSecurityEducation(text: string): boolean {
  const genericSecurityPatterns = [
    /^(can\s+you\s+|could\s+you\s+|please\s+)?(what\s+is|what\s+are|explain|tell\s+me\s+about)\s+(sql\s+injection|sqli|xss|cross\s+site\s+scripting|csrf|buffer\s+overflow|zero\s+day|metasploit|ddos|man\s+in\s+the\s+middle|port\s+scanning)\b/i,
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
 * e.g., "What is the capital of France?", "Explain how transformers work in machine learning", "Can you explain quantum mechanics?"
 */
function isGeneralTriviaOrScience(text: string): boolean {
  const triviaPatterns = [
    /^(can\s+you\s+|could\s+you\s+|please\s+)?(what\s+is\s+the\s+capital\s+of|who\s+is\s+the\s+president\s+of|who\s+was\s+the\s+first|how\s+far\s+is\s+the|what\s+year\s+did)\b/i,
    /^(can\s+you\s+|could\s+you\s+|please\s+)?(explain|what\s+is)\s+(quantum\s+mechanics|quantum\s+physics|photosynthesis|theory\s+of\s+relativity|string\s+theory|plate\s+tectonics|thermodynamics|the\s+solar\s+system|black\s+holes)\b/i,
    /^(explain|what\s+is|how\s+does|how\s+do)\s+(how\s+)?(transformers|attention\s+mechanisms?|backpropagation|neural\s+networks?|gradient\s+descent|cnns?|rnns?|lstms?|diffusion\s+models?|machine\s+learning|deep\s+learning|reinforcement\s+learning|llms?|large\s+language\s+models?)\b/i,
    /^(what\s+is|calculate|evaluate)\s+\d+\s*[\+\-\*\/x\^]\s*\d+/i,
    /^(what\s+is\s+the\s+weather|what\s+time\s+is\s+it)\b/i,
    /^(who\s+is|who\s+was)\s+(?!aayush|he|the\s+engineer|the\s+candidate|the\s+founder)\b/i,
    /^(what\s+do\s+you\s+think\s+about|what\s+are\s+your\s+thoughts\s+on)\s+(the\s+)?(french\s+revolution|world\s+war|history|politics|religion|elections?|crypto|bitcoin)\b/i,
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

  // Personal/evaluative pronouns referring specifically to Aayush or his persona
  // NOTE: Naked "you" or "your" is excluded to avoid pronoun-based bypasses (e.g. "Can you explain quantum mechanics?")
  const pronounPatterns = [
    /\b(he|his|him)\b/i,
    /\b(the\s+engineer|the\s+developer|the\s+candidate|the\s+founder)\b/i,
    /\b(your|you)\s+(work|projects?|background|experience|stack|code|repos?|repositories|role|skills?|architecture|dossiers?|bio|systems?|evaluat\w+|credentials?)\b/i,
    /\b(who\s+are\s+you|about\s+you|hire\s+you|evaluat\w+\s+you)\b/i,
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

  // 1. Prompt injection / jailbreak / system prompt extraction (always blocks)
  if (isPromptInjection(trimmed)) {
    return { allowed: false, reason: 'Prompt injection or role override attempt detected.' }
  }

  // 2. Offensive hacking / exploit request (always blocks regardless of entity mention)
  if (isOffensiveExploitRequest(trimmed)) {
    return { allowed: false, reason: 'Offensive exploitation request is out of scope.' }
  }

  // 3. Visitor script / code generation request (always blocks even if mentioning Aayush)
  if (isVisitorCodeGenerationRequest(trimmed)) {
    return { allowed: false, reason: 'Code generation for visitor is out of scope.' }
  }

  // 4. Generic security education (e.g. "What is SQL injection?")
  if (isGenericSecurityEducation(trimmed) && !hasAayushNexus(trimmed)) {
    return { allowed: false, reason: 'General cybersecurity education without Aayush nexus.' }
  }

  // 5. Generic coding or writing tasks (e.g. "Write a Python scraper")
  if (isGenericCodingOrWritingTask(trimmed) && !hasAayushNexus(trimmed)) {
    return { allowed: false, reason: 'Generic coding or content generation task.' }
  }

  // 6. General trivia, science, or math (e.g. "What is the capital of France?", "Can you explain quantum mechanics?")
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
