import { Flex } from "@radix-ui/themes";
import {
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLink,
} from "react-icons/fa";
import moment from "moment";

type ShareableLinksProps = {
  event: {
    roomName: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime: string;
  };
};

const ShareableLinks: React.FC<ShareableLinksProps> = ({ event }) => {
  const { roomName, description, location, startTime, endTime } = event;

  // Format the date & time as a clock
  const formattedDate = moment(startTime).format("dddd, MMMM Do YYYY"); // Example: "Sunday, Feb 2, 2025"
  const formattedStartTime = moment(startTime).format("h:mm A"); // Example: "2:00 PM"
  const formattedEndTime = moment(endTime).format("h:mm A"); // Example: "3:00 PM"

  // Create a share message
  const message = `🌟 Join "${roomName}" 🌟
📍 Location: ${location}
📅 Date: ${formattedDate}
🕒 Time: ${formattedStartTime} - ${formattedEndTime}
📖 Description: ${description}

🔴 Watch Live: https://live.worldsamma.org/watch/${encodeURIComponent(
    roomName
  )}`;

  const encodedMessage = encodeURIComponent(message);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    alert("Event details copied to clipboard!");
  };

  return (
    <Flex
      gap="3"
      justify="center"
      align="center"
      className="border-accent-5 bg-accent-3 h-[50px] text-center"
    >
      <a
        href={`https://wa.me/?text=${encodedMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp size={20} />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=https://live.worldsamma.org/watch/${encodeURIComponent(
          roomName
        )}&quote=${encodedMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        aria-label="Share on Facebook"
      >
        <FaFacebook size={20} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500"
        aria-label="Share on Twitter"
      >
        <FaTwitter size={20} />
      </a>
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600"
        aria-label="Visit Instagram"
      >
        <FaInstagram size={20} />
      </a>
      <button
        onClick={handleCopy}
        className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
        aria-label="Copy Link"
      >
        <FaLink size={20} />
      </button>
    </Flex>
  );
};

export default ShareableLinks;
