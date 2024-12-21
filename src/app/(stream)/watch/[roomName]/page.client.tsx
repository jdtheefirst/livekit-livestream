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
  isLive?: boolean | undefined;
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
  const [isLive, setIsLive] = useState<boolean | undefined>(undefined);
  const [event, setEvent] = useState<EventDetails | null>(null);

  useEffect(() => {
    const fetchRoomSchedule = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/schedule/room?room=${roomName}`
        );
        if (!res.ok) throw new Error("Room schedule not found.");

        const schedule: EventDetails = await res.json();
        setEvent(schedule);

        setIsLive(schedule.isLive);
      } catch (err) {
        setError(
          "We couldn't find the room schedule. Please check the room name or try again later."
        );
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

      if (!res.ok)
        throw new Error(
          "Unable to join stream. Invalid room or network issue."
        );

      const { auth_token, connection_details } = await res.json();
      setAuthToken(auth_token);
      setRoomToken(connection_details.token);
    } catch (err) {
      setError(
        "There was an issue joining the stream. Check your network or contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Flex align="center" justify="center" className="min-h-screen">
        <Card className="p-4 w-[400px]">
          <Heading size="4">Error</Heading>
          <Text mt="2" mb={"4"} align={"center"}>
            {error}
          </Text>
        </Card>
      </Flex>
    );
  }

  if (!isLive) {
    return (
      <Flex align="center" justify="center" className="min-h-screen bg-gray-50">
        <Card className="p-6 max-w-[450px] bg-white rounded-lg shadow-lg border border-gray-200">
          <Heading size="4" className="text-center mb-6 text-whitesmoke mb-4">
            {decodeURI(roomName)} Not Live
          </Heading>
          <Text size="3" className="text-center text-gray-600 mb-4">
            The stream is not live at the moment. Please check back later.
          </Text>

          {event && (
            <>
              <Box className="flex flex-col mb-4">
                <Text size="2" className="font-semibold text-gray-700">
                  Start:{" "}
                  <span className="font-normal text-gray-500">
                    {moment(event.startTime).isSame(new Date(), "day")
                      ? `Today at ${moment(event.startTime).format("HH:mm")}`
                      : moment(event.startTime).isSame(
                          moment().add(1, "days"),
                          "day"
                        )
                      ? `Tomorrow at ${moment(event.startTime).format("HH:mm")}`
                      : moment(event.startTime).isBefore(
                          moment().add(7, "days"),
                          "days"
                        )
                      ? moment(event.startTime).calendar()
                      : moment(event.startTime).format("YYYY-MM-DD HH:mm")}
                  </span>
                </Text>
                <Text size="2" className="font-semibold text-gray-700 mt-2">
                  End:{" "}
                  <span className="font-normal text-gray-500">
                    {moment(event.endTime).isSame(new Date(), "day")
                      ? `Today at ${moment(event.endTime).format("HH:mm")}`
                      : moment(event.endTime).isSame(
                          moment().add(1, "days"),
                          "day"
                        )
                      ? `Tomorrow at ${moment(event.endTime).format("HH:mm")}`
                      : moment(event.endTime).isBefore(
                          moment().add(7, "days"),
                          "days"
                        )
                      ? moment(event.endTime).calendar()
                      : moment(event.endTime).format("YYYY-MM-DD HH:mm")}
                  </span>
                </Text>
              </Box>

              {event.description && (
                <Text size="2" className="text-gray-600 mt-2">
                  <span className="font-semibold">Description:</span>{" "}
                  {event.description}
                </Text>
              )}

              {event.participants && event.participants.length > 0 && (
                <Text size="2" className="text-gray-600 mt-2 mb-6">
                  <span className="font-semibold">Participants:</span>{" "}
                  {event.participants.join(", ")}
                </Text>
              )}
            </>
          )}

          <Flex className="text-center mb-2 text-whitesmoke mt-2">Share:</Flex>
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
                required
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
