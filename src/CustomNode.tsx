import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { IPanel } from "./types";

interface CustomNodeProps {
  data: IPanel;
}

export const CustomNode = memo(({ data }: CustomNodeProps) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#555" }}
        isConnectable={true}
      />
      <div className="border-2 border-gray-500 p-2 rounded-sm">
        <p className="border-b-2">{data.title ?? "Title not available"}</p>
        <p className="text-sm">{data.subTitle ?? "Subtitle not available"}</p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "red" }}
        isConnectable={true}
      />
    </>
  );
});
