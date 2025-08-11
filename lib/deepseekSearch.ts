export function notImplementedDeepseekSearch() {
  return {
    message:
      "DeepSeek native search is selected (SEARCH_PROVIDER=deepseek) but the integration is not yet implemented. Please confirm the Search/Browse API parameters or switch SEARCH_PROVIDER=tavily.",
  } as const;
}
