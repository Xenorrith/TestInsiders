import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Book from "@/components/Book";
import type { BookType, TradeType } from "@/app/types";
import { useLogin } from "@/app/store";
import { getMyBooks, addBookAPI, getMyTrades } from "@/app/api";

// shadcn/ui компоненти
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
  const [myBooks, setMyBooks] = useState<BookType[]>([]);
  const [trades, setTrades] = useState<TradeType[]>([]);
  const [newBookName, setNewBookName] = useState("");
  const [newBookPhoto, setNewBookPhoto] = useState("");
  const isAuthenticated = useLogin(state => state.isAuthenticated);

  const fetchBooks = async () => {
    try {
      const books = await getMyBooks();
      setMyBooks(books);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  const fetchTrades = async () => {
    try {
      console.log("Fetching trades...");
      const tradesData = await getMyTrades();
      setTrades(tradesData);
    } catch (err) {
      console.error("Error fetching trades:", err);
    }
  };

  const addBook = async () => {
    if (!newBookName || !newBookPhoto) return;
    try {
      await addBookAPI(newBookName, newBookPhoto);
      await fetchBooks();
      setNewBookName("");
      setNewBookPhoto("");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchTrades();
  }, [isAuthenticated]);

  return (
    <>
      <Header />
      <div className="container p-4 space-y-6">
        <h1 className="text-3xl font-bold">Profile Page</h1>

        {/* Add Book */}
        <Card>
          <CardHeader>
            <CardTitle>Add a New Book</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Book name"
              value={newBookName}
              onChange={(e) => setNewBookName(e.target.value)}
            />
            <Input
              placeholder="Book photo URL"
              value={newBookPhoto}
              onChange={(e) => setNewBookPhoto(e.target.value)}
            />
            <Button onClick={addBook} className="whitespace-nowrap">
              Add Book
            </Button>
          </CardContent>
        </Card>

        {/* My Books */}
        <Card>
          <CardHeader>
            <CardTitle>My Books</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 items-center">
            {!myBooks ? (
              <p>No books yet.</p>
            ) : (
              myBooks.map((book) => <Book key={book.id} book={book} />)
            )}
          </CardContent>
        </Card>

        {/* Trades */}
        <Card>
          <CardHeader>
            <CardTitle>My Trades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!trades ? (
              <p>No trades yet.</p>
            ) : (
              trades.map((trade) => (
                <Card key={trade.id} className="bg-gray-50">
                  <CardContent>
                    <p>Status: {trade.status}</p>
                    <p>Sender Book ID: {trade.senderBookId}</p>
                    <p>Receiver Book ID: {trade.receiverBookId}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Profile;
