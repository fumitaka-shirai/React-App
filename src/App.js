import React, { useState, useEffect } from "react";
import "./App.css";
import{ Amplify }from "aws-amplify";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import axios from 'axios';
import"@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";
import{ withAuthenticator } from "@aws-amplify/ui-react";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import Review from "./Review.js";
import { Authenticator } from "@aws-amplify/ui-react";
import { useParams } from "react-router-dom";


Amplify.configure(awsExports);

const App = ({ signOut}) => {
  const user = Authenticator();
  const [drugs, setDrugs] = useState([]);
  const [selectedDrugWithChat, setSelectedDrugWithChat] = useState(null);
  const [inputLabel, setInputLabel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDose, setSelectedDose] = useState(null);
  const animatedComponents = makeAnimated();
  const [chatData, setChatData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100); // 1ページに表示する医薬品数
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/drug');
        const jsonData = response.data;
        setDrugs(jsonData);
        setFilteredDrugs(jsonData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const categories = Array.from(new Set(drugs.map((drug) => drug.Category)));

  const handleSelectCategory = (selectedOption) => {
    setSelectedCategory(selectedOption);
    filterDrugs(selectedOption ? selectedOption.value : null);
  };

  
  const handleCancelSearch = () => {
    setSearchInputValue('');
  };

  const search = (value) => {
    setSearchValue(value);
    const categoryValue = selectedCategory ? selectedCategory.value : null;
    filterDrugs(categoryValue, selectedDose, value);
  };

  const filterDrugs = (category, label) => {
    let filteredDrugs = drugs;
  
    if (category && !label) {
      filteredDrugs = filteredDrugs.filter((drug) => drug.Category === category);
    }

    if (label && typeof label === 'string') {
      const searchLabel = label.toLowerCase();

      filteredDrugs = filteredDrugs.filter((drug) =>
        Object.values(drug).some((item) => {
          if (item !== undefined && item !== null && typeof item === 'string') {
           
            const itemText = item.toLowerCase();
            return itemText.includes(searchLabel);
          }
          return false;
        })
      );
    }
    setFilteredDrugs(filteredDrugs);
  };
  
  
  const handleInputChange = (inputValue) => {
    setSearchValue(inputValue);
    filterDrugs(selectedCategory ? selectedCategory.value : null, selectedDose, inputValue);
  };
  
  
  const handleSearchInputChange = (e) => {
    setSearchInputValue(e.target.value);
  };

  const categoryOptions = [
    { value: null },
    ...categories.map((category) => ({ value: category, label: category })),
  ];

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      width: 600,
      margin: '0 auto',
    }),
  };

  const handleSendMessage = async (drugName) => {
    const chatMessage = chatData[drugName]?.message || '';
    const selectedDrug = drugs.find((drug) => drug.Name === drugName);
  
    if (chatMessage && selectedDrug) {
      if (!user) {
        alert('レビューを投稿するにはサインインが必要です。');
        return;
      }
      const newMessage = {
        text: chatMessage,
        date: new Date().toLocaleString(),
        username: user.username,
        drug_id: selectedDrug.id, 
      };
  
      try {
        await axios.post('http://127.0.0.1:5000/api/chat', newMessage);
        console.log('メッセージが送信されました。');
        setChatData((prevChatData) => {
          const updatedChatData = { ...prevChatData };
          updatedChatData[drugName] = {
            message: '',
            username: '',
            messages: [...(updatedChatData[drugName]?.messages || []), newMessage],
          };
          return updatedChatData;
        });
      } catch (error) {
        console.error('メッセージの送信中にエラーが発生しました。', error);
      }
    }
  };
  

  const handleChatMessageChange = (e, drugName) => {
    const value = e.target.value;
    setChatData((prevChatData) => ({
      ...prevChatData,
      [drugName]: {
        ...prevChatData[drugName],
        message: value,
      },
    }));
  };

  const paginate = (array, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return array.slice(startIndex, endIndex);
  };

  const paginatedFilteredDrugs = paginate(filteredDrugs, currentPage, itemsPerPage);

  const Pagination = ({ totalItems, itemsPerPage, currentPage, setCurrentPage }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handleClick = (pageNumber) => {
      setCurrentPage(pageNumber);
    };

    return (
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            className={pageNumber === currentPage ? 'active' : ''}
            onClick={() => handleClick(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/chat');
        const jsonData = response.data;
        const drugChatData = {};
  
        drugs.forEach((drug) => {
          drugChatData[drug.Name] = {
            message: '',
            username: '',
            messages: jsonData.filter((message) => message.drug_id === drug.id),
          };
        });
  
        setChatData(drugChatData);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchChatData();
  }, [drugs]);
  
  useEffect(() => {
    filterDrugs(selectedCategory ? selectedCategory.value : null, inputLabel);
  }, [selectedCategory,  inputLabel]);

  return (
   <div className="App">
      <h1>薬品検索</h1>
      <div>
        <h4>薬効</h4>
        <Select
          options={categoryOptions}
          value={selectedCategory}
          onChange={handleSelectCategory}
          placeholder="薬効を選択又は入力"
          styles={customStyles}
          isClearable
        />
      </div>

      <div>
        <h4>フリーワード検索</h4>
        <input
          type="text"
          value={searchInputValue}
          onChange={handleSearchInputChange}
          placeholder="フリーワード検索"
        />
        {searchInputValue && ( 
            <button onClick={handleCancelSearch} >
              キャンセル
            </button>
          )}
         <button onClick={() => handleInputChange(searchInputValue)}>検索</button>
      </div>
      <h4>医薬品一覧</h4>
      <table>
        <thead>
          <tr>
            <th>分類</th>
            <th>医薬品名</th>
            <th>用法</th>
          </tr>
        </thead>
        <tbody>
          {paginatedFilteredDrugs.map((drug, index) => (
            <tr key={index}>
              <td>{drug.Category}</td>
              <td>
                {drug.Name}
                
                <Link to={`/drug/${drug.id}#review-${drug.id}-1`}>レビューへ移動</Link>

              </td>
              <td>{drug.Dose}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        totalItems={filteredDrugs.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <BrowserRouter>
       <Routes>
        <Route path="/drug/:drug_id" 
          element={<Review drugs={drugs} selectedDrug={selectedDrugWithChat} user={user}/>} />
        </Routes> 
      </BrowserRouter>
         <div className="sign-out-button">
           {user ? (
             <button onClick={signOut}>sign out</button>
           ) : (
             <h3>権限がありません</h3>
           )}
         </div>
       
     </div>
 );
};


export default withAuthenticator(App);