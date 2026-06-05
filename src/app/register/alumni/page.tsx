"use client";

import { RegistrationForm } from "@/components/registration/RegistrationForm";
import { registerAlumni } from "../actions";

export const dynamic = "force-dynamic";


export default function AlumniRegisterPage() {
  return (
    <div className="container-page py-12 max-w-2xl mx-auto">
      <RegistrationForm role="alumni" action={registerAlumni} fields={[]} />
    </div>
  );
}
