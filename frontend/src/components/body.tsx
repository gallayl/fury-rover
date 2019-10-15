import { createComponent, Router, Shade, LazyLoad } from "@furystack/shades";
import { HomePage } from "../pages/home";

export const Body = Shade({
  shadowDomName: "shade-app-body",
  render: () => {
    return (
      <div
        id="Body"
        style={{
          margin: "10px",
          padding: "10px",
          position: "fixed",
          top: "40px",
          width: "calc(100% - 40px)",
          height: "100%",
          overflow: "hidden"
        }}
      >
        <Router
          routeMatcher={(current, component) => current.pathname === component}
          routes={[
            { url: "/", component: () => <HomePage /> },
            {
              url: "/fpv",
              component: () => (
                <LazyLoad
                  loader={<div>Loading...</div>}
                  component={async () => {
                    const fpvModule = await import("../pages/fpv");
                    return <fpvModule.FirstPersonView />;
                  }}
                />
              )
            }
          ]}
        />
      </div>
    );
  }
});
