import React from "react";

function useSemiPersistentState(key) {
  const [value, setValue] = React.useState(localStorage.getItem(key) || "");

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
}

function App() {
  const stories = [
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

  function handleSearch(event) {
    setSearchTerm(event.target.value);
  }

  const searchedStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>My Hacker Stories</h1>
      <InputWithLabel
        id="search"
        label="Search"
        value={searchTerm}
        onInputChange={handleSearch}
      />
      <hr />

      <List list={searchedStories} />

      <hr />
    </div>
  );
}

function List(props) {
  return props.list.map(({ objectID, ...item }) => (
    <Item key={objectID} {...item} />
  ));
}

function Item({ url, title, author, num_comments, points }) {
  return (
    <div>
      <span>
        <a href={url}>{title}</a>
      </span>
      <span>{author}</span>
      <span>{num_comments}</span>
      <span>{points}</span>
    </div>
  );
}

function InputWithLabel({ id, label, value, type = "text", onInputChange }) {
  return (
    <div>
      <label htmlFor={id}>{label}: </label>
      <input type={type} value={value} id={id} onChange={onInputChange} />
      <p>
        Searching for <strong>{value}</strong>.
      </p>
    </div>
  );
}

export default App;
