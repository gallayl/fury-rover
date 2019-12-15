import { createComponent, Shade } from "@furystack/shades";
import { SessionService } from "../services/session";
import { Body } from "./body";
import { Header } from "./header";
import { Button } from "./common";

export const Layout = Shade({
  shadowDomName: "shade-app-layout",
  render: ({ injector }) => {
    return (
      <div
        id="Layout"
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          background: "#dedede",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, Helvetica, sans-serif",
          lineHeight: "1.6"
        }}
        className="eee"
      >
        <Header
          title="🌀 Multiverse"
          links={[
            {
              name: "FPV",
              url: "/"
            }
          ]}
        >
          <div style={{ flex: "1" }} />
          <Button
            value="Logout"
            style={{ marginRight: "2em", color: "white" }}
            onclick={() => {
              injector.getInstance(SessionService).logout();
            }}
          >
            Logout
          </Button>
        </Header>
        <Body />
      </div>
    );
  }
});
