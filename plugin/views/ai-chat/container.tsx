import React, { useEffect, useRef, useState } from "react";
import { ChatComponent } from "./chat";
import FileOrganizer from "../..";
import { Card } from "./card";
import { Button } from "./button";

interface AIChatSidebarProps {
  plugin: FileOrganizer;
  apiKey: string;
}

const AIChatSidebar: React.FC<AIChatSidebarProps> = ({ plugin, apiKey }) => {
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<
    { id: string; role: string; content: string }[][]
  >([[]]);
  const [currentConversationIndex, setCurrentConversationIndex] =
    useState<number>(0);

  const startNewConversation = () => {
    setConversations([...conversations, []]);
    setCurrentConversationIndex(conversations.length);
  };

  useEffect(() => {
    const loadFileContent = async () => {
      const activeFile = plugin.app.workspace.getActiveFile();
      if (activeFile) {
        try {
          const content = await plugin.app.vault.read(activeFile);
          setFileContent(content);
          setFileName(activeFile.basename);
        } catch (error) {
          console.error(`Error reading file: ${error}`);
          setFileContent("");
          setFileName(null);
        }
      } else {
        setFileContent("");
        setFileName(null);
      }
    };

    loadFileContent();

    // Set up event listener for file changes
    const onFileOpen = plugin.app.workspace.on("file-open", loadFileContent);

    return () => {
      plugin.app.workspace.offref(onFileOpen);
    };
  }, [plugin.app.workspace, plugin.app.vault]);

  return (
    <Card className="ai-chat-sidebar">
      <div className="new-conversation-container">
        <Button
          onClick={startNewConversation}
          className="new-conversation-button"
          aria-label="New Conversation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
      <ChatComponent
        key={currentConversationIndex}
        plugin={plugin}
        fileContent={fileContent}
        fileName={fileName}
        apiKey={apiKey}
        inputRef={inputRef}
        history={conversations[currentConversationIndex]}
        setHistory={newHistory => {
          const updatedConversations = [...conversations];
          updatedConversations[currentConversationIndex] = newHistory;
          setConversations(updatedConversations);
        }}
      />
    </Card>
  );
};

export default AIChatSidebar;