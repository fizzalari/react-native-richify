import React from 'react';
import type { UseRichTextReturn } from '@/types';
import { type UseRichTextOptions } from '@/hooks/useRichText';
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
export declare const RichTextProvider: React.FC<RichTextProviderProps>;
/**
 * Hook to access the RichText state and actions from context.
 *
 * Must be used within a `<RichTextProvider>`.
 *
 * @throws If used outside of a RichTextProvider
 */
export declare function useRichTextContext(): UseRichTextReturn;
