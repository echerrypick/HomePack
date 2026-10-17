const DYNAMIC_IMPORT_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
  /ChunkLoadError/i,
  /Loading chunk [^ ]+ failed/i,
];

export function staleDeploymentFailureKey(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  if (!DYNAMIC_IMPORT_PATTERNS.some(pattern => pattern.test(message))) return null;
  const asset = message.match(/https?:\/\/[^\s)]+\/assets\/[^\s)]+\.js/i)?.[0];
  return asset || message;
}
