interface BookType {
    id: string;
    name: string;
    photo: string;
    author: UserType;
}

enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
}
interface UserType {
    id: string;
    email: string;
    username: string;
    emailVerified: boolean;

    role: UserRole;
}

enum TradeStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

interface TradeType {
    id: string;
    status: TradeStatus;

    senderId: string;
    receiverId: string;

    senderBookId: string;
    receiverBookId: string;
}

export type { BookType, UserType, TradeType, UserRole, TradeStatus };