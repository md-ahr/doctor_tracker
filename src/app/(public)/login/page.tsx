import Image from "next/image";

import { LoginForm } from "@/features/auth/ui/login-form";

const clinicPhoto =
  "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1400&q=80";

export default function LoginPage() {
  return (
    <div className="fixed inset-0 overflow-auto bg-inset">
      <div className="flex min-h-full items-center justify-center px-4 py-6 min-[720px]:px-8 min-[720px]:py-10">
        <section className="grid w-full max-w-240 overflow-hidden rounded-[28px] bg-sheet shadow-(--shadow-overlay) min-[720px]:grid-cols-2">
          <aside className="relative min-h-80 min-[720px]:min-h-full">
            <Image
              alt=""
              className="object-cover object-left"
              fill
              priority
              sizes="(min-width: 720px) 480px, 100vw"
              src={clinicPhoto}
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/25 to-ink/10" />
            <div className="relative flex h-full flex-col justify-end px-7 py-8 text-paper min-[720px]:px-10 min-[720px]:py-12">
              <h1 className="max-w-[12ch] text-[40px] leading-[0.95] font-medium text-paper min-[720px]:text-[52px]">
                Keep the directory clear
              </h1>
              <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-paper/90">
                Doctors, patients, and the daily counts live in one place.
              </p>
            </div>
          </aside>
          <div className="flex items-center px-6 py-10 min-[720px]:px-12 min-[720px]:py-12">
            <LoginForm />
          </div>
        </section>
      </div>
    </div>
  );
}
