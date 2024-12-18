import { Flex } from "@radix-ui/themes";
import {
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLink,
} from "react-icons/fa";

type ShareableLinksProps = {
  roomName: string;
};

const ShareableLinks: React.FC<ShareableLinksProps> = ({ roomName }) => {
  const shareUrl = `https://live.worldsamma.org/watch/${roomName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  return (
    <Flex
      gap="3"
      justify="center"
      align="center"
      className="border-accent-5 bg-accent-3 h-[50px] text-center"
    >
      <a
        href={`https://wa.me/?text=Join%20this%20room%20${encodeURIComponent(
          shareUrl
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp size={20} />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        aria-label="Share on Facebook"
      >
        <FaFacebook size={20} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=Join%20this%20room&url=${encodeURIComponent(
          shareUrl
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500"
        aria-label="Share on Twitter"
      >
        <FaTwitter size={20} />
      </a>
      <a
        href="https://instagram.com" // Instagram does not allow direct sharing links
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
