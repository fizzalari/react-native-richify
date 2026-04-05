import type { TextStyle, ViewStyle, TextInputProps, ColorValue } from 'react-native';
/**
 * Supported inline formatting types.
 */
export type FormatType = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code';
/**
 * Heading level presets.
 */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'none';
/**
 * List type for a line/paragraph.
 */
export type ListType = 'bullet' | 'ordered' | 'none';
/**
 * Inline formatting styles attached to a text segment.
 */
export interface FormatStyle {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    heading?: HeadingLevel;
}
/**
 * A segment of text with uniform formatting.
 * The entire rich text content is an ordered array of these segments.
 */
export interface StyledSegment {
    /** The text content of this segment. */
    text: string;
    /** The formatting styles applied to this segment. */
    styles: FormatStyle;
}
/**
 * Represents a text selection range within the input.
 */
export interface SelectionRange {
    /** Start index (inclusive). */
    start: number;
    /** End index (exclusive). */
    end: number;
}
/**
 * The complete state of the rich text input.
 */
export interface RichTextState {
    /** Ordered array of styled text segments. */
    segments: StyledSegment[];
    /** Current selection range. */
    selection: SelectionRange;
    /** The current active styles that will be applied to newly typed text. */
    activeStyles: FormatStyle;
}
/**
 * Actions returned by the useRichText hook for controlling the editor.
 */
export interface RichTextActions {
    /** Toggle an inline format on the current selection or active styles. */
    toggleFormat: (format: FormatType) => void;
    /** Set a specific style property on the current selection. */
    setStyleProperty: <K extends keyof FormatStyle>(key: K, value: FormatStyle[K]) => void;
    /** Apply a heading level to the current line. */
    setHeading: (level: HeadingLevel) => void;
    /** Set the text color for the current selection. */
    setColor: (color: string) => void;
    /** Set the background color for the current selection. */
    setBackgroundColor: (color: string) => void;
    /** Set the font size for the current selection. */
    setFontSize: (size: number) => void;
    /** Handle text change from TextInput. */
    handleTextChange: (text: string) => void;
    /** Handle selection change from TextInput. */
    handleSelectionChange: (selection: SelectionRange) => void;
    /** Check whether a format is active at the current cursor/selection. */
    isFormatActive: (format: FormatType) => boolean;
    /** Get the effective shared style at the current cursor/selection. */
    getSelectionStyle: () => FormatStyle;
    /** Get the full plain text content. */
    getPlainText: () => string;
    /** Export the segments as a serializable JSON array. */
    exportJSON: () => StyledSegment[];
    /** Import segments from a JSON array, replacing current content. */
    importJSON: (segments: StyledSegment[]) => void;
    /** Clear all content. */
    clear: () => void;
}
/**
 * Return value of the useRichText hook.
 */
export interface UseRichTextReturn {
    state: RichTextState;
    actions: RichTextActions;
}
/**
 * Theme configuration for the RichTextInput component.
 */
export interface RichTextTheme {
    /** Style for the outer container. */
    containerStyle?: ViewStyle;
    /** Style for the TextInput. */
    inputStyle?: TextStyle;
    /** Style for the overlay text container. */
    overlayContainerStyle?: ViewStyle;
    /** Base text style applied to all segments before formatting. */
    baseTextStyle?: TextStyle;
    /** Style for the toolbar container. */
    toolbarStyle?: ViewStyle;
    /** Style for toolbar buttons. */
    toolbarButtonStyle?: ViewStyle;
    /** Style for active toolbar buttons. */
    toolbarButtonActiveStyle?: ViewStyle;
    /** Text style for toolbar button labels. */
    toolbarButtonTextStyle?: TextStyle;
    /** Text style for active toolbar button labels. */
    toolbarButtonActiveTextStyle?: TextStyle;
    /** Style for the code format. */
    codeStyle?: TextStyle;
    /** Colors */
    colors?: {
        /** Primary accent color. */
        primary?: string;
        /** Background color of the editor. */
        background?: string;
        /** Text color. */
        text?: string;
        /** Placeholder text color. */
        placeholder?: string;
        /** Toolbar background. */
        toolbarBackground?: string;
        /** Toolbar border color. */
        toolbarBorder?: string;
        /** Cursor / caret color. */
        cursor?: ColorValue;
    };
}
/**
 * A toolbar item configuration.
 */
export interface ToolbarItem {
    /** Unique identifier. */
    id: string;
    /** Display label or icon text. */
    label: string;
    /** The format type this button toggles (for inline formats). */
    format?: FormatType;
    /** The heading level this button sets. */
    heading?: HeadingLevel;
    /** Custom action handler (overrides default behavior). */
    onPress?: () => void;
    /** Whether this item is currently active. */
    active?: boolean;
    /** Custom render function for the button. */
    renderButton?: (props: ToolbarButtonRenderProps) => React.ReactElement | null;
}
/**
 * Props passed to a custom toolbar button renderer.
 */
export interface ToolbarButtonRenderProps {
    active: boolean;
    onPress: () => void;
    label: string;
}
/**
 * Props passed to a custom toolbar renderer.
 */
export interface ToolbarRenderProps {
    items: ToolbarItem[];
    state: RichTextState;
    actions: RichTextActions;
}
/**
 * Props for the OverlayText component.
 */
export interface OverlayTextProps {
    /** The styled segments to render. */
    segments: StyledSegment[];
    /** Base text style. */
    baseTextStyle?: TextStyle;
    /** Theme overrides. */
    theme?: RichTextTheme;
}
/**
 * Props for the ToolbarButton component.
 */
export interface ToolbarButtonProps {
    /** Button label text. */
    label: string;
    /** Whether the button is currently active. */
    active: boolean;
    /** Press handler. */
    onPress: () => void;
    /** Theme overrides. */
    theme?: RichTextTheme;
    /** Custom render function. */
    renderButton?: ToolbarItem['renderButton'];
}
/**
 * Props for the Toolbar component.
 */
export interface ToolbarProps {
    /** The current rich text actions. */
    actions: RichTextActions;
    /** The current rich text state. */
    state: RichTextState;
    /** Custom toolbar items (overrides defaults). */
    items?: ToolbarItem[];
    /** Theme overrides. */
    theme?: RichTextTheme;
    /** Whether to show the toolbar. */
    visible?: boolean;
    /** Custom render function for the entire toolbar. */
    renderToolbar?: (props: ToolbarRenderProps) => React.ReactElement | null;
}
/**
 * Props for the main RichTextInput component.
 */
export interface RichTextInputProps {
    /** Initial segments to populate the editor with. */
    initialSegments?: StyledSegment[];
    /** Callback when the content changes. */
    onChangeSegments?: (segments: StyledSegment[]) => void;
    /** Callback when the plain text changes. */
    onChangeText?: (text: string) => void;
    /** Placeholder text. */
    placeholder?: string;
    /** Whether the input is editable. */
    editable?: boolean;
    /** Maximum character length. */
    maxLength?: number;
    /** Whether to show the toolbar. */
    showToolbar?: boolean;
    /** Toolbar position relative to the input. */
    toolbarPosition?: 'top' | 'bottom';
    /** Custom toolbar items. */
    toolbarItems?: ToolbarItem[];
    /** Theme configuration. */
    theme?: RichTextTheme;
    /** Whether multiline input is enabled. */
    multiline?: boolean;
    /** Minimum height for the input area. */
    minHeight?: number;
    /** Maximum height for the input area. */
    maxHeight?: number;
    /** Auto-focus the input on mount. */
    autoFocus?: boolean;
    /** Additional TextInput props. */
    textInputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'onSelectionChange' | 'multiline' | 'placeholder' | 'editable' | 'maxLength' | 'autoFocus'>;
    /** Custom toolbar render function. */
    renderToolbar?: ToolbarProps['renderToolbar'];
    /** Ref callback to access actions. */
    onReady?: (actions: RichTextActions) => void;
}
