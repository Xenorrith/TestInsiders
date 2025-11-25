import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getBooks } from "../app/api";
import type { BookType } from "@/app/types";
import { useLogin } from "@/app/store";
import Book from "@/components/Book";
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
  const [page, setPage] = useState(Number(pageParam) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const isAuthenticated = useLogin((state) => state.isAuthenticated);

  useEffect(() => {
    setPage(Number(pageParam) || 1);
  }, [pageParam]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getBooks(page);
        setBooks(data.data);
        setTotalPages(data.meta.lastPage || 1);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      }
    };
    fetchBooks();
  }, [isAuthenticated, page]);

  const handlePageClick = (num: number) => {
    setPage(num);
    navigate(`/page/${num}`);
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
      <Header />
      <main className="container bg-background p-4 text-foreground flex flex-col items-center gap-4">
        {books && books.length > 0 ? (
          <ul className="flex flex-wrap gap-4 w-full justify-center items-center">
            {books.map((book) => (
              <Book key={book.id} book={book} />
            ))}
          </ul>
        ) : (
          <p>No books available</p>
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
      </main>
    </div>
  );
};

export default Home;
