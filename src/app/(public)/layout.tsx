import { PublicHeader } from "./header";
import { PublicFooter } from "./footer";
import { UyeAuthProvider } from "@/contexts/uye-auth-context";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site">
      <UyeAuthProvider>
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </UyeAuthProvider>
    </div>
  );
}
