"use client";

import { useActionState, useState } from "react";
import { saveSitePhotos } from "@/lib/actions/admin";
import { initialActionState } from "@/lib/types";
import { sitePhotoGroups, sitePhotoSlots, type SitePhotoKey } from "@/lib/site-photo-slots";
import { FormFeedback, SaveButton } from "./form-ui";
import { ImageUpload } from "./image-upload";

export function SitePhotosForm({ overrides, defaults }: { overrides: Partial<Record<SitePhotoKey, string>>; defaults: Record<SitePhotoKey, string> }) {
  const [state, action] = useActionState(saveSitePhotos, initialActionState);
  const [values, setValues] = useState(() => Object.fromEntries(sitePhotoSlots.map(slot => [slot.key, overrides[slot.key] ?? ""])) as Record<SitePhotoKey, string>);
  const [busy, setBusy] = useState<Partial<Record<SitePhotoKey, boolean>>>({});
  return <form action={action} className="a-form" onReset={(event) => event.preventDefault()}>
    <div className="a-photo-groups">
      {sitePhotoGroups.map(group => <section key={group.key} className="a-panel">
        <div className="a-panel-heading"><h2>{group.title}</h2></div>
        <div className="a-photo-grid">
          {sitePhotoSlots.filter(slot => slot.group === group.key).map(slot => <div key={slot.key} className="a-photo-slot">
            <ImageUpload name={slot.key} label={slot.label} value={values[slot.key]} fallbackSrc={defaults[slot.key]}
              onChange={url => setValues(current => ({ ...current, [slot.key]: url }))}
              onBusyChange={value => setBusy(current => ({ ...current, [slot.key]: value }))} />
            <p className="a-photo-size"><span>საუკეთესო ზომა:</span><strong>{slot.size} პიქსელი</strong><span>({slot.shape})</span></p>
            <p className="a-photo-where">{slot.where}</p>
          </div>)}
        </div>
      </section>)}
    </div>
    <FormFeedback state={state} />
    <div className="a-form-footer"><p>ცარიელი ველი (ნაგვის ურნის ღილაკი) საიტზე ნაგულისხმევ ფოტოს დააბრუნებს.</p><SaveButton disabled={Object.values(busy).some(Boolean)} /></div>
  </form>;
}
