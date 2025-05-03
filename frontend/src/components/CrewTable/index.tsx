import { CrewMemberData } from "@types";

export default function CrewTable({ data }: { data: CrewMemberData[] }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Экипаж</h2>
      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Height</th>
            <th className="p-2 border">Weight</th>
            <th className="p-2 border">Allergies</th>
          </tr>
        </thead>
        <tbody>
          {data.map((member) => (
            <tr key={member.id}>
              <td className="p-2 border">{member.name}</td>
              <td className="p-2 border">{member.height}</td>
              <td className="p-2 border">{member.weight}</td>
              <td className="p-2 border">{member.allergies || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
