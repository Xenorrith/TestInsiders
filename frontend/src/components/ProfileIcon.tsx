import { User2 } from "lucide-react";
import { Link } from "react-router-dom"

const ProfileIcon = () => {
    return (
        <Link to="/profile" className="cursor-pointer bg-input rounded-full p-2">
            <User2 className="w-5 h-5" />
        </Link>
    );
};

export default ProfileIcon;