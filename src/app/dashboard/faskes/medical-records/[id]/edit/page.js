import MedicalRecordWizard from "@/components/MedicalRecordWizard";

export default async function FaskesMedicalRecordEditPage({ params }) {
  const { id } = await params;
  return <MedicalRecordWizard recordId={id} />;
}