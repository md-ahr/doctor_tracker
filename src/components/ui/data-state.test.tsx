import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import {
  DataEmpty,
  DataError,
  DataLoading,
  DATA_LOADING_DELAY_MS,
} from "@/components/ui/data-state";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

test("a fast load shows nothing, then three quiet lines instead of a table", async () => {
  vi.useFakeTimers();
  const view = render(<DataLoading label="Loading doctors" />);

  expect(screen.queryByText("Loading doctors")).toBeNull();
  expect(screen.queryByRole("table")).toBeNull();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(DATA_LOADING_DELAY_MS);
  });

  const region = screen.getByText("Loading doctors").parentElement;
  expect(region?.getAttribute("aria-busy")).toBe("true");
  expect(region?.querySelectorAll("[data-loading-line]")).toHaveLength(3);
  expect(screen.queryByRole("table")).toBeNull();

  view.unmount();
});

test("empty copy is an explicit message", () => {
  render(
    <DataEmpty guidance="Add the first doctor to start the directory." title="No doctors yet" />,
  );

  expect(screen.getByText("No doctors yet")).toBeDefined();
  expect(screen.getByText("Add the first doctor to start the directory.")).toBeDefined();
  expect(screen.queryByRole("table")).toBeNull();
});

test("the error band offers try again", async () => {
  const onRetry = vi.fn();
  const user = userEvent.setup();
  render(<DataError message="The directory could not be loaded." onRetry={onRetry} />);

  expect(screen.getByRole("status").getAttribute("aria-live")).toBe("polite");
  await user.click(screen.getByRole("button", { name: "Try again" }));
  expect(onRetry).toHaveBeenCalledOnce();
});
