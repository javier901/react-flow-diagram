import React, { DragEvent, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Connection,
  Edge,
  ReactFlowInstance,
} from "reactflow";
import { useForm, SubmitHandler } from "react-hook-form";
import { Sidebar } from "./Sidebar";

import "reactflow/dist/style.css";
import { dataPanel } from "./data";
import { CustomNode } from "./CustomNode";
import { IPanel } from "./types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
const nodeTypes = {
  info: CustomNode,
};

const initialNodes = [
  {
    id: "1",
    type: "info",
    data: { title: "input node", subTitle: "input node" },
    position: { x: 250, y: 5 },
  },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

type NodeInputs = {
  title: string;
  subtitle: string;
};

function App() {
  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<any>>([]);
  const [reactFlowInstance, setReactFlowInstance] =
    React.useState<ReactFlowInstance | null>(null);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [selectedNode, setSelectedNode] = React.useState<{
    id: string;
    title: string;
    subTitle: string;
  }>({ id: "", title: "", subTitle: "" });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NodeInputs>();

  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          console.log("node selected", node);
          // it's important that you create a new object here
          // in order to notify react flow about the change
          // node.data = {
          //   ...node.data,
          //   label: nodeName,
          // };

          // update the node data dinamically
          node.data = {
            title: selectedNode.title,
            subTitle: selectedNode.subTitle,
          };
        }

        return node;
      })
    );
  }, [selectedNode, setNodes]);

  const onSubmit: SubmitHandler<NodeInputs> = (data) => console.log(data);

  const onConnect = useCallback(
    (params: Edge<any> | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer!.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowInstance) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current!.getBoundingClientRect();
      const data = event.dataTransfer!.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof data === "undefined" || !data) {
        return;
      }

      const parsedData: IPanel = JSON.parse(data);

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type: "info",
        position,
        data: {
          title: parsedData.title,
          subTitle: parsedData.subTitle,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <div className="flex w-screen h-screen">
      <ReactFlowProvider>
        <Sidebar nodes={dataPanel} />
        <div className="w-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            nodeTypes={nodeTypes}
            onNodeClick={(event, node) => {
              console.log("click", node);
              handleOpen();
              setSelectedNode({
                id: node.id,
                title: node.data.title,
                subTitle: node.data.subTitle,
              });
            }}
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>

      <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div className="border-2">
              <label>Title: </label>
              <input
                {...register("title", {
                  required: true,
                  minLength: 3,
                })}
                defaultValue={selectedNode.title}
                onChange={(e) => {
                  console.log(e.target.value);
                  setSelectedNode({
                    ...selectedNode,
                    title: e.target.value,
                  });
                }}
              />
            </div>

            <div className="border-2">
              <label>Subtitle: </label>
              <input
                {...register("subtitle", {
                  required: true,
                  minLength: 3,
                })}
                defaultValue={selectedNode.subTitle}
                onChange={(e) => {
                  console.log(e.target.value);
                  setSelectedNode({
                    ...selectedNode,
                    subTitle: e.target.value,
                  });
                }}
              />
            </div>
            {/* <input type="submit" /> */}
          </form>
        </Box>
      </Modal>
    </div>
  );
}

export default App;
