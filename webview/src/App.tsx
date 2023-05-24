import { motion } from "framer-motion";
import { useState, DragEvent, useEffect } from "react";
import { v4 as uuid } from "uuid";

function App() {
  return (
    <>
      <TodoSpace></TodoSpace>
    </>
  );
}

interface vscode {
  postMessage(message: any): void;
  getState(): { text: unknown | undefined };
}

declare const vscode: vscode;

function TodoSpace() {
  const [todoSpace, setTodoSpace] = useState<TodoSpaceData>({
    spaceName: "my todo space",
    lists: [
      {
        id: uuid(),
        listName: "Todo",
        todos: [{ content: "", id: uuid(), priority: 0, time: 0 }],
      },
      {
        id: uuid(),
        listName: "Doing",
        todos: [{ content: "", id: uuid(), priority: 0, time: 0 }],
      },
      {
        id: uuid(),
        listName: "Done",
        todos: [{ content: "", id: uuid(), priority: 0, time: 0 }],
      },
    ],
  });

  const [draggingOverList, setDraggingOverList] = useState<string | null>();
  const [reorderLists, setReorderLists] = useState(false);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const message = e.data;

      const data = JSON.parse(message.text);

      setTodoSpace(data);
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    vscode.postMessage({
      newData: todoSpace,
    });
  }, [todoSpace]);

  return (
    <div className="w-full h-full bg-black">
      <div className="h-14 flex items-center bg-slate-800 text-white justify-between p-2">
        <h1 className="font-2xl font-semibold">EasyTODO</h1>
        <div className="flex justify-end gap-4">
          <button
            className="w-fit px-2 h-8 bg-blue-500 rounded-sm text-white font-semibold"
            onClick={() => {
              const newState = { ...todoSpace };

              newState.lists.push({
                listName: "New list",
                id: uuid(),
                todos: [
                  {
                    content: "" + vscode.getState().text,
                    priority: 0,
                    id: uuid(),
                    time: 0,
                  },
                ],
              });

              setTodoSpace(newState);
            }}
          >
            Create
          </button>
          <Toggle text="Reorder Lists" onClick={(on) => setReorderLists(on)} />
        </div>
      </div>
      <div className="w-full h-fit bg-black flex p-4 gap-4 justify-center flex-wrap">
        {todoSpace.lists.map((list) => {
          return (
            <TodoList
              onTodoDrop={(id, listId, dropId) => {
                console.log("hai");

                const newState = { ...todoSpace };

                const listWithMovingTodo = newState.lists.find(
                  ({ id }) => listId === id
                );

                const movingTodoIndex = listWithMovingTodo?.todos.findIndex(
                  (todo) => todo.id === id
                );

                console.log(newState.lists, listWithMovingTodo, listId);

                if (movingTodoIndex === undefined) return;

                const listWithDestinationTodo = newState.lists.find(
                  ({ id }) => id === list.id
                );

                const destinationTodoIndex =
                  listWithDestinationTodo?.todos.findIndex(
                    (todo) => todo.id === dropId
                  );

                if (destinationTodoIndex === undefined) return;

                const movingTodo = listWithMovingTodo?.todos.splice(
                  movingTodoIndex,
                  1
                )[0];

                if (movingTodo === undefined) return;

                listWithDestinationTodo?.todos.splice(
                  destinationTodoIndex,
                  0,
                  movingTodo
                );

                setTodoSpace(newState);
              }}
              setIsDraggingOver={(draggingOver) => {
                if (draggingOver) {
                  setDraggingOverList(list.id);
                } else {
                  setDraggingOverList(null);
                }
              }}
              reorderLists={reorderLists}
              isDraggingOver={draggingOverList === list.id}
              onDrop={(droppedId: string, type: "List" | "Todo") => {
                if (type !== "List") {
                  return;
                }

                const newState = { ...todoSpace };

                const moveIndex = todoSpace.lists.findIndex(
                  ({ id }) => droppedId === id
                );

                const dropIndex = todoSpace.lists.findIndex(
                  ({ id }) => list.id === id
                );

                const movingList = newState.lists.splice(moveIndex, 1);

                newState.lists.splice(dropIndex, 0, movingList[0]);

                setTodoSpace(newState);
                setDraggingOverList(null);
              }}
              setTodoListData={(newTodoList) => {
                const replaceIndex = todoSpace.lists.findIndex(
                  ({ id }) => id === list.id
                );

                const newState = { ...todoSpace };

                newState.lists.splice(replaceIndex, 1, newTodoList);

                setTodoSpace(newState);
              }}
              deleteList={() => {
                if (!confirm("Delete list? Action cannot be undone")) return;

                const newState = { ...todoSpace };

                const thisList = todoSpace.lists.findIndex(
                  ({ id }) => id === list.id
                );

                newState.lists.splice(thisList, 1);

                setTodoSpace(newState);
              }}
              listData={list}
              key={list.id}
            ></TodoList>
          );
        })}
      </div>
    </div>
  );
}

function Toggle(props: {
  text?: string;
  onClick?: (toggleState: boolean) => void;
}) {
  const { text, onClick } = props;

  const [enabled, setEnabled] = useState(false);

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden">
      <div className="flex">
        <label className="inline-flex relative items-center mr-5 cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            readOnly
          />
          <div
            onClick={() => {
              onClick?.(!enabled);
              setEnabled(!enabled);
            }}
            className="
              w-11 
              h-6 
              bg-gray-200 
              rounded-full
              peer 
              peer-focus:ring-green-300
              peer-checked:after:translate-x-full
            peer-checked:after:border-white
              after:content-['']
              after:absolute
              after:top-0.5
              after:left-[2px]
              after:bg-white
              after:border-gray-300
              after:border
              after:rounded-full
              after:h-5
              after:w-5
              after:transition-all
              peer-checked:bg-blue-400
            "
          ></div>
          <span className="ml-2 text-sm font-medium">{text}</span>
        </label>
      </div>
    </div>
  );
}

type TodoData = {
  priority: number;
  time: number;
  content: string;
  id: string;
};

type TodoListData = {
  listName: string;
  todos: TodoData[];
  id: string;
};

type TodoSpaceData = {
  spaceName: string;
  lists: TodoListData[];
};

function TodoList(props: {
  listData: TodoListData;
  setTodoListData: (newTodoList: TodoListData) => void;
  onDrop: (dropId: string, type: "List" | "Todo") => void;
  onTodoDrop: (id: string, ListId: string, dropId: string) => void;
  deleteList: () => void;
  isDraggingOver: boolean;
  setIsDraggingOver: (draggingOver: boolean) => void;
  reorderLists: boolean;
}) {
  const {
    listData,
    setTodoListData,
    onDrop,
    deleteList,
    isDraggingOver,
    reorderLists,
    setIsDraggingOver,
    onTodoDrop,
  } = props;

  const [draggingOverTodo, setDraggingOverTodo] = useState<string | null>(null);

  return (
    <motion.div
      whileHover={{
        border: reorderLists ? "1px solid white" : "0px solid white",
      }}
      style={{
        opacity: isDraggingOver && reorderLists ? 0.9 : 1.0,
      }}
      draggable={reorderLists ? "true" : "false"}
      className="p-4 w-fit h-fit rounded-md bg-slate-800 text-xl"
      onDragStart={(e: any) => {
        e.dataTransfer.setData(
          "text/plain",
          JSON.stringify({
            type: "List",
            id: listData.id,
          })
        );
      }}
      onDragEnter={() => {
        setIsDraggingOver(true);
      }}
      onDragExit={() => setIsDraggingOver(false)}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const { id, type } = JSON.parse(e.dataTransfer.getData("text/plain"));

        onDrop(id, type);
      }}
    >
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex justify-between">
          <input
            defaultValue={listData.listName}
            onKeyDown={(e) => {
              const newState = { ...listData };

              newState.listName = e.currentTarget.value;

              setTodoListData(newState);
            }}
            className="bg-transparent outline-none mb-2 text-2xl font-semibold text-blue-500"
          ></input>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const newState = { ...listData };

              newState.todos.push({
                content: "",
                priority: 0,
                id: uuid(),
                time: 0,
              });

              setTodoListData(newState);
            }}
            className="text-sm justify-center items-center aspect-square flex p-2 bg-blue-500 rounded-full font-semibold text-white"
          >
            +
          </button>
          <button
            onClick={deleteList}
            className="text-sm justify-center items-center aspect-square flex p-2 bg-red-400 rounded-full font-semibold text-white"
          >
            -
          </button>
        </div>
      </div>
      <div className="p-3 bg-black rounded-md flex flex-col gap-3">
        {listData.todos.map((todoData) => {
          return (
            <Todo
              listId={listData.id}
              onDrop={onTodoDrop}
              setDraggingOver={(draggingOver) => {
                setDraggingOverTodo(draggingOver ? todoData.id : null);
              }}
              draggingOver={todoData.id === draggingOverTodo}
              reorderTodos={!reorderLists}
              setTodo={(newTodo) => {
                const newState = { ...listData };

                const replaceIndex = newState.todos.findIndex(
                  ({ id }) => id === todoData.id
                );

                newState.todos.splice(replaceIndex, 1, newTodo);
                setTodoListData(newState);
              }}
              deleteTodo={() => {
                const deleteTodo = listData.todos.findIndex(
                  ({ id }) => id === todoData.id
                );

                const newState = { ...listData };

                newState.todos.splice(deleteTodo, 1);

                setTodoListData(newState);
              }}
              todoData={todoData}
              key={todoData.id}
            ></Todo>
          );
        })}
      </div>
    </motion.div>
  );
}

function Todo(props: {
  todoData: TodoData;
  setTodo: (newTodo: TodoData) => void;
  deleteTodo: () => void;
  reorderTodos: boolean;
  setDraggingOver: (draggingOver: boolean) => void;
  draggingOver: boolean;
  onDrop: (id: string, listId: string, dropId: string) => void;
  listId: string;
}) {
  const {
    todoData,
    setTodo,
    deleteTodo,
    reorderTodos,
    setDraggingOver,
    draggingOver,
    onDrop,
    listId,
  } = props;

  return (
    <motion.div
      draggable={reorderTodos ? "true" : "false"}
      className="bg-slate-700 rounded-md p-2 h-fit flex gap-2 cursor-move"
      whileHover={{
        border: reorderTodos ? "1px solid white" : "0px solid white",
      }}
      style={{
        opacity: draggingOver && reorderTodos ? 0.9 : 1.0,
      }}
      onDragStart={(e: any) => {
        e.stopPropagation();

        e.dataTransfer.setData(
          "text/plain",
          JSON.stringify({
            type: "Todo",
            id: todoData.id,
            listId: listId,
          })
        );
      }}
      onDragEnter={() => {
        setDraggingOver(true);
      }}
      onDragExit={() => {
        setDraggingOver(false);
      }}
      onDragOver={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onDrop={(e: DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();

        const parsed = JSON.parse(e.dataTransfer.getData("text/plain"));

        if (parsed.type === "Todo") {
          const { listId, id } = parsed;

          onDrop(id, listId, todoData.id);
        }
      }}
    >
      <textarea
        wrap="soft"
        className="bg-transparent outline-none break overflow-visible break-words break-all"
        onKeyDown={(e) => {
          const newTodo = { ...todoData };

          newTodo.content = e.currentTarget.value;

          setTodo(newTodo);
        }}
        defaultValue={todoData.content}
      ></textarea>
      <div className="text-sm">
        <div className="flex">
          {[0, 1, 2].map((_label, index) => (
            <button
              key={uuid()}
              className={`${
                todoData.priority >= index ? "opacity-100" : "opacity-50"
              }`}
              onClick={() => {
                const newTodo = { ...todoData };

                newTodo.priority = index;

                setTodo(newTodo);
              }}
            >
              ⭐
            </button>
          ))}
        </div>
        <div className="flex">
          {[0, 1, 2].map((_label, index) => (
            <button
              key={uuid()}
              className={`${
                todoData.time >= index ? "opacity-100" : "opacity-50"
              }`}
              onClick={() => {
                const newTodo = { ...todoData };

                newTodo.time = index;

                setTodo(newTodo);
              }}
            >
              ⏰
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          if (confirm("delete todo?")) {
            deleteTodo();
          }
        }}
        className="text-sm justify-center items-center flex p-2 bg-red-400 rounded-md font-semibold text-white"
      >
        -
      </button>
    </motion.div>
  );
}

export default App;
