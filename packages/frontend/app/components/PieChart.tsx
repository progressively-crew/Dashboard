import {
  PieChart as RPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { stringToColor } from "~/modules/misc/utils/stringToColor";

export interface PieChartProps {
  data: Array<{ name: string; value: number }>;
}

export const PieChart = ({ data }: PieChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RPieChart height={160}>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({ index, ...props }) => (
            <text
              {...props}
              dominantBaseline="central"
              fill={stringToColor(data[index].name, 25)}
            >
              {data[index].name} ({data[index].value})
            </text>
          )}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={stringToColor(data[index].name)}
            />
          ))}
        </Pie>
      </RPieChart>
    </ResponsiveContainer>
  );
};