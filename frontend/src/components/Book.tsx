import type { BookType } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileIcon from "./ProfileIcon";

const Book = ({ book }: { book: BookType }) => {
  return (
    <Card className="cursor-poiner w-full max-w-[300px] overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 gap-0">
      <CardHeader className="p-0">
        <div className="w-full h-[400px] bg-muted flex items-center justify-center">
          <img
            src={book.photo}
            alt={book.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </CardHeader>

      <CardContent className="p-2 space-y-4">
        
        {/* Назва книги */}
        <CardTitle className="text-lg font-semibold line-clamp-2">
          {book.name}
        </CardTitle>

        {/* Автор */}
        <div className="flex items-center gap-3 border-t pt-3">
          <ProfileIcon />

          <div className="leading-tight">
            <p className="text-sm font-medium">
              {book.author.username || "Unknown Author"}
            </p>
            <p className="text-xs text-muted-foreground">
              {book.author.email || "No email"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Book;
