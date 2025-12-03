import React, { useRef } from "react";
import {
    MenuButtonAddTable,
    MenuButtonBold,
    MenuButtonBulletedList,
    MenuButtonHorizontalRule,
    MenuButtonItalic,
    MenuButtonOrderedList,
    MenuButtonRedo,
    MenuButtonStrikethrough,
    MenuButtonTaskList,
    MenuButtonUnderline,
    MenuButtonUndo,
    MenuControlsContainer,
    MenuDivider,
    MenuSelectHeading,
    RichTextEditor,
    RichTextReadOnly,
    TableBubbleMenu,
    TableImproved,
} from "mui-tiptap";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { HorizontalRule } from "@mui/icons-material";
import { Button, Grid2 as Grid } from "@mui/material";

const RichTextDocumentationEditor = ({
    richTextContent,
    updateContent,
    readOnly = false,
    template,
}) => {
    const richTextEditorRef = useRef();

    const onUpdateExecute = () => {
        !readOnly && updateContent(richTextEditorRef.current?.editor?.getHTML());
    };

    const extensionList = [
        TableImproved.configure({
            resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        StarterKit,
        Underline,
        TaskList,
        TaskItem,
        HorizontalRule,
    ];

    const EditorControlsList = () => {
        return (
            <Grid container>
                <Grid size={"auto"} sx={{ alignContent: "center" }}>
                    <MenuControlsContainer>
                        <MenuButtonUndo />
                        <MenuButtonRedo />

                        <MenuDivider />
                        <MenuSelectHeading />
                        <MenuDivider />

                        <MenuButtonBold />
                        <MenuButtonItalic />
                        <MenuButtonStrikethrough />
                        <MenuButtonUnderline />
                        <MenuDivider />

                        <MenuButtonOrderedList />
                        <MenuButtonBulletedList />
                        <MenuButtonTaskList />
                        <MenuDivider />

                        <MenuButtonHorizontalRule />
                        <MenuDivider />

                        <MenuButtonAddTable />
                        <MenuDivider />
                        {/* Add more controls of your choosing here */}
                    </MenuControlsContainer>
                </Grid>
                <Grid size={"grow"}>
                    {template && (
                        <Button
                            sx={{ float: "inline-end" }}
                            onClick={() => {
                                const newContent =
                                    richTextEditorRef.current?.editor?.getHTML() + template;
                                richTextEditorRef.current?.editor?.commands.setContent(newContent);
                                updateContent(newContent);
                            }}
                        >
                            Use Template
                        </Button>
                    )}
                </Grid>
            </Grid>
        );
    };

    return (
        <>
            {readOnly ? (
                <RichTextReadOnly
                    extensions={extensionList}
                    content={richTextContent}
                    renderControls={EditorControlsList}
                >
                    {() => (
                        <>
                            <TableBubbleMenu />
                        </>
                    )}
                </RichTextReadOnly>
            ) : (
                <RichTextEditor
                    ref={richTextEditorRef}
                    extensions={extensionList}
                    content={richTextContent}
                    renderControls={EditorControlsList}
                    onUpdate={() => onUpdateExecute()}
                >
                    {() => (
                        <>
                            <TableBubbleMenu />
                        </>
                    )}
                </RichTextEditor>
            )}
        </>
    );
};

export default RichTextDocumentationEditor;
