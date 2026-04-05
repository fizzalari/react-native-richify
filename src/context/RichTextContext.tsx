import React, { createContext, useContext } from 'react';
import type { RichTextState, RichTextActions, UseRichTextReturn } from '../types';
import { useRichText, type UseRichTextOptions } from '../hooks/useRichText';

// ─── Context ─────────────────────────────────────────────────────────────────

const RichTextContext = createContext<UseRichTextReturn | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export interface RichTextProviderProps extends UseRichTextOptions {
  children: React.ReactNode;
}

/**
 * RichTextProvider wraps children with rich text state via React Context.
 *
 * Use this when you need to access the rich text state/actions from
 * deeply nested components (e.g., a custom toolbar in a different part
 * of the component tree).
 *
 * @example
 * ```tsx
 * <RichTextProvider onChangeSegments={handleChange}>
 *   <MyCustomToolbar />
 *   <RichTextInput showToolbar={false} />
 * </RichTextProvider>
 * ```
 */
export const RichTextProvider: React.FC<RichTextProviderProps> = ({
  children,
  ...options
}) => {
  const richText = useRichText(options);

  return (
    <RichTextContext.Provider value={richText}>
      {children}
    </RichTextContext.Provider>
  );
};

RichTextProvider.displayName = 'RichTextProvider';

// ─── Consumer Hook ───────────────────────────────────────────────────────────

/**
 * Hook to access the RichText state and actions from context.
 *
 * Must be used within a `<RichTextProvider>`.
 *
 * @throws If used outside of a RichTextProvider
 */
export function useRichTextContext(): UseRichTextReturn {
  const context = useContext(RichTextContext);
  if (!context) {
    throw new Error(
      'useRichTextContext must be used within a <RichTextProvider>. ' +
      'Wrap your component tree with <RichTextProvider> to use this hook.',
    );
  }
  return context;
}
