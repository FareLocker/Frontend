import Form from "next/form";

export default function SearchForm() {
  return (
    <Form action="/search">
      <input name="Company" placeholder="Company" required />
      <input name="Flight Number" placeholder="Flight Number" required />
      <input name="Departure Date" placeholder="Date" required />
      <input name="Arrive Date" placeholder="Date" required />
      <input name="Departure Location" placeholder="Location" required />
      <input name="Arrive Location" placeholder="Location" required />
    </Form>
  );
}
