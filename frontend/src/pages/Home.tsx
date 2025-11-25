import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getBooks, getMyBooks, createTradeAPI } from "../app/api";
import type { BookType } from "@/app/types";
import { useLogin } from "@/app/store";
import Book from "@/components/Book";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const Home = () => {
  const { page: pageParam } = useParams<{ page: string }>();
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookType[]>([]);
  const [myBooks, setMyBooks] = useState<BookType[]>([]);
  const [selectedMyBookId, setSelectedMyBookId] = useState<string>("");
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [bookForTrade, setBookForTrade] = useState<BookType | null>(null);
  const [page, setPage] = useState(Number(pageParam) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const isAuthenticated = useLogin((state) => state.isAuthenticated);

  useEffect(() => {
    setPage(Number(pageParam) || 1);
  }, [pageParam]);

  useEffect(() => {
    const fetchMyBooks = async () => {
      if (!isAuthenticated) {
        setMyBooks([]);
        setSelectedMyBookId("");
        return;
      }

      try {
        const data = await getMyBooks();
        setMyBooks(data);
        if (data.length > 0) {
          setSelectedMyBookId((prev) => prev || data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch my books:", err);
      }
    };

    fetchMyBooks();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!isAuthenticated) {
        setBooks([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getBooks(page, searchTerm);
        setBooks(data.data);
        setTotalPages(data.meta.lastPage || 1);
      } catch (err: any) {
        console.error("Failed to fetch books:", err);
        setError("Failed to fetch books");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, [isAuthenticated, page, searchTerm]);

  const handlePageClick = (num: number) => {
    setPage(num);
    navigate(`/page/${num}`);
  };

  const openTradeDialog = (book: BookType) => {
    if (!isAuthenticated) {
      toast("Будь ласка, увійдіть, щоб обмінюватися книгами");
      return;
    }

    setBookForTrade(book);
    setTradeDialogOpen(true);
  };

  const handleConfirmTrade = async () => {
    if (!bookForTrade || !selectedMyBookId) {
      toast("Оберіть вашу книгу для обміну");
      return;
    }

    try {
      await createTradeAPI(bookForTrade.author.id, selectedMyBookId, bookForTrade.id);
      toast("Запит на обмін надіслано");
      setTradeDialogOpen(false);
      setBookForTrade(null);
    } catch (err) {
      console.error("Failed to create trade:", err);
      toast("Не вдалося створити обмін");
    }
  };

  // Динамічні сторінки (page-2 … page+2)
  const renderPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        pages.push(i);
      } else if (
        (i === 2 && page - delta > 2) ||
        (i === totalPages - 1 && page + delta < totalPages - 1)
      ) {
        pages.push("ellipsis");
      }
    }

    return pages.map((num, idx) =>
      num === "ellipsis" ? (
        <PaginationItem key={`ellipsis-${idx}`}>
          <PaginationEllipsis />
        </PaginationItem>
      ) : (
        <PaginationItem key={num}>
          <PaginationLink
            href="#"
            isActive={num === page}
            onClick={() => handlePageClick(num)}
          >
            {num}
          </PaginationLink>
        </PaginationItem>
      )
    );
  };

  return (
    <div>
      <Header onSearch={setSearchTerm} />
      <main className="container bg-background p-4 text-foreground flex flex-col items-center gap-4">
        {isLoading && <p>Loading books...</p>}
        {!isLoading && error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && books && books.length > 0 ? (
          <ul className="flex flex-wrap gap-4 w-full justify-center items-center">
            {books.map((book) => (
              <Book
                key={book.id}
                book={book}
                action={
                  isAuthenticated ? (
                    <Button className="w-full" size="sm" onClick={() => openTradeDialog(book)}>
                      Обміняти
                    </Button>
                  ) : undefined
                }
              />
            ))}
          </ul>
        ) : (
          !isLoading && !error && <p>No books available</p>
        )}

        {/* Пагінація shadcn */}
        <Pagination>
          <PaginationContent className="mt-4">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => page > 1 && handlePageClick(page - 1)}
              >
                Prev
              </PaginationPrevious>
            </PaginationItem>

            {renderPageNumbers()}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => page < totalPages && handlePageClick(page + 1)}
              >
                Next
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <Dialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Оберіть вашу книгу для обміну</DialogTitle>
            </DialogHeader>
            {myBooks.length === 0 ? (
              <p>У вас немає книг для обміну.</p>
            ) : (
              <div className="space-y-4">
                <select
                  className="border rounded px-2 py-1 w-full bg-background"
                  value={selectedMyBookId}
                  onChange={(e) => setSelectedMyBookId(e.target.value)}
                >
                  {myBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <Button className="w-full" onClick={handleConfirmTrade}>
                  Підтвердити обмін
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Home;
