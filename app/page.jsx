"use client";
import { Box, Button, Stack, TextField } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello I'm the support assistant, how can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res?.body.getReader();
      const decoder = new TextDecoder();

      let result = "";

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }

        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage?.content + text,
            },
          ];
        });
        return reader.read().then(processText)
      });
    });
  };

  return (
    <Box
      width={"100vw"}
      height={"100vh"}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Stack
        direction={"column"}
        width={"500px"}
        height={"700px"}
        p={5}
        spacing={2}
        border={"1px solid black"}
      >
        <Stack
          flexGrow={1}
          direction={"column"}
          spacing={2}
          overflow={"auto"}
          maxHeight={"100%"}
        >
          {messages.map((message, i) => (
            <Box
              key={i}
              display={"flex"}
              justifyContent={
                message.role === "asssistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "primary.main"
                    : "secondary.main"
                }
                color={"white"}
                borderRadius={16}
                p={5}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={"row"} spacing={2}>
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            label="Message"
            fullWidth
          ></TextField>
          <Button onClick={sendMessage} variant="contained">
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
