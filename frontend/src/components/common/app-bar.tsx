import { Shade, createComponent } from "@furystack/shades";

export const AppBar = Shade({
  shadowDomName: "shade-app-bar",
  constructed: ({ element }) => {
    const container = element.children[0] as HTMLElement;
    container.style.transition =
      "opacity .35s cubic-bezier(0.550, 0.085, 0.680, 0.530), padding .2s cubic-bezier(0.550, 0.085, 0.680, 0.530)";

    requestAnimationFrame(() => {
      container.style.padding = "8px 8px";
      container.style.opacity = "1";
    });
  },
  render: ({ children }) => {
    return (
      <div
        style={{
          width: "100%",
          background: "#222",
          color: "white",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          boxShadow: "0 0 3px rgba(0,0,0,0.6)",
          padding: "2px 8px",
          opacity: "0"
        }}
      >
        {children}
      </div>
    );
  }
});
