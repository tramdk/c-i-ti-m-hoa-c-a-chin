declare module 'react-quill-new' {
    import React from 'react';
    export interface ReactQuillProps {
        theme?: string;
        modules?: any;
        formats?: string[];
        value?: string;
        children?: React.ReactNode;
        defaultValue?: string;
        readOnly?: boolean;
        placeholder?: string;
        tabIndex?: number;
        bounds?: string | HTMLElement;
        onChange?: (content: string, delta: any, source: any, editor: any) => void;
        onChangeSelection?: (range: any, source: any, editor: any) => void;
        onFocus?: (range: any, source: any, editor: any) => void;
        onBlur?: (previousRange: any, source: any, editor: any) => void;
        onKeyPress?: React.EventHandler<any>;
        onKeyDown?: React.EventHandler<any>;
        onKeyUp?: React.EventHandler<any>;
        preserveWhitespace?: boolean;
        className?: string;
        style?: React.CSSProperties;
    }
    class ReactQuill extends React.Component<ReactQuillProps> { }
    export default ReactQuill;
}
