import React, { useState, useEffect } from "react";
import "./App.css";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import axios from 'axios';

const App = ({ signOut }) => {
  const [drugs, setDrugs] = useState([]);
  const [inputLabel, setInputLabel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDose, setSelectedDose] = useState(null);
  const animatedComponents = makeAnimated();
  const [messages, setMessages] = useState([]);
  const [chatData, setChatData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100); // 1ページに表示する医薬品数
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/drug');
        const jsonData = response.data;
        setDrugs(jsonData);
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

  const handleSearch = () => {
    search(searchValue);
  };

  const search = (value) => {
    setSearchValue(value); // 検索値をセットする
    filterDrugs(selectedCategory ? selectedCategory.value : null, selectedDose, value);
  };

  const filterDrugs = (category, dose,label) => {
    let filteredDrugs = drugs;

    if (category) {
      filteredDrugs = filteredDrugs.filter((drug) => drug.Category === category);
    }

    if (dose) {
      filteredDrugs = filteredDrugs.filter((drug) => drug.Dose === dose.label);
    }

    if (label) {
      filteredDrugs = filteredDrugs.filter((drug) =>
        Object.values(drug).some(
          (item) =>
            item !== undefined &&
            item !== null &&
            typeof item === 'string' &&
            item.toUpperCase().includes(label.toUpperCase())
        )
      );
    }
    setFilteredDrugs(filteredDrugs);
};

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
  };
  
  const categoryOptions = [
    { value: null, label: 'すべて' },
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
    const username = chatData[drugName]?.username || '';
  
    if (chatMessage && username) {
      const newMessage = {
        text: chatMessage,
        date: new Date().toLocaleString(),
        username: username,
      };
  
      try {
        await axios.post('http://127.0.0.1:5000/api/chat', newMessage);
        console.log('メッセージが送信されました。');
        setChatData((prevChatData) => {
          const updatedChatData = { ...prevChatData };
          updatedChatData[drugName] = {
            message: '',
            username: '',
            messages: [
              ...(updatedChatData[drugName]?.messages || []),
              newMessage,
            ],
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

  const handleUsernameChange = (e, drugName) => {
    const value = e.target.value;
    setChatData((prevChatData) => ({
      ...prevChatData,
      [drugName]: {
        ...prevChatData[drugName],
        username: value,
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
        setChatData(jsonData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchChatData();
  }, []);

  useEffect(() => {
    filterDrugs(selectedCategory ? selectedCategory.value : null, selectedDose, inputLabel);
  }, [selectedCategory, selectedDose, inputLabel]);

  return (
    <div className="App">
      <h1>薬品検索</h1>
      <div>
        <h4>薬効</h4>
        <Select
          options={categoryOptions}
          value={selectedCategory}
          onChange={handleSelectCategory}
          placeholder="薬効を選択"
          styles={customStyles}
          isClearable
        />
      </div>

      <div>
      <h4>フリーワード検索</h4>
      <input
      type="text"
      value={searchValue}
      onChange={handleInputChange}
      placeholder="フリーワード検索"
      />
      <button onClick={handleSearch}>検索</button>
      </div>
      <h4>医薬品一覧</h4>
      <table>
  <thead>
    <tr>
      <th>分類</th>
      <th>医薬品名</th>
      <th>用法</th>
      <th>チャット</th>
    </tr>
  </thead>
  <tbody>
    {paginatedFilteredDrugs.map((drug, index) => (
      <tr key={index}>
        <td>{drug.Category}</td>
        <td>{drug.Name}</td>
        <td>{drug.Dose}</td>
        <td>
          {chatData[drug.Name]?.messages && chatData[drug.Name]?.messages.length > 0 ? (
            <div>
              {chatData[drug.Name].messages.map((message, i) => (
                <div key={i} className="message">
                  <p>{message.text}</p>
                  <p>(投稿日: {message.date} - {message.username})</p>
                  {message.replies && message.replies.map((reply, k) => (
                    <p key={k} className="reply">
                      返信: {reply.text} (投稿日: {reply.date} - {reply.username})
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p>投稿はありません。</p>
          )}
          <input
            type="text"
            value={chatData[drug.Name]?.message || ''}
            onChange={(e) => handleChatMessageChange(e, drug.Name)}
            placeholder="メッセージ"
          />
          <input
            type="text"
            value={chatData[drug.Name]?.username || ''}
            onChange={(e) => handleUsernameChange(e, drug.Name)}
            placeholder="ユーザーネーム"
          />
          <button onClick={() => handleSendMessage(drug.Name)}>投稿</button>
        </td>
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
<button onClick={signOut}>Sign out</button>

      
    </div>
  );
};

export default App;
