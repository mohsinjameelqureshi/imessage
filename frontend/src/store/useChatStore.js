import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => {
  return {
    users: [],
    conversations: [],
    messages: [],
    selectedUser: null,
    isConversationsLoading: false,
    isUsersLoading: false,
    isMessagesLoading: false,
    activeConversationId: null,
    searchQuery: "",
    sidebarTab: "chats",
    composerText: "",
    isSoundEnabled: true,
    isSendingMedia: false,

    getUsers: async () => {
      set({ isUserLoading: true });
      try {
        const res = await axiosInstance.get("/messages/users");
        set((state) => ({
          users: res.data,
          selectedUser:
            state.selectedUser &&
            res.data.some((user) => user._id === state.selectedUser._id)
              ? state.selectedUser
              : null,
        }));
      } catch (error) {
        console.log("Error in get Users", error.messages);
      } finally {
        set({ isUserLoading: false });
      }
    },

    getConversations: async () => {
      set({ isConversationsLoading: true });
      try {
        const res = await axiosInstance.get("/messages/conversations");
        set({ conversations: res.data });
      } catch (error) {}
    },
  };
});
