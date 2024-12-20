"use client";

import { HomeActions } from "@/components/home-actions";
import { Container, Flex, Separator, Text } from "@radix-ui/themes";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 sm:p-10 w-full">
      <Container size="1">
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="6"
          wrap="wrap"
          className="text-center"
        >
          <Image
            src="/download.svg"
            alt="LiveKit"
            width="180"
            height="180"
            className="invert dark:invert-0 mt-4"
          />
          <Text as="p" align="center">
            Welcome to World Samma Federation livestream. You can join or start
            your own stream.
          </Text>
          <HomeActions />
          <Separator orientation="horizontal" size="4" className="my-4" />
        </Flex>
      </Container>
    </main>
  );
}
