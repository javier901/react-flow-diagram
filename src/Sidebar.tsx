import React from "react";

export const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="flex flex-col justify-center px-5 w-72">
      <div className="description">
        You can drag these nodes to the pane on the right.
      </div>
      <div
        className="dndnode input border-2 border-blue-600 font-bold p-2 my-2 cursor-pointer"
        onDragStart={(event) => onDragStart(event, "input")}
        draggable
      >
        Input Node
      </div>
      <div
        className="dndnode border-2 border-black font-bold p-2 my-2 cursor-pointer"
        onDragStart={(event) => onDragStart(event, "default")}
        draggable
      >
        Default Node
      </div>
      <div
        className="dndnode border-2 border-red-600 font-bold p-2 my-2 cursor-pointer"
        onDragStart={(event) => onDragStart(event, "output")}
        draggable
      >
        Output Node
      </div>
    </aside>
  );
};
