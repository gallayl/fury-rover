import { createComponent, Shade } from "@furystack/shades";
import { Body } from "./body";
import { Header } from "./header";

export const Layout = Shade({
  shadowDomName: "shade-app-layout",
  render: () => {
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
          title="🦇 Shades Demo"
          links={[{ name: "👀 FPV", url: "/fpv" }]}
        />
        <Body />
      </div>
    );
  }
});
