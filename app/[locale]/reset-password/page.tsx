import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  return (
    <div className="my-32 flex items-center justify-center">
      <ResetPasswordForm token={searchParams.token} />
    </div>
  );
}
