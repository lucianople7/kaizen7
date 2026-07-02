import React from "react";
import { Composition } from "remotion";
import flow from "../content_library/projects/first_flow/mr_kaizen_bangkok_energy_first_flow.json";
import { MrKaizenFirstFlow } from "./MrKaizenFirstFlow";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MrKaizenFirstFlow"
      component={MrKaizenFirstFlow}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ flow }}
    />
  );
};
