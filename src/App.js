import React from "react";
import axios from "axios";

import styles from "./App.module.css";

function useSemiPersistentState(key) {
  const [value, setValue] = React.useState(localStorage.getItem(key) || "");

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
}

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

function App() {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search");
  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });
  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

  function handleSearchSubmit(event) {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    event.preventDefault();
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
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}>My Hacker Stories</h1>
      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />
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
    <div className={styles.item}>
      <span style={{ width: "40%" }}>
        <a href={item.url}>{item.title}</a>
      </span>
      <span style={{ width: "30%" }}>{item.author}</span>
      <span style={{ width: "10%" }}>{item.num_comments}</span>
      <span style={{ width: "10%" }}>{item.points}</span>
      <span style={{ width: "10%" }}>
        <button
          type="button"
          onClick={handleRemoveItem}
          className={`${styles.button} ${styles.buttonSmall}`}
        >
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
      <label htmlFor={id} className={styles.label}>
        {children}
      </label>
      {/* B */}
      <input
        ref={inputRef}
        type={type}
        value={value}
        id={id}
        autoFocus={isFocused}
        className={styles.input}
        onChange={onInputChange}
      />
      <p>
        Searching for <strong>{value}</strong>.
      </p>
    </div>
  );
}

function SearchForm({ searchTerm, onSearchInput, onSearchSubmit }) {
  return (
    <form onSubmit={onSearchSubmit} className={styles.searchForm}>
      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={onSearchInput}
      >
        <strong>Search: </strong>
      </InputWithLabel>

      <button
        type="submit"
        disabled={!searchTerm}
        className={`${styles.button} ${styles.buttonLarge}`}
      >
        Submit
      </button>
    </form>
  );
}

export default App;
