import React from 'react';
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS, } from '@lexical/markdown';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {$generateHtmlFromNodes} from '@lexical/html';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';


import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";

import ActionsPlugin from './plugins/ActionsPlugin';

import './styles/style';

function Placeholder() {
    return <div className="editor-placeholder">Type your reply</div>;
}

const editorConfig = {
    onError(error) {
        throw error;
    },
    nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode
    ]
};

export default function TextEditor({editorRef}) {
    return (
        <div>
            <LexicalComposer initialConfig={editorConfig}>
                <div className="editor-container">
                    {/* // The below line should be uncommented once ready to enable rich text notes
                    <ToolbarPlugin /> */}
                    <div className="editor-inner">
                        <RichTextPlugin
                            contentEditable={<ContentEditable className="editor-input" />}
                            placeholder={<Placeholder />}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <OnChangePlugin onChange={(editorState, editor) => {
                            editorState.read(() => {
                                editorRef.current = DOMPurify.sanitize($generateHtmlFromNodes(editor));
                        });
                        }} />
                        <HistoryPlugin />
                        <AutoFocusPlugin />
                        <CodeHighlightPlugin />
                        <ListPlugin />
                        <LinkPlugin />
                        <AutoLinkPlugin />
                        <ListMaxIndentLevelPlugin maxDepth={7} />
                        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                        <ActionsPlugin />
                    </div>
                </div>
            </LexicalComposer>
        </div>
    );
}