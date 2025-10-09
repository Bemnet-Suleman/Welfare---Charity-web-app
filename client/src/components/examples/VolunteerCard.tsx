import { VolunteerCard } from '../VolunteerCard';

export default function VolunteerCardExample() {
  return (
    <div className="p-4 max-w-md">
      <VolunteerCard
        id="1"
        title="Food Distribution Coordinator"
        organization="Community Food Bank"
        description="Help coordinate and distribute food packages to families in need. Perfect for those with organizational skills and a heart for service."
        location="Addis Ababa, Ethiopia"
        timeCommitment="2-3 hours/week"
        skills={["Organization", "Communication", "Teamwork"]}
        volunteers={12}
        spotsLeft={3}
      />
    </div>
  );
}
