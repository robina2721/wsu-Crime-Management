import * as React from "react";

export function Progress({ value = 0, className }: any) {
  return (
    <div className={"w-full bg-gray-200 rounded h-2 " + (className || '')}>
      <div className="bg-red-600 h-2 rounded" style={{ width: `${value}%` }} />
    </div>
  );
}

export default Progress;
