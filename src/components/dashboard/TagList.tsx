import { Badge } from "@/components/ui/badge"

interface TagListProps {
  tags: string[]
  maxTags?: number
}

export function TagList({ tags, maxTags = 3 }: TagListProps) {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = tags.length - displayTags.length;

  return (
    <div className="flex flex-wrap gap-1">
      {displayTags.map(tag => (
        <Badge 
          key={tag} 
          variant="outline" 
          className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        >
          {tag}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge 
          variant="outline" 
          className="text-xs bg-gray-50 text-gray-600 border-gray-200"
        >
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}