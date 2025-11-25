import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Book from "@/components/Book";
import TradesList from "@/components/TradesList";
import type { BookType, TradeType, TradeStatus, UserType } from "@/app/types";
import { useLogin } from "@/app/store";
import { getMyBooks, addBookAPI, getMyTrades, updateTradeStatusAPI, deleteBookAPI, getUserInfoAPI, updateProfileAPI } from "@/app/api";

// shadcn/ui компоненти
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
  const [myBooks, setMyBooks] = useState<BookType[]>([]);
  const [trades, setTrades] = useState<TradeType[]>([]);
  const [newBookName, setNewBookName] = useState("");
  const [newBookPhoto, setNewBookPhoto] = useState("");
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [isLoadingTrades, setIsLoadingTrades] = useState(false);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [tradesError, setTradesError] = useState<string | null>(null);
  const [booksSearch, setBooksSearch] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profileUsername, setProfileUsername] = useState<string>("");
  const [profileEmail, setProfileEmail] = useState<string>("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const isAuthenticated = useLogin(state => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const fetchBooks = async () => {
    try {
      if (!isAuthenticated) {
        setMyBooks([]);
        return;
      }

      setIsLoadingBooks(true);
      setBooksError(null);

      const books = await getMyBooks(booksSearch);
      setMyBooks(books);
    } catch (err) {
      console.error("Error fetching books:", err);
      setBooksError("Error fetching books");
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const fetchTrades = async () => {
    try {
      if (!isAuthenticated) {
        setTrades([]);
        return;
      }

      setIsLoadingTrades(true);
      setTradesError(null);

      const tradesData = await getMyTrades();
      setTrades(tradesData);
    } catch (err) {
      console.error("Error fetching trades:", err);
      setTradesError("Error fetching trades");
    } finally {
      setIsLoadingTrades(false);
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

  const handleTradeStatusChange = async (id: string, status: TradeStatus) => {
    try {
      await updateTradeStatusAPI(id, status);
      await fetchTrades();
    } catch (err) {
      console.error("Error updating trade status:", err);
    }
  };

  useEffect(() => {
    // у трейді використовується senderId/receiverId, тому тримаємо тут поточний userId
    // (isLoggedAPI вже перевіряє токен і повертає userId)
    import("@/app/api").then(({ isLoggedAPI }) => {
      isLoggedAPI().then((res) => {
        if (res.success && res.userId) {
          setCurrentUserId(res.userId);
          getUserInfoAPI(res.userId).then((user: UserType) => {
            setProfileUsername(user.username);
            setProfileEmail(user.email);
          });
        }
      });
    });

    fetchBooks();
    fetchTrades();
  }, [isAuthenticated, booksSearch]);

  const handleSaveProfile = async () => {
    if (!profileUsername || !profileEmail || !currentUserId) return;
    try {
      setIsSavingProfile(true);
      await updateProfileAPI(currentUserId, profileUsername, profileEmail);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <>
      <Header onSearch={setBooksSearch} />
      <div className="container p-4 space-y-6">
        <h1 className="text-3xl font-bold">Profile Page</h1>

        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Username"
              value={profileUsername}
              onChange={(e) => setProfileUsername(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
            />
            <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="whitespace-nowrap">
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

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
            {isLoadingBooks && <p>Loading books...</p>}
            {!isLoadingBooks && booksError && (
              <p className="text-red-500">{booksError}</p>
            )}
            {!isLoadingBooks && !booksError && myBooks.length === 0 ? (
              <p>No books yet.</p>
            ) : (
              myBooks.map((book) => (
                <Book
                  key={book.id}
                  book={book}
                  action={
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={async () => {
                        try {
                          await deleteBookAPI(book.id);
                          await fetchBooks();
                        } catch (err) {
                          console.error("Failed to delete book:", err);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  }
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Trades */}
        <Card>
          <CardHeader>
            <CardTitle>My Trades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <TradesList
              trades={trades}
              isLoading={isLoadingTrades}
              error={tradesError}
              currentUserId={currentUserId}
              onChangeStatus={handleTradeStatusChange}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Profile;
