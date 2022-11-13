import { useState } from "react";
import { TbPlayerPlay } from "react-icons/tb";
import { SearchBar, Window } from "./Window";

const BrowserExample = ({ transitioning }: { transitioning: boolean }) => {
  const assetStyles = transitioning
    ? "bg-indigo-700 flex-1"
    : "bg-gray-200 flex-[2_2_0%]";

  const firstLineStyles = transitioning
    ? " w-1/2 h-4 bg-gray-700 mb-2"
    : " w-1/2 h-2 bg-gray-200";

  const buttonStyle = transitioning ? "w-6 bg-pink-300" : "w-0 bg-pink-100";

  return (
    <div aria-hidden>
      <Window header={<SearchBar>https://your-app.com</SearchBar>}>
        <div className="p-4">
          <div className={"transition-all flex flex-row gap-2"}>
            <div
              className={
                "rounded-md transition-all h-20 flex justify-center items-center text-3xl text-white " +
                assetStyles
              }
            >
              {transitioning ? <TbPlayerPlay /> : null}
            </div>

            <div
              className={
                "transition-all flex gap-1 flex-col justify-center flex-[2_2_0%]"
              }
            >
              <div
                className={"transition-all rounded-full " + firstLineStyles}
              />
              <div
                className={"transition-all rounded-full w-full h-2 bg-gray-200"}
              />
              <div
                className={"transition-all rounded-full w-3/4 h-2 bg-gray-200"}
              />

              <div className={"h-2 rounded-full h-2 mt-2 " + buttonStyle} />
            </div>
          </div>
        </div>
      </Window>
    </div>
  );
};

export const Example = () => {
  const [percentage, setPercentage] = useState(0);

  const browsers = Array(6).fill(null);

  const base6 = (percentage / 100) * 6;

  return (
    <section className="max-w-screen-xl mx-auto px-4 py-12 lg:p-20">
      <h2 className="text-center text-3xl md:text-5xl font-bold">
        <span className="text-indigo-700">Rollout and rollback</span> as you
        want
      </h2>

      <p className="text-center text-gray-700 p-4 md:px-16 md:text-xl lg:text-2xl">
        Start building your feature, merge the changes, and progressively
        rollout these changes to your audience. If you encounter unexpected
        errors, you can simply rollback as easily as you rolled out.
      </p>

      <div className="py-6 flex items-center justify-center">
        <div className="bg-gray-100 pl-10 pr-3 py-3 rounded-full flex flex-row gap-3">
          <input
            type="range"
            aria-label="Percentage of the audience"
            onChange={(e) => setPercentage(Number(e.target.value))}
            value={percentage}
          />

          <div className="px-3 py-2 w-16 bg-indigo-700 text-white text-sm font-bold rounded-full text-center">
            {percentage}%
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {browsers.map((_, index: number) => (
          <BrowserExample
            key={`browser-${index}`}
            transitioning={index + 1 <= base6}
          />
        ))}
      </div>
    </section>
  );
};