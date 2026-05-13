import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import {
  FiSend,
  FiSearch,
  FiMoreVertical,
  FiMessageCircle,
  FiVolume2,
  FiCopy,
} from "react-icons/fi";

import { io } from "socket.io-client";

// ======================================
// SOCKET
// ======================================
const socket = io(
  "http://localhost:3000",
  {
    withCredentials: true,
  }
);

export default function ChatPage() {

  const [users, setUsers] =
    useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [statusMap, setStatusMap] =
    useState({});

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  const [myId, setMyId] =
    useState("");

  const [myAvatar, setMyAvatar] =
    useState("");

  const [soundEnabled, setSoundEnabled] =
    useState(false);

  const messagesEndRef =
    useRef(null);

  const audioRef =
    useRef(null);

  const notifiedMessages =
    useRef(new Set());

  // ======================================
  // ENABLE SOUND
  // ======================================
  const enableNotifications =
    async () => {

      try {

        if (
          "Notification" in window &&
          Notification.permission !==
            "granted"
        ) {

          await Notification.requestPermission();
        }

        if (audioRef.current) {

          await audioRef.current.play();

          audioRef.current.pause();

          audioRef.current.currentTime = 0;
        }

        setSoundEnabled(true);

      } catch (err) {

        console.log(err);
      }
    };

  // ======================================
  // AUTO SCROLL
  // ======================================
  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  // ======================================
  // GET CURRENT USER
  // ======================================
  useEffect(() => {

    const getMe = async () => {

      try {

        const res =
          await axios.get(
            "http://localhost:3000/api/auth/user",
            {
              withCredentials: true,
            }
          );

        setMyId(res.data._id);

        setMyAvatar(
          res.data.avatar ||
            `https://ui-avatars.com/api/?name=${res.data.name}&background=6366f1&color=fff`
        );

        socket.emit(
          "join",
          res.data._id
        );

      } catch (err) {

        console.log(err);
      }
    };

    getMe();

  }, []);

  // ======================================
  // ONLINE USERS
  // ======================================
  useEffect(() => {

    socket.on(
      "online_users",
      (users) => {

        setOnlineUsers(users);
      }
    );

    return () => {

      socket.off(
        "online_users"
      );
    };

  }, []);

  // ======================================
  // RECEIVE MESSAGE
  // ======================================
  useEffect(() => {

    socket.on(
      "receive_message",
      (newMessage) => {

        setMessages((prev) => {

          const exists =
            prev.find(
              (m) =>
                m._id ===
                newMessage._id
            );

          if (exists)
            return prev;

          return [
            ...prev,
            newMessage,
          ];
        });

        const senderId =
          String(
            newMessage.sender?._id ||
            newMessage.sender
          );

        if (
          senderId !== String(myId) &&
          !notifiedMessages.current.has(
            newMessage._id
          )
        ) {

          notifiedMessages.current.add(
            newMessage._id
          );

          if (
            soundEnabled &&
            audioRef.current
          ) {

            audioRef.current.currentTime = 0;

            audioRef.current.play()
              .catch((err) =>
                console.log(err)
              );
          }

          if (
            Notification.permission ===
            "granted"
          ) {

            new Notification(
              `New message from ${
                newMessage.sender?.name ||
                "User"
              }`,
              {
                body:
                  newMessage.message,

                icon:
                  newMessage.sender
                    ?.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/219/219983.png",
              }
            );
          }
        }
      }
    );

    return () => {

      socket.off(
        "receive_message"
      );
    };

  }, [myId, soundEnabled]);

  // ======================================
  // GET USERS
  // ======================================
  useEffect(() => {

    const fetchUsers =
      async () => {

        try {

          const res =
            await axios.get(
              "http://localhost:3000/api/post/getallfollowering",
              {
                withCredentials: true,
              }
            );

          const data =
            res.data.following ||
            res.data.data ||
            res.data ||
            [];

          setUsers(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (err) {

          console.log(err);
        }
      };

    fetchUsers();

  }, []);

  // ======================================
  // CHECK STATUS
  // ======================================
  const checkStatus =
    async (receiverId) => {

      try {

        const res =
          await axios.get(
            `http://localhost:3000/api/chat/status/${receiverId}`,
            {
              withCredentials: true,
            }
          );

        setStatusMap((prev) => ({
          ...prev,
          [receiverId]:
            res.data.status,
        }));

      } catch (err) {

        console.log(err);
      }
    };

  useEffect(() => {

    users.forEach((u) => {

      if (
        u?.following?._id
      ) {

        checkStatus(
          u.following._id
        );
      }
    });

  }, [users]);

  // ======================================
  // SEND REQUEST
  // ======================================
  const sendRequest =
    async (receiverId) => {

      try {

        await axios.post(
          "http://localhost:3000/api/chat/chat-request",
          { receiverId },
          {
            withCredentials: true,
          }
        );

        setStatusMap((prev) => ({
          ...prev,
          [receiverId]:
            "PENDING",
        }));

      } catch (err) {

        console.log(err);
      }
    };

  // ======================================
  // LOAD MESSAGES
  // ======================================
  const loadMessages =
    async (receiverId) => {

      try {

        const res =
          await axios.get(
            `http://localhost:3000/api/chat/messages/${receiverId}`,
            {
              withCredentials: true,
            }
          );

        setMessages(
          res.data.data || []
        );

      } catch (err) {

        console.log(err);
      }
    };

  // ======================================
  // SELECT USER
  // ======================================
  const handleSelectUser =
    (user) => {

      setSelectedUser(user);

      loadMessages(
        user.following._id
      );
    };

  // ======================================
  // SEND MESSAGE
  // ======================================
  const sendMessage =
    async () => {

      if (
        !message.trim() ||
        !selectedUser
      )
        return;

      try {

        const res =
          await axios.post(
            "http://localhost:3000/api/chat/send",
            {
              receiverId:
                selectedUser
                  .following
                  ._id,

              message,
            },
            {
              withCredentials: true,
            }
          );

        setMessages((prev) => {

          const exists =
            prev.find(
              (m) =>
                m._id ===
                res.data.data
                  ._id
            );

          if (exists)
            return prev;

          return [
            ...prev,
            res.data.data,
          ];
        });

        socket.emit(
          "send_message",
          res.data.data
        );

        setMessage("");

      } catch (err) {

        console.log(err);

        alert(
          err.response?.data
            ?.message ||
            "Failed to send message"
        );
      }
    };

  // ======================================
  // ENTER SEND
  // ======================================
  const handleKeyDown =
    (e) => {

      if (e.key === "Enter") {

        sendMessage();
      }
    };

  // ======================================
  // COPY MESSAGE
  // ======================================
  const copyMessage =
    (text) => {

      try {

        if (
          navigator.clipboard &&
          window.isSecureContext
        ) {

          navigator.clipboard.writeText(
            text
          );

        } else {

          const textArea =
            document.createElement(
              "textarea"
            );

          textArea.value =
            text;

          textArea.style.position =
            "fixed";

          textArea.style.left =
            "-999999px";

          document.body.appendChild(
            textArea
          );

          textArea.focus();

          textArea.select();

          document.execCommand(
            "copy"
          );

          textArea.remove();
        }

        alert(
          "Copied!"
        );

      } catch (err) {

        console.log(err);

        alert(
          "Copy failed"
        );
      }
    };

  return (
    <div className="h-screen flex bg-[#0f172a] overflow-hidden">

      {/* AUDIO */}
      <audio
        ref={audioRef}
        src="/sounds/mixkit-positive-notification-951.wav"
        preload="auto"
      />

      {/* SIDEBAR */}
      <div className="w-[340px] bg-[#111827] border-r border-gray-800 flex flex-col">

        {/* HEADER */}
        <div className="p-5 border-b border-gray-800">

          <h1 className="text-2xl font-bold text-white">
            Messages
          </h1>

          {!soundEnabled && (
            <button
              onClick={
                enableNotifications
              }
              className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl transition"
            >
              <FiVolume2 />
              Enable Notification Sound
            </button>
          )}

          {/* SEARCH */}
          <div className="mt-4 flex items-center gap-2 bg-[#1e293b] px-3 py-3 rounded-2xl">

            <FiSearch className="text-gray-400" />

            <input
              type="text"
              placeholder="Search users..."
              className="bg-transparent outline-none text-white w-full placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* USERS */}
        <div className="flex-1 overflow-y-auto">

          {users.map((user) => {

            const u =
              user?.following;

            if (!u)
              return null;

            const status =
              statusMap[u?._id];

            const isOnline =
              onlineUsers.includes(
                u?._id
              );

            return (
              <div
                key={u?._id}
                onClick={() =>
                  handleSelectUser(
                    user
                  )
                }
                className={`flex items-center justify-between p-4 border-b border-gray-800 cursor-pointer hover:bg-[#1e293b] transition ${
                  selectedUser
                    ?.following?._id ===
                  u?._id
                    ? "bg-[#1e293b]"
                    : ""
                }`}
              >

                <div className="flex items-center gap-3">

                  <div className="relative">

                    <img
                      className="w-12 h-12 rounded-full object-cover border border-gray-700"
                      src={
                        u?.avatar ||
                        `https://ui-avatars.com/api/?name=${u?.name}&background=6366f1&color=fff`
                      }
                      alt=""
                    />

                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111827]" />
                    )}
                  </div>

                  <div>

                    <h2 className="text-white font-semibold">
                      {u?.name}
                    </h2>

                    <p className="text-xs text-gray-400">
                      {isOnline
                        ? "Active now"
                        : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">

        {!selectedUser ? (

          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">

            <div className="w-24 h-24 rounded-full bg-[#1e293b] flex items-center justify-center mb-5">

              <FiMessageCircle
                className="text-indigo-500"
                size={40}
              />
            </div>

            <h1 className="text-4xl font-bold text-white">
              Your Messages
            </h1>

            <p className="text-gray-400 mt-3 max-w-md">
              Send private messages to your friends in realtime.
            </p>
          </div>

        ) : (
          <>

            {/* HEADER */}
            <div className="h-[75px] bg-[#111827] border-b border-gray-800 px-5 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="relative">

                  <img
                    src={
                      selectedUser
                        .following
                        ?.avatar ||
                      `https://ui-avatars.com/api/?name=${selectedUser.following?.name}&background=6366f1&color=fff`
                    }
                    alt=""
                    className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500"
                  />

                  {onlineUsers.includes(
                    selectedUser
                      .following
                      ._id
                  ) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111827]" />
                  )}
                </div>

                <div>

                  <h2 className="text-white font-semibold text-lg">
                    {
                      selectedUser
                        .following
                        .name
                    }
                  </h2>

                  <p
                    className={`text-sm ${
                      onlineUsers.includes(
                        selectedUser
                          .following
                          ._id
                      )
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {onlineUsers.includes(
                      selectedUser
                        .following
                        ._id
                    )
                      ? "Active now"
                      : "Offline"}
                  </p>
                </div>
              </div>

              <button className="text-white text-xl hover:text-indigo-400 transition">
                <FiMoreVertical />
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-5 py-5">

              <div className="flex flex-col gap-4">

                {messages.map((msg) => {

                  const isMe =
                    String(
                      msg.sender?._id ||
                      msg.sender
                    ) === String(myId);

                  const messageTime =
                    new Date(
                      msg.createdAt
                    ).toLocaleTimeString(
                      [],
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }
                    );

                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2 ${
                        isMe
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      {!isMe && (
                        <img
                          src={
                            msg.sender?.avatar ||
                            selectedUser.following?.avatar ||
                            `https://ui-avatars.com/api/?name=${selectedUser.following?.name}`
                          }
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-gray-600"
                        />
                      )}

                      <div className="flex flex-col max-w-[75%]">

                        {/* MESSAGE BOX */}
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-lg break-words text-sm ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-br-md"
                              : "bg-[#1e293b] text-white rounded-bl-md"
                          }`}
                        >

                          {/* LINK DETECTION */}
                          <p className="break-words">

                            {msg.message
                              .split(" ")
                              .map(
                                (
                                  word,
                                  index
                                ) => {

                                  const isLink =
                                    word.startsWith(
                                      "http://"
                                    ) ||
                                    word.startsWith(
                                      "https://"
                                    ) ||
                                    word.startsWith(
                                      "www."
                                    );

                                  if (
                                    isLink
                                  ) {

                                    let url =
                                      word;

                                    if (
                                      word.startsWith(
                                        "www."
                                      )
                                    ) {

                                      url =
                                        "https://" +
                                        word;
                                    }

                                    return (
                                      <a
                                        key={
                                          index
                                        }
                                        href={
                                          url
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`underline break-all transition ${
                                          isMe
                                            ? "text-blue-200 hover:text-white"
                                            : "text-blue-400 hover:text-blue-300"
                                        }`}
                                      >
                                        {
                                          word
                                        }{" "}
                                      </a>
                                    );
                                  }

                                  return (
                                    <span
                                      key={
                                        index
                                      }
                                    >
                                      {
                                        word
                                      }{" "}
                                    </span>
                                  );
                                }
                              )}
                          </p>
                        </div>

                        {/* TIME + COPY */}
                        <div
                          className={`flex items-center gap-2 mt-1 ${
                            isMe
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >

                          <span className="text-[11px] text-gray-400">
                            {
                              messageTime
                            }
                          </span>

                          <button
                            onClick={() =>
                              copyMessage(
                                msg.message
                              )
                            }
                            className="text-gray-400 hover:text-white transition flex items-center gap-1 text-[11px]"
                          >

                            <FiCopy
                              size={
                                12
                              }
                            />

                            Copy
                          </button>
                        </div>
                      </div>

                      {isMe && (
                        <img
                          src={
                            myAvatar ||
                            `https://ui-avatars.com/api/?name=Me`
                          }
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-indigo-500"
                        />
                      )}
                    </div>
                  );
                })}

                <div
                  ref={
                    messagesEndRef
                  }
                />
              </div>
            </div>

            {/* INPUT */}
            <div className="p-4 bg-[#111827] border-t border-gray-800">

              <div className="flex items-center gap-3 bg-[#1e293b] px-4 py-2 rounded-2xl">

                <input
                  type="text"
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target
                        .value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent outline-none text-white py-2 placeholder:text-gray-500"
                />

                <button
                  onClick={
                    sendMessage
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full transition"
                >

                  <FiSend />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}