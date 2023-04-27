import { useState } from "react";
import "./styles.css";

export default function App() {
  const posts = [
    {
      title: "useStateの使い方",
      category: "React"
    },
    {
      title: "LaravelのMVCモデルについて",
      category: "Laravel"
    },
    {
      title: "同一オリジンポリシーとCORS",
      category: "Web"
    },
    {
      title: "useEffectの使い方",
      category: "React"
    }
  ];

  const [showPosts, setShowPosts] = useState(posts);
  const [inputValue, setInputValue] = useState();

  const categories = Array.from(new Set(posts.map((post) => post.category)));

  // カテゴリー絞り込み
  const selectCategory = (category) => {
    if (category === "all") {
      setShowPosts(posts);
    } else {
      const selectedPosts = posts.filter((post) => post.category === category);
      setShowPosts(selectedPosts);
    }
  };

  // フリーキーワードでの絞り込み
  const search = (value) => {
    if (value !== "") {
      const serchedPosts = posts.filter(
        (post) =>
          Object.values(post).filter(
            (item) =>
              item !== undefined &&
              item !== null &&
              item.toUpperCase().indexOf(value.toUpperCase()) !== -1
          ).length > 0
      );
      setShowPosts(serchedPosts);
      return;
    }

    setShowPosts(posts);
    return;
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    search(e.target.value);
  };

  return (
    <div className="App">
      <h1>記事一覧</h1>

      {/* カテゴリー選択ボタン */}
      <div>
        <h4>Category：</h4>
        <button onClick={() => selectCategory("all")}>All</button>
        {categories.map((category) => (
          <button onClick={() => selectCategory(category)}>{category}</button>
        ))}
      </div>

      {/* フリーキーワード検索フォーム */}
      <div>
        <h4>Search</h4>
        <input type="text" value={inputValue} onChange={handleInputChange} />
      </div>

      {/* 記事一覧表示 */}
      {showPosts.map((post, index) => {
        return (
          <div key={post.title}>
            <p>
              {index + 1}. {post.title}
            </p>
            <p>category：{post.category}</p>
          </div>
        );
      })}
    </div>
  );
}
