import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import SignUpForm from "@/components/auth/SignUpForm";
import Container from "@/components/Container";
import GlobeOrbit from "@/components/GlobeOrbit";

export const metadata: Metadata = {
  title: "Create your account | FareLocker",
};

/** /signup: the globe on the left, the form on the right. */
export default function SignUpPage() {
  return (
    <>
      <AuthHeader prompt="Already have an account?" href="/login" action="Log in" />
      {/* Tall enough to fill the first screen under the header. */}
      <main className="flex flex-1 lg:min-h-[max(40rem,calc(100svh-5.6rem))]">
        <Container className="flex items-stretch gap-8 py-12">
          {/*
           * The globe fills this box and sizes itself to it. Below `md` there
           * is no room beside the card, so the box, and the globe, are gone.
           */}
          <div className="relative hidden min-w-0 flex-1 md:block">
            <GlobeOrbit />
          </div>
          <div className="flex w-full items-center justify-center md:w-auto md:shrink-0 md:basis-[440px] md:justify-end">
            <AuthCard
              title="Create your account"
              intro="An account keeps your locked fares in one place."
            >
              <SignUpForm />
            </AuthCard>
          </div>
        </Container>
      </main>
    </>
  );
}
