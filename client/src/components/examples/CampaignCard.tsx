import { CampaignCard } from '../CampaignCard';

export default function CampaignCardExample() {
  return (
    <div className="p-4 max-w-sm">
      <CampaignCard
        id="1"
        title="Education for Underprivileged Children in Rural Ethiopia"
        description="Help provide school supplies, books, and educational resources to 500 children who lack access to basic learning materials."
        image="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80"
        category="Education"
        goalAmount={50000}
        raisedAmount={42500}
        daysLeft={8}
        urgent={true}
      />
    </div>
  );
}
