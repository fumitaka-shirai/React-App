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
  const [username, setUsername] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatData, setChatData] = useState({});

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

  const selectCategory = (category) => {
    setSelectedCategory(category);
    filterDrugs(category, selectedDose);
  };

  const selectDose = (dose) => {
    setSelectedDose(dose);
    filterDrugs(selectedCategory, dose);
  };

  const filterDrugs = (category, dose) => {
    let filteredDrugs = drugs;

    if (category) {
      filteredDrugs = filteredDrugs.filter((drug) => drug.Category === category.label);
    }

    if (dose) {
      filteredDrugs = filteredDrugs.filter((drug) => drug.Dose === dose.label);
    }

    setDrugs(filteredDrugs);
  };

  const search = (label) => {
    setInputLabel(label);

    if (label !== '') {
      const searchedDrugs = drugs.filter(
        (drug) =>
          Object.values(drug).some(
            (item) =>
              item !== undefined &&
              item !== null &&
              typeof item === 'string' &&
              item.toUpperCase().includes(label.toUpperCase())
          )
      );
      setDrugs(searchedDrugs);
    } else {
      filterDrugs(selectedCategory, selectedDose);
    }
  };

  const handleInputChange = (e) => {
    setInputLabel(e.target.value);
    search(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleMessageTitleChange = (e) => {
    setMessageTitle(e.target.value);
  };

  const handleChatMessageChange = (e) => {
    setChatMessage(e.target.value);
  };

  const sendChatMessage = async (message, drugName) => {
    try {
      await axios.post('http://localhost:5000/api/chat');
      console.log('メッセージが送信されました。');
      setChatData((prevChatData) => {
        const updatedChatData = { ...prevChatData };
        updatedChatData[drugName] = [...(updatedChatData[drugName] || []), message];
        return updatedChatData;
      });
    } catch (error) {
      console.error('メッセージの送信中にエラーが発生しました。', error);
    }
  };

  const handleSendMessage = (drugName) => {
    if (chatMessage && messageTitle && username) {
      const newMessage = {
        id: Date.now().toString(),
        title: messageTitle,
        text: chatMessage,
        date: new Date().toLocaleString(),
        username: username,
        replies: [],
      };

      sendChatMessage(newMessage, drugName);
      setChatMessage('');
      setMessageTitle('');
      setUsername('');
    }
  };

  const handleReply = (drugName, messageId) => {
    const reply = window.prompt("返信メッセージを入力してください");
    if (reply) {
      const replyUsername = window.prompt("ユーザーネームを入力してください");
      if (replyUsername) {
        const now = new Date();
        const formattedDate = now.toLocaleString();
        const updatedDrugs = drugs.map((drug) => {
          if (drug.Name === drugName) {
            const updatedChat = (drug.chat || []).map((message) => {
              if (message.id === messageId) {
                return {
                  ...message,
                  replies: [
                    ...(message.replies || []),
                    { text: reply, username: replyUsername, date: formattedDate },
                  ],
                };
              }
              return message;
            });
            return { ...drug, chat: updatedChat };
          }
          return drug;
        });

        setDrugs(updatedDrugs);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/chat');
        const jsonData = response.data;
        setMessages(jsonData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>薬品検索</h1>
      <div>
        <h4>薬効</h4>
        <button key="all" onClick={() => selectCategory(null)}>全て</button>
        {categories.map((category, index) => (
          <button key={index} onClick={() => selectCategory({ label: category })}>
            {category}
          </button>
        ))}
      </div>

      <div>
        <h4>フリーワード検索</h4>
        <input type="text" value={inputLabel} onChange={handleInputChange} />

        <h4>絞り込み検索</h4>
        <h5>分類</h5>
        <Select
          closeMenuOnSelect={true}
          components={animatedComponents}
          onChange={selectCategory}
          options={[
            { label: '去痰薬' },
            { label: '抗生剤' },
            { label: '鎮痛薬' },
            { label: '抗アレルギー薬' },
            { label: '鎮咳薬' },
          ]}
          isClearable
        />

        <h5>用法</h5>
        <Select
          closeMenuOnSelect={true}
          components={animatedComponents}
          onChange={selectDose}
          options={[
            { label: '食後' },
            { label: '食前' },
            { label: '寝る前' },
            { label: 'なし' },
          ]}
          isClearable
        />
      </div>

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
          {drugs.map((drug, index) => (
            <tr key={index}>
              <td>{drug.Category}</td>
              <td>{drug.Name}</td>
              <td>{drug.Dose}</td>
              <td>
                {chatData[drug.Name] && chatData[drug.Name].length > 0 ? (
                  <div>
                    {chatData[drug.Name].map((message, i) => (
                      <div key={i} className="message">
                        <h3>【{message.title}】</h3>
                        {message.text.split("\n").map((paragraph, j) => (
                          <p key={j}>{paragraph}</p>
                        ))}
                        (投稿日: {message.date} - {message.username})
                        <ul>
                          {message.replies.map((reply, k) => (
                            <li key={k} className="reply">
                              返信: {reply.text} (投稿日: {reply.date} - {reply.username})
                            </li>
                          ))}
                        </ul>
                        
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>投稿はありません。</p>
                )}
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="メッセージ"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ユーザーネーム"
                />
                <input
                  type="text"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  placeholder="タイトル"
                />
                <button onClick={() => handleSendMessage(drug.Name)}>投稿</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={signOut}>Sign out</button>
      <div>
        <ul>
          {messages.map((message) => (
            <li key={message.id} className="message">
              <h3>【{message.title}】</h3>
              {message.text.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              (投稿日: {message.date} - {message.username})

            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
