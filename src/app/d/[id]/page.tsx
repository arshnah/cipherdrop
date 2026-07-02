import View from "@/components/View";

export default function DropPage({ params }: { params: { id: string } }) {
  return <View id={params.id} />;
}
