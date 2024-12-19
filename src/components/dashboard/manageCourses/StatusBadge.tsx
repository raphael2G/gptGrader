import { Badge } from "@/components/ui/badge"


export function StatusBadge({ status }: { status: "graded" | "unreleased" | "released" | "closed" }) {
  const statusStyles = {
    unreleased: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    released: "bg-green-100 text-green-800 hover:bg-green-200",
    closed: "bg-gray-100 text-gray-800 hover:bg-gray-200", 
    graded: "bg-blue-100 text-blue-800 hover:bg-blue-200", 
  }

  return (
    <Badge className={`cursor-pointer ${statusStyles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

