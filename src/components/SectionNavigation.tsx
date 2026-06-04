import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type NavigationSection = {
  label: string
  ref: React.RefObject<HTMLElement | null>
}

type Props = {
  sections: NavigationSection[]
}

export default function SectionNavigation({
  sections,
}: Props) {
  const handleScroll = (
    ref: React.RefObject<HTMLElement | null>,
  ) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  return (
    <div className="flex justify-end w-full">
      <Card className="bg-[var(--accent-bg)] py-1 px-1">
        <CardContent className="flex flex-wrap gap-2 p-1">
          {sections.map((section) => (
            <Button
              key={section.label}
              size="sm"
              variant="outline"
              onClick={() => handleScroll(section.ref)}
            >
              {section.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}