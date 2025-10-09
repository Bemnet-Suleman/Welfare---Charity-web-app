import { StoryCard } from '../StoryCard';

export default function StoryCardExample() {
  return (
    <div className="p-4 max-w-md">
      <StoryCard
        id="1"
        quote="Thanks to the donors, my daughter can now attend school. She dreams of becoming a doctor, and this support has made that dream possible. We are forever grateful."
        author={{
          name: "Aisha Mohammed",
          role: "Beneficiary, Education Program",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha"
        }}
        category="Education Impact"
        image="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80"
      />
    </div>
  );
}
