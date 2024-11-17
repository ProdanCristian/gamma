import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string }
} & { searchParams: any }) {
  if (!searchParams.token) {
    return <div>Invalid or missing reset token</div>;
  }

  return (
    <div className="my-32 flex items-center justify-center">
      <ResetPasswordForm token={searchParams.token} />
    </div>
  );
}