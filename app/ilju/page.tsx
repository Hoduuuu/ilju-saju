import IljuGallery from "@/components/ilju/IljuGallery";
import { ILJU_LIST } from "@/lib/ilju/data";

export const metadata = { title: "60일주 도감" };

export default function IljuPage() {
  return <IljuGallery entries={ILJU_LIST} />;
}
