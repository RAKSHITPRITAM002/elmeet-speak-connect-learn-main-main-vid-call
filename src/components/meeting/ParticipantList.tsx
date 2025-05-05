import React from "react";

interface Participant {
  id: number;
  name: string;
  connected: boolean;
}

interface ParticipantListProps {
  participants: Participant[];
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants }) => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl mb-2">Participants</h2>
      <ul className="space-y-2">
        {participants.map((participant) => (
          <li key={participant.id} className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-full ${
                participant.connected ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span>{participant.name}</span>
            <span className="text-sm text-gray-500">
              {participant.connected ? "Online" : "Offline"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ParticipantList;