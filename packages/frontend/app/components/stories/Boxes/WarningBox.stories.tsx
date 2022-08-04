import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { WarningBox } from "../../WarningBox";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Components/Boxes/WarningBox",
  component: WarningBox,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof WarningBox>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const DefaultTemplate: ComponentStory<typeof WarningBox> = (args) => (
  <WarningBox {...args} />
);
export const Default = DefaultTemplate.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  title: "Be ready for something dangereous",
  list: { warning: "Some warning", another: "Another one" },
};
