"use client";

import { Chat } from "@/components/chat";
import { ReactionBar } from "@/components/reaction-bar";
import ShareableLinks from "@/components/shareable-links";
import { Spinner } from "@/components/spinner";
import { StreamPlayer } from "@/components/stream-player";
import { TokenContext } from "@/components/token-context";
import { JoinStreamResponse } from "@/lib/controller";
import { cn } from "@/lib/utils";
import { LiveKitRoom } from "@livekit/components-react";
import { ArrowRightIcon, PersonIcon } from "@radix-ui/react-icons";
import {
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";

interface props {
  roomName: String | undefined;
  event: String | undefined;
}

export default function WatchPage({
  roomName,
  serverUrl,
}: {
  roomName: string;
  serverUrl: string;
}) {
  const [name, setName] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [roomToken, setRoomToken] = useState("");
  const [loading, setLoading] = useState(false);
  // https://yourdomain.com/watch/[roomName]

  const [streamDetails, setStreamDetails] = useState(null);
  const [error, setError] = useState("");

  const fetchRoomSchedule = async (roomName) => {
    const response = await fetch(`/api/schedule?room=${roomName}`);
    const schedule = await response.json();
    return schedule;
  };

  useEffect(() => {
    fetchRoomSchedule(roomName).then((schedule) => {
      const now = new Date();
      const isLive = schedule.some(
        (event) =>
          now >= new Date(event.StartTime) && now <= new Date(event.EndTime)
      );
      if (!isLive) {
        alert("This room is not currently live.");
      }
    });
  }, [roomName]);

  useEffect(() => {
    // Fetch stream details from the API
    const fetchStreamDetails = async () => {
      const res = await fetch(`/api/schedule/${roomName}`);
      const data = await res.json();
      setStreamDetails(data);
      const currentTime = new Date();
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);

      if (currentTime < startTime || currentTime > endTime) {
        setError("This stream is not live at the moment.");
      }
    };
    fetchStreamDetails();
  }, [roomName]);

  if (error) {
    return <div>{error}</div>;
  }

  const onJoin = async () => {
    setLoading(true);
    const res = await fetch("/api/join_stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_name: roomName,
        identity: name,
      }),
    });
    const {
      auth_token,
      connection_details: { token },
    } = (await res.json()) as JoinStreamResponse;

    setAuthToken(auth_token);
    setRoomToken(token);
  };

  if (!authToken || !roomToken) {
    return (
      <Flex align="center" justify="center" className="min-h-screen">
        <Card className="p-3 w-[380px]">
          <Heading size="4" className="mb-4">
            Entering {decodeURI(roomName)}
          </Heading>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Your name
            </Text>
            <TextField.Root>
              <TextField.Slot>
                <Avatar
                  size="1"
                  radius="full"
                  fallback={name ? name[0] : <PersonIcon />}
                />
              </TextField.Slot>
              <TextField.Input
                placeholder="Roger Dunn"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </TextField.Root>
          </label>
          <Flex gap="3" mt="6" justify="end">
            <Button disabled={!name || loading} onClick={onJoin}>
              {loading ? (
                <Flex gap="2" align="center">
                  <Spinner />
                  <Text>Joining...</Text>
                </Flex>
              ) : (
                <>
                  Join as viewer{" "}
                  <ArrowRightIcon className={cn(name && "animate-wiggle")} />
                </>
              )}
            </Button>
          </Flex>
        </Card>
      </Flex>
    );
  }

  return (
    <TokenContext.Provider value={authToken}>
      <LiveKitRoom serverUrl={serverUrl} token={roomToken}>
        <Flex className="w-full h-screen">
          <Flex direction="column" className="flex-1">
            <Box className="flex-1 bg-gray-1">
              <StreamPlayer />
            </Box>
            <ReactionBar />
            <ShareableLinks roomName={roomName} />
          </Flex>
          <Box className="bg-accent-2 min-w-[280px] border-l border-accent-5">
            <Chat />
          </Box>
        </Flex>
      </LiveKitRoom>
    </TokenContext.Provider>
  );
}
