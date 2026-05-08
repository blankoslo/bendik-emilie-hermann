import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Plan trip</Button>);
    expect(screen.getByRole("button", { name: "Plan trip" })).toBeInTheDocument();
  });

  it("applies the variant via data attribute", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "destructive");
  });

  it("fires onClick when clicked", async () => {
    const user = userEvent.setup();
    let clicked = 0;
    render(<Button onClick={() => clicked++}>Go</Button>);

    await user.click(screen.getByRole("button"));

    expect(clicked).toBe(1);
  });
});
