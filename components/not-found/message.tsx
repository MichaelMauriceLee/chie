import BackHomeButton from "./button";

type NotFoundMessageProps = {
  title: string;
  description: string;
  backHome: string;
};

export default function NotFoundMessage({
  title,
  description,
  backHome,
}: NotFoundMessageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h1 className="text-5xl font-bold text-gray-900">{title}</h1>
      <p className="mt-4 text-lg text-gray-600">{description}</p>
      <BackHomeButton label={backHome} />
    </div>
  );
}
