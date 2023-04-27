import { useState } from "react";
import "./App.css";

import{ Amplify }from "aws-amplify";
import{ withAuthenticator,Button, } from "@aws-amplify/ui-react";
import"@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";

Amplify.configure(awsExports);
 
const posts = [
  {
    Title:"去痰薬",
    title: "ムコダインDS50%",
    Category:"体重あたり",
    category: "イチゴ",
  },
  {
    Title:"去痰薬",
    title: "LaravelのMVCモデルについて",
    category: "Laravel"
  },
  {
    Title:"抗生剤",
    title: "同一オリジンポリシーとCORS",
    category: "Web"
  },
  {
    Title:"抗生剤",
    title: "useEffectの使い方",
    category: "React"
  },
  {
    Title:"鎮痛薬",
    title: "useEffectの使い方",
    category: "React"
  },
  {
    Title:"鎮痛薬",
    title: "useEffectの使い方",
    category: "React"
  },
  {
    Title:"抗アレルギー薬",
    title: "useEffectの使い方",
    category: "React"
  },
  {
    Title:"抗アレルギー薬",
    title: "useEffectの使い方",
    category: "React"
  },
  {
    Title:"睡眠薬",
    title: "useEffectの使い方",
    category: "React"
  },
  {
    Title:"睡眠薬",
    title: "useEffectの使い方",
    category: "React"
  },
];
 
//const App = () => {
  function App({ signOut,user}) { 

 const [showPosts, setShowPosts] = useState(posts);
 const [inputValue, setInputValue] = useState();

 const categories = Array.from(new Set(posts.map((post) => post.Title)));


 // カテゴリー絞り込み
 const selectCategory = (Title) => {
   if (Title === "all") {
     setShowPosts(posts);
   } else {
     const selectedTitles = posts.filter((post) => post.Title === Title);
     setShowPosts(selectedTitles);
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
  <>
  {
   <div className="App">
     <h1>小児用薬検索</h1>

     {/* カテゴリー選択ボタン */}
     <div>
       <h4>[薬効]</h4>
       <button onClick={() => selectCategory("all")}>全て</button>
       {categories.map((Title) => (
         <button onClick={() => selectCategory(Title)}>{Title}</button>
       ))}
     </div>

     {/* フリーキーワード検索フォーム */}
     <div>
       <h4>検索</h4>
       <input type="text" value={inputValue} onChange={handleInputChange} />
     </div>

     {/* 記事一覧表示 */}
     {showPosts.map((post, index) => {
       return (
         <div key={post.title}>
           <p>薬効：{post.Title}</p>
           <p>医薬品名：{post.title}
           </p>
           <p>味：{post.category}</p>
           <p>投与量:{post.Category}</p>
         </div>
       );
     })}
   </div>
  } 
  <Button onClick={signOut}>Sign out</Button>
   </>
 );
}

export default withAuthenticator(App);
  