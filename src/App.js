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
    Taste:"ヨーグルト"
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
    Dose: "年齢により1歳以上6歳未満4㎎　1日1回まで　食後",
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
 const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTaste, setSelectedTaste] = useState(null);
  const [selectedDose, setSelectedDose] = useState(null);
 const animatedComponents = makeAnimated(drugs);
 
 const selectCategory = category => {
  setSelectedCategory(category);
  filterDrugs(category, selectedTaste, selectedDose);
};

const selectTaste = taste => {
  setSelectedTaste(taste);
  filterDrugs(selectedCategory, taste, selectedDose);
};

const selectDose = dose => {
  setSelectedDose(dose);
  filterDrugs(selectedCategory, selectedTaste, dose);
};

const filterDrugs = (category, taste, dose) => {
  let filteredDrugs = drugs;

  if (category) {
    filteredDrugs = filteredDrugs.filter(drug => drug.Category === category.label);
  }

  if (taste) {
    filteredDrugs = filteredDrugs.filter(drug => drug.Taste === taste.label);
  }

  if (dose) {
    filteredDrugs = filteredDrugs.filter(drug => drug.Dose === dose.label);
  }

  setShowdrugs(filteredDrugs);
};

const search = value => {
  setInputValue(value);

  if (value !== '') {
    const searchedDrugs = drugs.filter(
      drug =>
        Object.values(drug).some(
          item =>
            item !== undefined &&
            item !== null &&
            typeof item === 'string' &&
            item.toUpperCase().indexOf(value.toUpperCase()) !== -1
        )
    );
    setShowdrugs(searchedDrugs);
  } else {
    filterDrugs(selectedCategory, selectedTaste, selectedDose);
  }
};

const handleInputChange = e => {
  setInputValue(e.target.value);
  search(e.target.value);
};

return (
  <div className="App">
    <h1>小児用薬検索</h1>

    {/* Category selection */}
    <div>
      <h4>薬効</h4>
      <button onClick={() => selectCategory(null)}>全て</button>
      {categories.map(category => (
        <button key={category} onClick={() => selectCategory({ label: category })}>
          {category}
        </button>
      ))}
    </div>

    {/* Free text and filtering search */}
    <div>
      <h4>フリーワード検索</h4>
      <input type="text" value={inputValue} onChange={handleInputChange} />

      <h4>絞り込み検索</h4>
      <h5>分類</h5>
      <Select
        closeMenuOnSelect={true}
        components={animatedComponents}
        onChange={selectCategory}
        options={categories.map(category => ({ value: category, label: category }))}
        isClearable
      />

      <h5>味</h5>
      <Select
        closeMenuOnSelect={true}
        components={animatedComponents}
        onChange={selectTaste}
        options={[
          { value: 'ピーチ', label: 'ピーチ' },
          { value: 'ヨーグルト', label: 'ヨーグルト' },
          // ... other taste options
        ]}
        isClearable
      />

      <h5>用法</h5>
      <Select
        closeMenuOnSelect={true}
        components={animatedComponents}
        onChange={selectDose}
        options={[
          { value: '体重あたり1回10㎎/㎏　1日3回まで', label: '体重あたり1回10㎎/㎏　1日3回まで' },
          { value: '体重あたり1日0.06g/㎏　1日3回まで', label: '体重あたり1日0.06g/㎏　1日3回まで' },
          // ... other dose options
        ]}
        isClearable
      />
    </div>

    {/* Drug list */}
    <table>
      <thead>
        <tr>
          <th>分類</th>
          <th>医薬品名</th>
          <th>味</th>
          <th>用法</th>
        </tr>
      </thead>
      <tbody>
        {showdrugs.map(drug => (
          <tr key={drug.Name}>
            <td>{drug.Category}</td>
            <td>{drug.Name}</td>
            <td>{drug.Taste}</td>
            <td>{drug.Dose}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <button onClick={signOut}>Sign out</button>
    </div>

 );
};
export default withAuthenticator(App);