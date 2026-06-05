"use client";

import { RegistrationForm } from "@/components/registration/RegistrationForm";
import { registerTeacher } from "../actions";

export const dynamic = "force-dynamic";


export default function TeacherRegisterPage() {
  return (
    <div className="container-page py-12 max-w-2xl mx-auto">
      <RegistrationForm role="teacher" action={registerTeacher} fields={[]} />
    </div>
  );
}
