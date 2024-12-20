"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import {
  Flex,
  Card,
  Heading,
  Button,
  TextField,
  Text,
  Avatar,
  Box,
} from "@radix-ui/themes";
import { Spinner } from "@/components/spinner";
import { StreamPlayer } from "@/components/stream-player";
import { ReactionBar } from "@/components/reaction-bar";
import ShareableLinks from "@/components/shareable-links";
import { Chat } from "@/components/chat";
import { TokenContext } from "@/components/token-context";
import { ArrowRightIcon, PersonIcon } from "@radix-ui/react-icons";
import moment from "moment";

interface EventDetails {
  roomName: string;
  description?: string;
  location?: string;
  participants?: string[];
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  recurrenceRule?: string;
}

interface WatchPageProps {
  roomName: string;
  serverUrl: string;
}

export default function WatchPage({ roomName, serverUrl }: WatchPageProps) {
  const [name, setName] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [roomToken, setRoomToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [event, setEvent] = useState<EventDetails | null>(null);

  useEffect(() => {
    const fetchRoomSchedule = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/schedule/room?room=${roomName}`
        );
        if (!res.ok) throw new Error("Failed to fetch schedule.");

        const schedule: EventDetails = await res.json();
        setEvent(schedule);

        const now = new Date();
        const eventStart = new Date(schedule.startTime);
        const eventEnd = new Date(schedule.endTime);

        if (now >= eventStart && now <= eventEnd) {
          setIsLive(true);
        } else {
          setError("This stream has ended, expired, or does not exist.");
        }
      } catch (err) {
        setError("An error occurred while fetching the schedule.");
      }
    };

    fetchRoomSchedule();
  }, [roomName]);

  const onJoin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/join_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_name: roomName, identity: name }),
      });

      if (!res.ok) throw new Error("Failed to join the stream.");

      const { auth_token, connection_details } = await res.json();
      setAuthToken(auth_token);
      setRoomToken(connection_details.token);
    } catch (err) {
      setError("Unable to join the stream. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Flex align="center" justify="center" className="min-h-screen">
        <Card className="p-4 w-[400px]">
          <Heading size="4">Error</Heading>
          <Text mt="2">{error}</Text>
          <ShareableLinks roomName={roomName} />
        </Card>
      </Flex>
    );
  }

  if (!isLive) {
    return (
      <Flex align="center" justify="center" className="min-h-screen">
        <Card className="p-4 w-[400px]">
          <Heading size="4">{decodeURI(roomName)} Not Live</Heading>
          <Text mt="2">
            The stream is not live at the moment. Please check back later.
          </Text>
          {event && (
            <>
              <Text mt="2">
                Start: {moment(event.startTime).format("YYYY-MM-DD HH:mm")} |
                End: {moment(event.endTime).format("YYYY-MM-DD HH:mm")}
              </Text>
              {event.description && (
                <Text mt="2">Description: {event.description}</Text>
              )}
              {event.participants && event.participants.length > 0 && (
                <Text mt="2">
                  Participants: {event.participants.join(", ")}
                </Text>
              )}
            </>
          )}
          <ShareableLinks roomName={roomName} />
        </Card>
      </Flex>
    );
  }

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
                placeholder="Your Name"
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
                  Join Stream <ArrowRightIcon />
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
