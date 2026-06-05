import { Button } from "@/components/ui/button"

type Props = {
  pages: number
  currentPage?: number
  onPageSelect: (page: number) => void
}

export default function PageSelector({
  pages,
  currentPage = 1,
  onPageSelect,
}: Props) {

  const buildPages = () => {

    if (pages <= 10) {
      return Array.from(
        { length: pages },
        (_, i) => i + 1,
      )
    }

    return [
      1,
      2,
      3,
      "...",
      pages - 2,
      pages - 1,
      pages,
    ]
  }

  const visiblePages = buildPages()

  return (
    <div className="flex items-center gap-2">

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() =>
          onPageSelect(currentPage - 1)
        }
      >
        {"<"}
      </Button>

      {visiblePages.map((item, index) => {

        if (item === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          )
        }

        return (
          <Button
            key={item}
            size="sm"
            variant={
              currentPage === item
                ? "default"
                : "outline"
            }
            onClick={() =>
              onPageSelect(item as number)
            }
          >
            {item}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === pages}
        onClick={() =>
          onPageSelect(currentPage + 1)
        }
      >
        {">"}
      </Button>

    </div>
  )
}