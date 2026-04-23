import Auth from "@/components/Auth";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const isSignup = params.mode === "signup";
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Auth key={params.mode || "login"} isLogin={isSignup} />
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
          >
            Back to Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
