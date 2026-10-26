"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProject } from "@/lib/actions/admin";
import { initialActionState, type Project, type ProjectCategory } from "@/lib/types";
import { Field, FormFeedback, SaveButton } from "./form-ui";
import { GalleryUpload, ImageUpload } from "./image-upload";

export function ProjectForm({ project, categories }: { project?: Project; categories: ProjectCategory[] }) {
  const [state, action] = useActionState(saveProject, initialActionState);
  const [cover, setCover] = useState(project?.cover_url || "");
  const [images, setImages] = useState(project?.images || []);
  const [coverBusy, setCoverBusy] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  return <form action={action} className="a-form" onReset={(event) => event.preventDefault()}>
    <input type="hidden" name="id" value={project?.id || ""} />
    <div className="a-editor-grid">
      <div className="a-form-stack">
        <section className="a-panel">
          <div className="a-panel-heading"><h2>სათაური</h2><p>გამოჩნდება პროექტის ბარათსა და გვერდზე.</p></div>
          <div className="a-form-stack">
            <Field name="title" label="პროექტის სათაური"><input id="title" name="title" defaultValue={project?.title} maxLength={200} required placeholder="მაგ. ხედი - სასტუმრო" /></Field>
            <Field name="title_en" label="სათაური ინგლისურად" hint="საიტის ინგლისური ვერსიისთვის. თუ ცარიელია, ქართული სათაური გამოჩნდება."><input id="title_en" name="title_en" defaultValue={project?.title_en} maxLength={200} lang="en" placeholder="e.g. Khedi - Hotel" aria-describedby="title_en-hint" /></Field>
          </div>
        </section>
        <section className="a-panel">
          <div className="a-panel-heading"><h2>გალერეის ფოტოები</h2><p>გამოჩნდება პროექტის გვერდზე, მთავარი ფოტოს შემდეგ. შეგიძლიათ რამდენიმე ფოტო ერთად აირჩიოთ.</p></div>
          <GalleryUpload value={images} onChange={setImages} onBusyChange={setGalleryBusy} />
        </section>
      </div>
      <div className="a-form-stack">
        <section className="a-panel">
          <div className="a-panel-heading"><h2>მთავარი ფოტო</h2><p>პროექტის ბარათის ფოტო მთავარ გვერდსა და პროექტების სიაში.</p></div>
          <ImageUpload name="cover_url" label="მთავარი ფოტო" value={cover} onChange={setCover} onBusyChange={setCoverBusy} />
        </section>
        <section className="a-panel">
          <div className="a-panel-heading"><h2>კატეგორია</h2><p>პროექტების გვერდზე ვიზიტორები კატეგორიით გაფილტრავენ.</p></div>
          <Field name="category_id" label="პროექტის კატეგორია"><select id="category_id" name="category_id" defaultValue={project?.category_id ?? ""}><option value="">კატეგორიის გარეშე</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
          <Link className="a-text-link a-category-manage" href="/admin/categories">კატეგორიების მართვა</Link>
        </section>
      </div>
    </div>
    <FormFeedback state={state} />
    <div className="a-form-footer"><Link className="a-button secondary" href="/admin/projects">გაუქმება</Link><SaveButton label={project ? "პროექტის შენახვა" : "პროექტის დამატება"} disabled={coverBusy || galleryBusy} /></div>
  </form>;
}
