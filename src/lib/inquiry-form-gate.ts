export const OPEN_INQUIRY_FORM_EVENT = "ibirdchef-open-inquiry-form";

export function openInquiryFormSection(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("inquiry", "open");
  url.hash = "contact";
  window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}#contact`);
  window.dispatchEvent(new Event(OPEN_INQUIRY_FORM_EVENT));
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}
