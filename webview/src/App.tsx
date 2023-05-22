import _ from "lodash";
import { useState } from "react";

function App() {
  return (
    <>
      <TodoSpace></TodoSpace>
    </>
  );
}

function TodoSpace() {
  const [todoSpace, setTodoSpace] = useState<TodoSpaceData>({
    spaceName: "my todo space",
    lists: [
      {
        listName: "FirstList",
        id: _.uniqueId(),
        todos: [
          {
            id: _.uniqueId(),
            content: "hiya",
            priority: 1,
            time: 3,
          },
        ],
      },
    ],
  });

  return (
    <div className="w-full h-full bg-black">
      <div className="h-14 flex items-center bg-white justify-start p-2">
        <button
          className="w-12 h-8 bg-green-300 rounded-sm"
          onClick={() => {
            const newState = { ...todoSpace };

            newState.lists.push({
              listName: "new list",
              id: _.uniqueId(),
              todos: [],
            });

            setTodoSpace(newState);
          }}
        >
          Add
        </button>
      </div>
      <div className="w-full h-fit bg-black flex p-4 gap-4 justify-center flex-wrap">
        {todoSpace.lists.map((list) => {
          return (
            <TodoList
              setTodoListData={(newTodoList) => {
                const replaceIndex = todoSpace.lists.findIndex(
                  ({ id }) => id === list.id
                );

                const newState = { ...todoSpace };

                newState.lists.splice(replaceIndex, 1, newTodoList);

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
}) {
  const { listData, setTodoListData } = props;

  return (
    <div className="p-4 w-fit h-fit rounded-md bg-gray-600 text-xl">
      <div className="flex flex-col gap-2 mb-4">
        <input
          defaultValue={listData.listName}
          onKeyDown={(e) => {
            const newState = { ...listData };

            newState.listName = e.currentTarget.value;

            setTodoListData(newState);
          }}
          className="bg-transparent outline-none mb-2"
        ></input>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const newState = { ...listData };

              newState.todos.push({
                content: "",
                priority: 0,
                id: _.uniqueId(),
                time: 0,
              });

              setTodoListData(newState);
            }}
            className="h-fit text-sm rounded-md w-fit flex p-2 bg-green-300"
          >
            Add
          </button>
        </div>
      </div>
      <div className="p-3 bg-black rounded-md flex flex-col gap-3">
        {listData.todos.map((todoData) => {
          return (
            <Todo
              setTodo={(newTodo) => {
                const replaceIndex = listData.todos.findIndex(
                  ({ id }) => id === todoData.id
                );

                const newState = { ...listData };

                newState.todos.splice(replaceIndex, 1, newTodo);

                setTodoListData(newState);
              }}
              todoData={todoData}
              key={todoData.id}
            ></Todo>
          );
        })}
      </div>
    </div>
  );
}

function Todo(props: {
  todoData: TodoData;
  setTodo: (newTodo: TodoData) => void;
}) {
  const { todoData, setTodo } = props;

  return (
    <div className="bg-gray-600 rounded-md p-2">
      <input
        className="bg-transparent outline-none"
        onKeyDown={(e) => {
          const newTodo = { ...todoData };

          newTodo.content = e.currentTarget.value;

          setTodo(newTodo);

          console.log(newTodo);
        }}
        defaultValue={todoData.content}
      ></input>
    </div>
  );
}

export default App;
