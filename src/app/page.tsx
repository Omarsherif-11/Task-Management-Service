'use client'
import { LandingPage } from "@/components/landing-page";
import { useRouter } from "next/navigation";
import { useAuth } from "react-oidc-context";
export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    router.push('/dashboard');
  }
  return <LandingPage />;
}
