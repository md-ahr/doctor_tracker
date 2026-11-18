import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import DoctorDetailPage from "./page";

const notFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);

vi.mock("next/navigation", () => ({ notFound }));

vi.mock("@/features/doctors/ui/doctor-detail-screen", () => ({
  DoctorDetailScreen: ({ doctorId }: { doctorId: string }) => <p>Doctor {doctorId}</p>,
}));

const recordId = "65f1c0a2b4d9e81f2a3c4d5e";

afterEach(() => {
  cleanup();
  notFound.mockClear();
});

test("a malformed doctor id renders the not-found boundary before any request", async () => {
  await expect(
    DoctorDetailPage({ params: Promise.resolve({ doctorId: "gafk-94fd73d15dc04370189dfg" }) }),
  ).rejects.toThrow("NEXT_NOT_FOUND");

  expect(notFound).toHaveBeenCalledOnce();
});

test("a well-formed id open the doctor screen", async () => {
  render(await DoctorDetailPage({ params: Promise.resolve({ doctorId: recordId }) }));

  expect(notFound).not.toHaveBeenCalled();
  expect(screen.getByText(`Doctor ${recordId}`)).toBeDefined();
});
