import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Auth } from "aws-amplify";

const DrugDetailPage = ({ drugs }) => {
  const { drug_id } = useParams();
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [chatData, setChatData] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await Auth.currentAuthenticatedUser();
        setUser(userData);
      } catch (error) {
        console.error("ユーザー情報の取得エラー:", error);
      }
    };

    
    const fetchDrugData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/drug');
        const jsonData = response.data;
        const selectedDrugData = jsonData.find((drug) => drug.id === Number(drug_id));
        setSelectedDrug(selectedDrugData);
      } catch (error) {
        console.error(error);
      }
    };

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

    fetchUserData();
    fetchDrugData();
    fetchChatData();
  }, [drug_id, drugs]);

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

  if (!selectedDrug) {
    return <p>該当の医薬品は見つかりませんでした。</p>;
  }

  const chatInfo = chatData[selectedDrug.Name];
  const { messages } = chatInfo || {};

  return (
    <div>
    <h2>{selectedDrug.Name}</h2>
    <h3>レビュー</h3>
    {messages && messages.length > 0 ? (
      <div>
        {/* アンカーリンクを追加 */}
        {messages.map((message, i) => (
          <div key={i} className="message" id={`review-${i+1}`}>
            <p>{message.text}</p>
            <p>(投稿日: {message.date} - {message.username})</p>
          </div>
        ))}
      </div>
    ) : (
      <p>投稿はありません。</p>
    )}
      <div className='message-input'>
        <input
          type="text"
          value={chatData[selectedDrug.Name]?.message || ''}
          onChange={(e) => handleChatMessageChange(e, selectedDrug.Name)}
          placeholder="メッセージ"
          style={{ width: "300px", height: "50px" }}
        />
      </div>
      <div>
        <button onClick={() => handleSendMessage(selectedDrug.Name)}>投稿</button>
      </div>
  
      <Link to="/">一覧ページに戻る</Link>
    </div>
  );
};

export default DrugDetailPage;
