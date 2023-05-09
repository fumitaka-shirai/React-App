import { useState } from "react";
import "./App.css";

import{ Amplify }from "aws-amplify";
import{ withAuthenticator,Button, } from "@aws-amplify/ui-react";
import"@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";
import React from'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';


Amplify.configure(awsExports);

const drugs = [
  {
    Category:"去痰薬",
    Name: "ムコダインDS50%",
    Dose:"体重あたり1回10㎎/㎏　1日3回まで",
    Taste: "ピーチ",
  },
  {
    Category:"去痰薬",
    Name: "ムコソルバンDS1.5%",
    Dose:"体重あたり1日0.06g/㎏　1日3回まで",
    Taste: "ヨーグルト"
  },
  {
    Category:"抗生剤",
    Name: "セフゾン細粒小児用10%",
    Dose: "体重あたり1日9~18㎎/㎏　1日3回まで",
    Taste:"ストロベリー"
  },
  {
    Category:"抗生剤",
    Name: "メイアクトMS小児用細粒10%",
    Dose: "体重あたり1日3㎎/㎏　1日3回まで",
    Taste:"バナナ"
  },
  {
    Category:"鎮咳薬",
    Name: "メジコン配合シロップ",
    Dose: "年齢により8~14歳1日9~16ml、3か月~7歳1日3~8ml　1日3~4回まで",
    Taste:"チェリー"
  },
  {
    Category:"鎮咳薬",
    Name: "アスベリン散10%",
    Dose: "年齢により1歳未満5~20㎎、1歳以上3歳未満10~25㎎、3歳以上6歳未満15~40㎎　1日3回まで",
    Taste:"甘い"
  },
  {
    Category:"抗アレルギー薬",
    Name: "シングレア細粒4㎎",
    Dose: "年齢により1歳以上6歳未満4㎎　1日1回まで",
    Taste:"なし"
  },
  {
    Category:"抗アレルギー薬",
    Name: "オノンドライシロップ10%",
    Dose: "体重あたり7㎎/㎏　1日2回まで",
    Taste:"ヨーグルト"

  },
  {
    Category:"鎮痛薬",
    Name: "カロナール細粒20%",
    Dose: "体重あたり10~15㎎/㎏　1日60㎎/㎏まで",
    Taste:"オレンジ"
  },
  {
    Category:"鎮痛薬",
    Name: "ポンタール散50%",
    Dose: "体重あたり6.5㎎/㎏　1日2回まで",
    Taste:"なし"
  },
];


//const App = () => {
function App({signOut}) { 

 const [showdrugs, setShowdrugs] = useState(drugs);
 const [inputValue, setInputValue] = useState();
 const categories = Array.from(new Set(drugs.map((drugs) => drugs.Category,)));
 
 const animatedComponents = makeAnimated(drugs);
 
 const Category =[
  {value:'鎮咳薬',label:'鎮咳薬'},
  {value:'鎮痛薬',label:'鎮痛薬'},
  {value:'抗アレルギー薬',label:'抗アレルギー薬'},
 ];

 const Tastes =[
  {value:'1',label:'ピーチ'}
 ]

 const Dose =[
  {value:'1',label:'就寝前'}
 ]

 // カテゴリー絞り込み 
 const selectCategory = (Category) => {
   if (Category === "all") {
     setShowdrugs(drugs);
   } else {
     const selectedTitles = drugs.filter((drugs) => drugs.Category === Category);
     setShowdrugs(selectedTitles);
   }
 };
 
 // フリーキーワードでの絞り込み
 const search = (value) => {
   if (value !== "") {
     const serchedDrugs = drugs.filter(
       (drugs) =>
         Object.values(drugs).filter(
           (item) =>
             item !== undefined &&
             item !== null &&
             item.toUpperCase().indexOf(value.toUpperCase()) !== -1
             
         ).length > 0
     );
     setShowdrugs(serchedDrugs);
     return;
   }

   setShowdrugs(drugs);
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
       {categories.map((Category) => (
         <button onClick={() => selectCategory(Category)}>{Category}</button>
       ))}
     </div>

     {/* フリーキーワード・絞り込み検索フォーム */}
     <div>
    <h4>フリーワード検索</h4>
       <input type="text" value={inputValue} onChange={handleInputChange} />
    <h4>絞り込み検索</h4>  
      <h5>分類</h5>
      <Select 
        closeMenuOnSelect={false}
        components={animatedComponents}
        onChange={v=>search(v.label)} 
        options={Category}
      />
      <h5>味</h5>
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        onChange={v=>search(v.label)} 
        options={Tastes}
        
      />
      <h5>用法</h5>
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        options={Dose}
      />
     </div>

     {/* 記事一覧表示 */}
     {showdrugs.map((drugs, index) => {
       return (
         <div key={drugs.title}>
           <p>薬効：{drugs.Category}</p>
           <p>医薬品名：{drugs.Drugs}
           </p>
           <p>味：{drugs.Taste}</p>
           <p>投与量:{drugs.Dose}</p>
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