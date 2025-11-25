import LoginDialog from "./LoginDialog";
import RegisterDialog from "./RegisterDialog";
import Search from "./Search";
import ProfileIcon from "./ProfileIcon";
import { Link } from "react-router-dom";
import { useLogin } from "@/app/store";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
    const isAuthenticated = useLogin(state => state.isAuthenticated)

    return (
        <header className="bg-sidebar">
            <div className="container flex justify-between items-center p-4">
                <Link to="/" className="text-foreground text-lg font-semibold">BookExchange</Link>
                <Search onSearch={onSearch} />
                <div className="flex gap-2">
                    {isAuthenticated ? (
                        <ProfileIcon />
                    ) : (
                        <>
                            <LoginDialog />
                            <RegisterDialog />
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;