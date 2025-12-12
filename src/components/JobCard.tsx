import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface JobCardProps {
  imageUrl: string;
  title: string;
  pay: string;
  hasBonus?: boolean;
}

export function JobCard({ 
  imageUrl, 
  title, 
  pay, 
  hasBonus = false
}: JobCardProps) {

  return (
    <Card className="relative overflow-hidden rounded-xl shadow-lg cursor-grab active:cursor-grabbing">
      {/* Job Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
        {hasBonus && (
          <Badge className="absolute top-3 right-3 bg-accent text-white">
            +15%
          </Badge>
        )}
      </div>
      
      {/* Job Details */}
      <div className="p-4">
        <h3 className="font-heading font-900 text-lg text-text mb-2">
          {title}
        </h3>
        <div className="flex justify-between items-center">
          <span className="font-body font-500 text-body-16 text-text">
            {pay}
          </span>
          {hasBonus && (
            <span className="text-accent font-body font-500 text-sm">
              Bonus available
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

export default JobCard;