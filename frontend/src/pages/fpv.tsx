import { Shade, createComponent } from "@furystack/shades";
import { NippleComponent } from "../components/nipple";

export const FirstPersonView = Shade({
  shadowDomName: "shade-first-person-view",
  render: () => {
    return (
      <div
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        <h3>First Person View</h3>
        <NippleComponent managerOptions={{}}>
          <img
            src="/"
            alt="alma"
            style={{
              width: "100%",
              height: "100%",
              background: "radial-gradient(rgba(0,0,0,0.5), transparent 50%)",
              display: "block",
              objectFit: "contain"
            }}
          />
        </NippleComponent>
      </div>
    );
  }
});
