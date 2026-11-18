import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, expect, test, vi } from "vitest";

import { Label } from "@/components/ui/label";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select";

afterEach(() => {
  cleanup();
});

const options: SearchableSelectOption[] = [
  { label: "Dr. Abdul Hasan", value: "doctor-1" },
  { label: "Dr. Amelia Rahman", value: "doctor-2" },
  { label: "Dr. Ayesha Ali", value: "doctor-3" },
];

function Harness({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <>
      <Label htmlFor="doctor">Doctor</Label>
      <SearchableSelect
        anyLabel="Any"
        emptyLabel="No doctors match"
        id="doctor"
        onValueChange={(next) => {
          setValue(next);
          onChange(next);
        }}
        options={options}
        searchLabel="Search doctors"
        searchPlaceholder="Search by name"
        value={value}
      />
    </>
  );
}

function renderSelect() {
  const onChange = vi.fn();
  render(<Harness onChange={onChange} />);
  return { onChange };
}

const sharedNameOptions: SearchableSelectOption[] = [
  {
    label: "Dr. Abdul Hasan",
    value: "doctor-4",
    description: "Cardiology · Square Hospital, Dhaka",
  },
  {
    label: "Dr. Abdul Hasan",
    value: "doctor-5",
    description: "Neurology · United Hospital, Gulshan",
  },
];

function SharedNameHarness() {
  const [value, setValue] = useState("");

  return (
    <>
      <Label htmlFor="shared-doctor">Doctor</Label>
      <SearchableSelect
        anyLabel="Any"
        id="shared-doctor"
        onValueChange={setValue}
        options={sharedNameOptions}
        searchLabel="Search doctors"
        searchPlaceholder="Search by name"
        value={value}
      />
    </>
  );
}

test("keeps long lists searchable from a box inside the popup", async () => {
  const user = userEvent.setup();
  renderSelect();

  await user.click(screen.getByRole("combobox", { name: "Doctor" }));
  await user.type(await screen.findByRole("combobox", { name: "Search doctors" }), "amelia");

  const labels = (await screen.findAllByRole("option")).map((option) => option.textContent);
  expect(labels).toEqual(["Dr. Amelia Rahman"]);
});

test("reports the value of a clicked result", async () => {
  const user = userEvent.setup();
  const { onChange } = renderSelect();

  await user.click(screen.getByRole("combobox", { name: "Doctor" }));
  await user.click(await screen.findByRole("option", { name: "Dr. Ayesha Ali" }));

  expect(onChange).toHaveBeenCalledWith("doctor-3");
});

test("selects the first match when the query is confirmed with enter", async () => {
  const user = userEvent.setup();
  const { onChange } = renderSelect();

  await user.click(screen.getByRole("combobox", { name: "Doctor" }));
  await user.type(await screen.findByRole("combobox", { name: "Search doctors" }), "abdul{Enter}");

  expect(onChange).toHaveBeenCalledWith("doctor-1");
});

test("says so when nothing matches the query", async () => {
  const user = userEvent.setup();
  renderSelect();

  await user.click(screen.getByRole("combobox", { name: "Doctor" }));
  await user.type(await screen.findByRole("combobox", { name: "Search doctors" }), "zzz");

  expect(await screen.findByText("No doctors match")).toBeDefined();
  expect(screen.queryAllByRole("option")).toHaveLength(0);
});

test("clears the filter through the Any option", async () => {
  const user = userEvent.setup();
  const { onChange } = renderSelect();

  await user.click(screen.getByRole("combobox", { name: "Doctor" }));
  await user.click(await screen.findByRole("option", { name: "Dr. Ayesha Ali" }));
  await user.click(screen.getByRole("combobox", { name: "Doctor" }));
  await user.click(await screen.findByRole("option", { name: "Any" }));

  expect(onChange).toHaveBeenLastCalledWith("");
});

test("drops the query once the popup closes", async () => {
  const user = userEvent.setup();
  renderSelect();

  await user.click(screen.getByRole("combobox", { name: "Doctor" }));
  await user.type(await screen.findByRole("combobox", { name: "Search doctors" }), "amelia");
  await user.keyboard("{Escape}");

  await waitFor(() => {
    expect(screen.queryByRole("combobox", { name: "Search doctors" })).toBeNull();
  });

  await user.click(screen.getByRole("combobox", { name: "Doctor" }));

  const search = await screen.findByRole("combobox", { name: "Search doctors" });
  expect(search).toHaveProperty("value", "");
  expect(await screen.findAllByRole("option")).toHaveLength(options.length + 1);
});

test("tells same-named doctors apart with a detail line", async () => {
  const user = userEvent.setup();
  render(<SharedNameHarness />);

  await user.click(screen.getByRole("combobox", { name: "Doctor" }));

  const options = await screen.findAllByRole("option");
  expect(options.map((option) => option.textContent)).toEqual([
    "Any",
    "Dr. Abdul HasanCardiology · Square Hospital, Dhaka",
    "Dr. Abdul HasanNeurology · United Hospital, Gulshan",
  ]);
});

test("matches the detail line in the search box", async () => {
  const user = userEvent.setup();
  render(<SharedNameHarness />);

  await user.click(screen.getByRole("combobox", { name: "Doctor" }));
  await user.type(await screen.findByRole("combobox", { name: "Search doctors" }), "neurology");

  expect(await screen.findByRole("option", { name: /Neurology/ })).toBeDefined();
  expect(screen.queryByRole("option", { name: /Cardiology/ })).toBeNull();
});

test("shows the selected doctor's detail line in the trigger", async () => {
  const user = userEvent.setup();
  render(<SharedNameHarness />);

  await user.click(screen.getByRole("combobox", { name: "Doctor" }));
  await user.click(await screen.findByRole("option", { name: /Neurology/ }));

  expect(screen.getByRole("combobox", { name: "Doctor" }).textContent).toContain(
    "Dr. Abdul Hasan · Neurology · United Hospital, Gulshan",
  );
});
