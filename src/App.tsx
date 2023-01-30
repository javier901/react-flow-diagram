import React, { DragEvent, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import { Sidebar } from "./Sidebar";
import { dataPanel } from "./data";
import { CustomNode } from "./CustomNode";
import { IPanel } from "./types";

import "reactflow/dist/style.css";

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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<any>>([]);
  const [reactFlowInstance, setReactFlowInstance] =
    React.useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);

  const { register, handleSubmit } = useForm<NodeInputs>();
  const [open, setOpen] = React.useState(false);
  const [selectedNode, setSelectedNode] = React.useState<{
    id: string;
    title: string;
    subTitle: string;
  }>({ id: "", title: "", subTitle: "" });

  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          node.data = {
            title: selectedNode.title,
            subTitle: selectedNode.subTitle,
          };
        }

        return node;
      })
    );
  }, [selectedNode, setNodes]);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setSelectedNode({ id: "", title: "", subTitle: "" });
  };

  const onSubmit: SubmitHandler<NodeInputs> = (data) => {
    setSelectedNode({
      id: selectedNode.id,
      title: data.title,
      subTitle: data.subtitle,
    });
    handleClose();
  };

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

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <h2 className="text-2xl font-bold underline underline-offset-2 text-center">
              Actualizar nodo
            </h2>
            <div>
              <label>Titulo: </label>
              <input
                {...register("title", {
                  required: true,
                  minLength: 3,
                })}
                defaultValue={selectedNode.title}
              />
            </div>

            <div>
              <label>Descripción: </label>
              <input
                {...register("subtitle", {
                  required: true,
                  minLength: 3,
                })}
                defaultValue={selectedNode.subTitle}
              />
            </div>
            <button type="submit">Guardar</button>
          </form>
        </Box>
      </Modal>
    </div>
  );
}

export default App;
