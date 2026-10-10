import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import LogInForm from "@/components/auth/LogInForm";

export const metadata: Metadata = {
  title: "Log in | FareLocker",
};

/** /login: the form on its own, in the middle of the starry page. */
export default function LogInPage() {
  return (
    <>
      <AuthHeader
        prompt="Don't have an account?"
        href="/signup"
        action="Create account"
      />
      {/* Tall enough to fill the first screen under the header. */}
      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:min-h-[max(40rem,calc(100svh-5.6rem))]">
        <AuthCard title="Log in" intro="See your locks and what they are worth.">
          <LogInForm />
        </AuthCard>
      </main>
    </>
  );
}
