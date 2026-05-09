import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ActivityContext = createContext(null);

const STORAGE_KEY = "@avity_activities";

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (!loadingActivities) {
      saveActivities(activities);
    }
  }, [activities, loadingActivities]);

  async function loadActivities() {
    try {
      const storedActivities = await AsyncStorage.getItem(STORAGE_KEY);

      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      }
    } catch (error) {
      console.log("Erro ao carregar atividades:", error);
    } finally {
      setLoadingActivities(false);
    }
  }

  async function saveActivities(data) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.log("Erro ao salvar atividades:", error);
    }
  }

  function addActivity(activity) {
    const newActivity = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: "scheduled",
      ...activity,
    };

    setActivities((prev) => [newActivity, ...prev]);
  }

  function clearActivities() {
    setActivities([]);
  }

  return (
    <ActivityContext.Provider
      value={{
        activities,
        loadingActivities,
        addActivity,
        clearActivities,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivityContext);

  if (!context) {
    throw new Error("useActivities precisa estar dentro de ActivityProvider");
  }

  return context;
}