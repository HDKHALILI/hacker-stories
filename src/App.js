import React from "react";

function useSemiPersistentState(key) {
  const [value, setValue] = React.useState(localStorage.getItem(key) || "");

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
}

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
  const [stories, setStories] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  function getAsyncStories() {
    return new Promise(resolve =>
      setTimeout(() => resolve({ data: { stories: initialStories } }), 2000)
    );
  }

  function handleSearch(event) {
    setSearchTerm(event.target.value);
  }

  function handleRemoveStory(item) {
    const newStories = stories.filter(
      story => story.objectID !== item.objectID
    );
    setStories(newStories);
  }

  const searchedStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    setIsLoading(true);
    getAsyncStories()
      .then(result => {
        setStories(result.data.stories);
        setIsLoading(false);
      })
      .catch(() => setIsError(true));
  }, []);

  return (
    <div>
      <h1>My Hacker Stories</h1>
      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        <strong>Search: </strong>
      </InputWithLabel>
      <hr />

      {isError && <p>Something went wrong ...</p>}

      {isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={searchedStories} onRemoveItem={handleRemoveStory} />
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
