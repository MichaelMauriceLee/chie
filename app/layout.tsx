import { ReactNode } from "react";
import "./globals.css";

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Readonly<Props>) {
  return children;
}
