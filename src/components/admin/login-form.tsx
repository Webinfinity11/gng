"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { login } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/types";
import { Field, FormFeedback, SaveButton } from "./form-ui";

export function LoginForm() {
  const [state, action] = useActionState(login, initialActionState);
  const [visible, setVisible] = useState(false);
  return <form action={action} className="a-form" onReset={(event) => event.preventDefault()}>
    <Field label="ელფოსტა" name="email"><input id="email" name="email" type="email" autoComplete="username" required placeholder="name@company.ge" /></Field>
    <Field label="პაროლი" name="password"><div className="a-password"><input id="password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required minLength={8} maxLength={128} /><button type="button" className="a-icon-button" onClick={() => setVisible(!visible)} aria-label={visible ? "პაროლის დამალვა" : "პაროლის ჩვენება"}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>
    <FormFeedback state={state} />
    <SaveButton label="შესვლა" />
    <p className="a-login-note"><LockKeyhole size={15} aria-hidden="true" />შესვლა შესაძლებელია მხოლოდ ადმინისტრატორის ანგარიშით.</p>
  </form>;
}
