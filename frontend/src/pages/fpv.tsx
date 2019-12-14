import { Shade, createComponent } from "@furystack/shades";
import { JoystickOutputData } from "nipplejs";
import { NippleComponent } from "../components/nipple";
import { Motors } from "../odata/entity-collections";

export interface FirstPersonViewState {
  data?: JoystickOutputData;
  lastSentData?: JoystickOutputData;
}

const VECTOR_MULTIPLIER = 0.65;

export const FirstPersonView = Shade<any, FirstPersonViewState>({
  shadowDomName: "shade-first-person-view",
  initialState: {},
  constructed: async ({ getState, updateState, injector }) => {
    const interval = setInterval(() => {
      const currentState = getState();
      if (currentState.lastSentData !== currentState.data) {
        if (currentState.data) {
          const vectorX =
            currentState.data.vector && currentState.data.vector.x;
          const vectorY =
            currentState.data.vector && currentState.data.vector.y;
          const leftThrottle =
            VECTOR_MULTIPLIER * vectorY - VECTOR_MULTIPLIER * vectorX || 0;
          const rightThrottle =
            VECTOR_MULTIPLIER * vectorY + VECTOR_MULTIPLIER * vectorX || 0;
          updateState({ lastSentData: currentState.data }, true);
          injector
            .getInstance(Motors)
            .set4([leftThrottle, leftThrottle, rightThrottle, rightThrottle]);
        }
      }
    }, 100);
    return () => {
      clearInterval(interval);
    };
  },
  render: ({ getState, updateState, injector }) => {
    return (
      <div
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        <h3>First Person View</h3>
        <NippleComponent
          managerOptions={{}}
          onMove={(_e, data) => {
            updateState({ data }, true);
          }}
          onEnd={() => {
            injector.getInstance(Motors).stopAll();
            const newData = { ...getState().data, vector: { x: 0, y: 0 } };
            updateState({ data: newData }, true);
          }}
        >
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
