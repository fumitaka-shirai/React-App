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
    Category:"体重あたり1回10㎎/㎏　1日3回まで",
    category: "ピーチ",
  },
  {
    Title:"去痰薬",
    title: "ムコソルバンDS1.5%",
    Category:"体重あたり1日0.06g/㎏　1日3回まで",
    category: "ヨーグルト"
  },
  {
    Title:"抗生剤",
    title: "セフゾン細粒小児用10%",
    Category: "体重あたり1日9~18㎎/㎏　1日3回まで",
    category:"ストロベリー"
  },
  {
    Title:"抗生剤",
    title: "メイアクトMS小児用細粒10%",
    Category: "体重あたり1日3㎎/㎏　1日3回まで",
    category:"バナナ"
  },
  {
    Title:"鎮咳薬",
    title: "メジコン配合シロップ",
    Category: "年齢により8~14歳1日9~16ml、3か月~7歳1日3~8ml　1日3~4回まで",
    category:"チェリー"
  },
  {
    Title:"鎮咳薬",
    title: "アスベリン散10%",
    Category: "年齢により1歳未満5~20㎎、1歳以上3歳未満10~25㎎、3歳以上6歳未満15~40㎎　1日3回まで",
    category:"甘い"
  },
  {
    Title:"抗アレルギー薬",
    title: "シングレア細粒4㎎",
    Category: "年齢により1歳以上6歳未満4㎎　1日1回まで",
    category:"なし"
  },
  {
    Title:"抗アレルギー薬",
    title: "オノンドライシロップ10%",
    Category: "体重あたり7㎎/㎏　1日2回まで",
    category:"ヨーグルト"

  },
  {
    Title:"鎮痛薬",
    title: "カロナール細粒20%",
    Category: "体重あたり10~15㎎/㎏　1日60㎎/㎏まで",
    category:"オレンジ"
  },
  {
    Title:"鎮痛薬",
    title: "ポンタール散50%",
    Category: "体重あたり6.5㎎/㎏　1日2回まで",
    category:"なし"
  },
];
 
//const App = () => {
function App({signOut}) { 

 const [showPosts, setShowPosts] = useState(posts);
 const [inputValue, setInputValue] = useState();

 const categories = Array.from(new Set(posts.map((post) => post.Title,)));
 
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
       <h4>薬効</h4>
       <button onClick={() => selectCategory("all")}>全て</button>
       {categories.map((Title) => (
         <button onClick={() => selectCategory(Title)}>{Title}</button>
       ))}
     </div>

     {/* フリーキーワード検索フォーム */}
     <div>
    <h4>フリーワード検索</h4>
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
  