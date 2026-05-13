import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ChatPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [myId, setMyId] = useState("");

  // ======================
  // GET CURRENT USER
  // ======================
  useEffect(() => {
    const getMe = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/auth/user",
          { withCredentials: true }
        );
        setMyId(res.data._id);
      } catch (err) {
        console.log(err);
      }
    };

    getMe();
  }, []);

  // ======================
  // GET USERS
  // ======================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/post/getallfollowering",
          { withCredentials: true }
        );

        const data =
          res.data.following ||
          res.data.data ||
          res.data ||
          [];

        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, []);

  // ======================
  // CHECK STATUS
  // ======================
  const checkStatus = async (receiverId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/chat/status/${receiverId}`,
        { withCredentials: true }
      );

      setStatusMap((prev) => ({
        ...prev,
        [receiverId]: res.data.status,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    users.forEach((u) => {
      if (u.following?._id) {
        checkStatus(u.following._id);
      }
    });
  }, [users]);

  // ======================
  // SEND REQUEST
  // ======================
  const sendRequest = async (receiverId) => {
    try {
      await axios.post(
        "http://localhost:3000/api/chat/chat-request",
        { receiverId },
        { withCredentials: true }
      );

      setStatusMap((prev) => ({
        ...prev,
        [receiverId]: "PENDING",
      }));
    } catch (err) {
      console.log(err);
    }
  };

  // ======================
  // LOAD MESSAGES
  // ======================
  const loadMessages = async (receiverId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/chat/messages/${receiverId}`,
        { withCredentials: true }
      );

      setMessages(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ======================
  // SELECT USER
  // ======================
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    loadMessages(user.following._id);
  };

  // ======================
  // SEND MESSAGE
  // ======================
  const sendMessage = async () => {
    if (!message || !selectedUser) return;

    try {
      const res = await axios.post(
        "http://localhost:3000/api/chat/send",
        {
          receiverId: selectedUser.following._id,
          message,
        },
        { withCredentials: true }
      );

      setMessages((prev) => [...prev, res.data.data]);
      setMessage("");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  // ======================
  // UI
  // ======================
  return (
    <div className="h-screen flex bg-gray-100">

      {/* LEFT USERS */}
      <div className="w-[340px] bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Chats</h1>
        </div>

        {users.map((user) => {
          const u = user.following;
          const status = statusMap[u?._id];

          return (
            <div
              key={u?._id}
              onClick={() => handleSelectUser(user)}
              className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b"
            >
              <div>
                <h2 className="font-semibold">{u?.name}</h2>
                <p className="text-xs text-gray-500">
                  {status === "ACCEPTED"
                    ? "Tap to chat"
                    : status === "PENDING"
                    ? "Request sent"
                    : "Not connected"}
                </p>
              </div>

              {status !== "ACCEPTED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sendRequest(u._id);
                  }}
                  className="bg-indigo-500 text-white px-3 py-1 rounded"
                >
                  Request
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT CHAT */}
      <div className="flex-1 flex flex-col">

        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-gray-500 text-xl">
              Select a user to start chat
            </h2>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-3 border-b bg-white flex items-center gap-3">
              <img
                src={
                  selectedUser.following?.avatar ||
                  `https://ui-avatars.com/api/?name=${selectedUser.following?.name}`
                }

                className="w-10 h-10 rounded-full"
              />
              <h2 className="font-bold">
                {selectedUser.following.name}
              </h2>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col">

              {messages.map((msg) => {
                // 🔥 FINAL FIX (MOST IMPORTANT LINE)
                const isMe =
                  String(msg.sender?._id || msg.sender) === String(myId);

                return (
                  <div
                    key={msg._id}
                    className={`flex items-end gap-2 mb-3 w-full ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >

                    {/* LEFT AVATAR (OTHER USER) */}
                    {!isMe && (
                      <img
                        src={
                          msg.sender?.avatar ||
                          selectedUser.following?.avatar ||
                          `https://ui-avatars.com/api/?name=User`
                        }

                        className="w-8 h-8 rounded-full"
                      />
                    )}

                    {/* MESSAGE BOX */}
                    <div
                      className={`px-3 py-2 rounded-xl max-w-[60%] text-white break-words ${
                        isMe ? "bg-green-500" : "bg-gray-600"
                      }`}
                    >
                      {msg.message}
                    </div>

                    {/* RIGHT AVATAR (ME) */}
                    {isMe && (
                      <img
                        src={`https://ui-avatars.com/api/?name=Me`}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                  </div>
                );
              })}

            </div>

            {/* INPUT */}
            <div className="p-3 border-t bg-white flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
                placeholder="Type message..."
              />

              <button
                onClick={sendMessage}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}