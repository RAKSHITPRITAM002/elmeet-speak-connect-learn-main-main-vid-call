import React from "react";

interface MeetingCardProps {
  title: string;
  description: string;
  meetingUrl?: string;
  imageUrl?: string;
}

const MeetingCard: React.FC<MeetingCardProps> = ({
  title,
  description,
  meetingUrl,
  imageUrl,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          {title}
        </h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <a
          href={meetingUrl || "#"}
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Join Meeting
        </a>
      </div>
    </div>
  );
};

export default MeetingCard;