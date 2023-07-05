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
  const [messages,setMessages] = useState([]);
  const [inputValue,setInputValue] = useState('');
  const [username,setUsername] = useState('');
  const [messageTitle,setMessageTitle] =useState('')
  const [chatMessage, setChatMessage] = useState('')
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/drug');
        const jsonData = response.data; // 受け取ったJSONデータ
        setDrugs(jsonData); // データを状態にセット
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
    setInputValue(e.target.value);
    search(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  }

  const handleMessageTitleChange = (e) => {
    setMessageTitle(e.target.value);
  }
  
  const handleChatMessageChange = (e) => {
    setChatMessage(e.target.value);
  };

  const handleSendMessage = () =>{
    if(chatMessage){
      const newMessage = {
        id:Date.now().toString(),
        title: messageTitle,
        text:chatMessage,
        date: new Date().toLocaleString(),
        username:username,
        replies:[],
      };
      setMessages([...messages,newMessage])
      setChatMessage("");
      setMessageTitle("")
      setUsername("")
    }
  };


  const handleReply = (messageId, targetId) => {
    const reply = window.prompt("返信メッセージを入力してください");
    if (reply) {
      const replyUsername = window.prompt("ユーザーネームを入力してください");
      if (replyUsername) {
        const now = new Date();
        const formattedDate = now.toLocaleString();
        const updatedMessages = messages.map((message) => {
          if (message.id === messageId) {
            return {
              ...message,
                 replies: [
                ...(message.replies || []),
                { text: reply, targetId: targetId, username: replyUsername,date: formattedDate },
              ],
            };
          }
          return message;
        });
        setMessages(updatedMessages);
      }
    }
  };
  
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
          </tr>
        </thead>
        <tbody>
          {drugs.map((drug, index) => (
            <tr key={index}>
              <td>{drug.Category}</td>
              <td>{drug.Name}</td>
              <td>{drug.Dose}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={signOut}>Sign out</button>
<h5>チャット</h5>
    <div>
      <ul>
      {messages.map((message) => (
  <li key={message.id} className="message">
    <h3>【{message.title}】</h3> 
    {message.text.split('\n').map((paragraph, index) => (
  <p key={index}>{paragraph}</p>
   ))}
     (投稿日: {message.date} - {message.username})
    
    <ul>
      {message.replies.map((reply, index) => {
          const targetMessage = messages.find((msg) => msg.id === reply.targetId);
          if (!targetMessage) return null;
          return (
            <li key={index} className ="reply">
              返信: {reply.text} (投稿日: {reply.date} - {reply.username})
            </li>
          );
        })}
    </ul>
    <button onClick={() => handleReply(message.id, message.id)}>返信する</button>
  </li>
))}

 </ul>
</div>
<input
  type="text"
  value={messageTitle}
  onChange={handleMessageTitleChange}
  placeholder="表題"
/>
<input
  type="text"
  value={chatMessage}
  onChange={handleChatMessageChange}
  placeholder="メッセージ"
/>
<input
  type="text"
  value={username}
  onChange={handleUsernameChange}
  placeholder="ユーザーネーム"
/>

<button onClick={handleSendMessage}>送信</button>

  </div>
  );
};

export default App;

