import { Shade, createComponent, PartialElement } from "@furystack/shades";
import {
  create,
  JoystickManagerOptions,
  EventData,
  JoystickOutputData
} from "nipplejs";

export interface NippleComponentProps {
  managerOptions: JoystickManagerOptions;
  style?: PartialElement<CSSStyleDeclaration>;
  onStart?: (evt: EventData, data: JoystickOutputData) => void;
  onEnd?: (evt: EventData, data: JoystickOutputData) => void;
  onDir?: (evt: EventData, data: JoystickOutputData) => void;
  onMove?: (evt: EventData, data: JoystickOutputData) => void;
}

export const NippleComponent = Shade<NippleComponentProps>({
  construct: async ({ element, props }) => {
    const nippleElement: HTMLDivElement | null = element.getElementsByTagName(
      "div"
    )[0];
    if (!nippleElement) {
      return;
    }
    const manager = create({
      zone: nippleElement
    });
    props.onStart && manager.on("start", props.onStart);
    props.onEnd && manager.on("end", props.onEnd);
    props.onDir && manager.on("dir", props.onDir);
    props.onMove && manager.on("move", props.onMove);
    return () => manager.destroy();
  },
  render: ({ props }) => {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          ...props.style
        }}
      ></div>
    );
  }
});
