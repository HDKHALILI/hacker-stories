import React from "react";
import axios from "axios";

function useSemiPersistentState(key) {
  const [value, setValue] = React.useState(localStorage.getItem(key) || "");

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
}

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

function App() {
  const initialStories = [
    {
      title: "React",
      url: "https://reactjs.org",
      author: "Jordan Walke",
      num_comments: 5,
      points: 4,
      objectID: 0,
    },
    {
      title: "Redux",
      url: "https://redux.js.org",
      author: "Dan Abramov, Andrew Clark",
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];

  const [searchTerm, setSearchTerm] = useSemiPersistentState("search");
  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });
  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

  function handleSearchSubmit() {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
  }

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    try {
      const result = await axios.get(url);
      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }
  }, [url]);

  function handleSearchInput(event) {
    setSearchTerm(event.target.value);
  }

  function handleRemoveStory(item) {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  }

  function storiesReducer(state, action) {
    switch (action.type) {
      case "STORIES_FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case "STORIES_FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case "STORIES_FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      case "REMOVE_STORY":
        return {
          ...state,
          data: state.data.filter(
            story => action.payload.objectID !== story.objectID
          ),
        };
      default:
        throw new Error();
    }
  }

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  return (
    <div>
      <h1>My Hacker Stories</h1>
      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearchInput}
      >
        <strong>Search: </strong>
      </InputWithLabel>

      <button type="button" disabled={!searchTerm} onClick={handleSearchSubmit}>
        Submit
      </button>
      <hr />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}

      <hr />
    </div>
  );
}

function List({ list, onRemoveItem }) {
  return list.map(item => (
    <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
  ));
}

function Item({ item, onRemoveItem }) {
  function handleRemoveItem() {
    onRemoveItem(item);
  }
  return (
    <div>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type="button" onClick={handleRemoveItem}>
          Dismiss
        </button>
      </span>
    </div>
  );
}

function InputWithLabel({
  id,
  value,
  type = "text",
  isFocused,
  onInputChange,
  children,
}) {
  // A
  const inputRef = React.useRef();

  // C
  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      // D
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <div>
      <label htmlFor={id}>{children}</label>
      {/* B */}
      <input
        ref={inputRef}
        type={type}
        value={value}
        id={id}
        autoFocus={isFocused}
        onChange={onInputChange}
      />
      <p>
        Searching for <strong>{value}</strong>.
      </p>
    </div>
  );
}

export default App;
