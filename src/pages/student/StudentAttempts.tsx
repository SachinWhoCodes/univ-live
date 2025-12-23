import { attempts } from "@/mock/studentMock";
import { AttemptTable } from "@/components/student/AttemptTable";

export default function StudentAttempts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Attempts</h1>
        <p className="text-muted-foreground">Review all your test attempts and performance</p>
      </div>
      <AttemptTable attempts={attempts} />
    </div>
  );
}
