import React from 'react';
import type { OverlayTextProps } from '@/types';
/**
 * OverlayText renders the styled text segments as a `<Text>` component tree.
 *
 * This component is positioned behind the transparent TextInput to create
 * the overlay effect — the user types into the TextInput while seeing
 * the formatted rendering from this component.
 */
export declare const OverlayText: React.FC<OverlayTextProps>;
