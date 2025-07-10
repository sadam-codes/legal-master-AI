interface ChatGPTFormatterProps {
  response: string;
  writing: boolean;
}

const ChatGPTFormatter: React.FC<ChatGPTFormatterProps> = ({
  response,
  writing,
}) => {
  const formatResponse = (text: string): string => {
    // Input validation
    if (!text || typeof text !== "string") {
      console.warn("Invalid input text:", text);
      return "";
    }

    // Remove double quotes at start and end if they exist
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, -1);
    }

    try {
      // Handle headers (##) - must be first to prevent interference with other formatting
      let formattedText = text.replace(/^##\s+(.*)$/gm, "<h2>$1</h2>");
      formattedText = formattedText.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");

      // Handle bold (**, __)
      formattedText = formattedText.replace(
        /(\*\*|__)(.*?)\1/g,
        "<strong>$2</strong>"
      );

      // Handle italic (*, _)
      formattedText = formattedText.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");

      // Handle strikethrough (~~)
      formattedText = formattedText.replace(/~~(.*?)~~/g, "<del>$1</del>");

      // Handle code blocks (``` and `)
      formattedText = formattedText.replace(
        /```([\s\S]*?)```/g,
        "<pre><code>$1</code></pre>"
      );
      formattedText = formattedText.replace(/`(.*?)`/g, "<code>$1</code>");

      // Handle blockquotes (>)
      formattedText = formattedText.replace(
        /^&gt; (.*)$/gm,
        "<blockquote>$1</blockquote>"
      );

      // Handle links ([text](url))
      formattedText = formattedText.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      // Handle line breaks and paragraphs
      formattedText = formattedText
        .split("\n\n")
        .map((paragraph) => {
          // Skip if already wrapped in h2 tags
          if (paragraph.startsWith("<h2>") && paragraph.endsWith("</h2>")) {
            return paragraph;
          }
          // Wrap other paragraphs in p tags
          return `<p>${paragraph}</p>`;
        })
        .join("");

      // Then convert remaining single newlines to line breaks
      formattedText = formattedText.replace(/\n/g, "<br/>");

      return formattedText;
    } catch (error) {
      console.error("Error formatting text:", error);
      return text;
    }
  };

  return (
    <div className={`inline-block relative`}>
      <span
        dangerouslySetInnerHTML={{ __html: formatResponse(response) }}
        className={writing ? "mr-1" : ""}
      />
      {writing && (
        <span className="inline-block relative top-0 right-0 blinking-cursor">
          |
        </span>
      )}
    </div>
  );
};

export default ChatGPTFormatter;