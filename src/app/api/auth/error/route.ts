import NextAuth from "next-auth";
import authOptions from "../../../../lib/auth"; // ако не работи, използвай relative: "../../../lib/auth"

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
