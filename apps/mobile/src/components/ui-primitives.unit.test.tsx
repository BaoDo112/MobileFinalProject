import { fireEvent, render, screen } from "@testing-library/react-native";

import { EmptyStateBanner } from "./EmptyStateBanner";
import { ErrorRecoveryPanel } from "./ErrorRecoveryPanel";
import { StatusChip } from "./StatusChip";
import { StickyActionBar } from "./StickyActionBar";

describe("shared ui primitives", () => {
  it("renders the status chip label", () => {
    render(<StatusChip label="Session restored" tone="success" />);

    expect(screen.getByText("Session restored")).toBeOnTheScreen();
  });

  it("fires banner and recovery actions", () => {
    const onBannerAction = jest.fn();
    const onRetry = jest.fn();
    const onSecondary = jest.fn();

    render(
      <>
        <EmptyStateBanner
          title="No profile yet"
          description="Bootstrap data is still loading."
          actionLabel="Retry later"
          onAction={onBannerAction}
        />
        <ErrorRecoveryPanel
          description="A request failed."
          onRetry={onRetry}
          secondaryLabel="Sign out"
          onSecondaryAction={onSecondary}
        />
      </>
    );

    fireEvent.press(screen.getByText("Retry later"));
    fireEvent.press(screen.getByText("Try again"));
    fireEvent.press(screen.getByText("Sign out"));

    expect(onBannerAction).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  it("fires sticky action bar callbacks", () => {
    const onPrimaryPress = jest.fn();
    const onSecondaryPress = jest.fn();

    render(
      <StickyActionBar
        primaryLabel="Save"
        onPrimaryPress={onPrimaryPress}
        secondaryLabel="Cancel"
        onSecondaryPress={onSecondaryPress}
      />
    );

    fireEvent.press(screen.getByText("Save"));
    fireEvent.press(screen.getByText("Cancel"));

    expect(onPrimaryPress).toHaveBeenCalledTimes(1);
    expect(onSecondaryPress).toHaveBeenCalledTimes(1);
  });
});
