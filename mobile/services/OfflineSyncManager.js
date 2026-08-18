import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

const SYNC_QUEUE_KEY = '@gamification_sync_queue';

/**
 * Offline Sync Manager for Rural/Low-Connectivity Environments
 * Stores gamification activities locally and syncs them to the backend when internet returns.
 */
class OfflineSyncManager {
  static async addActivityToQueue(activity) {
    try {
      const queueStr = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const queue = queueStr ? JSON.parse(queueStr) : [];
      
      const newActivity = {
        ...activity,
        activityId: activity.activityId || Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      
      queue.push(newActivity);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      
      // Attempt sync if we might have network
      this.attemptSync();
      
      return newActivity;
    } catch (e) {
      console.error('Failed to add to offline queue', e);
    }
  }

  static async getQueue() {
    try {
      const queueStr = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return queueStr ? JSON.parse(queueStr) : [];
    } catch (e) {
      return [];
    }
  }

  static async attemptSync() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        console.log('Skipping sync: Offline');
        return false;
      }

      const queue = await this.getQueue();
      if (queue.length === 0) return true;

      // Import the stored auth token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return false;

      // In a real app, this URL would come from env config
      const response = await fetch('http://10.0.2.2:5000/api/gamification/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activities: queue })
      });

      if (response.ok) {
        // Clear queue on success
        await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
        console.log(`Successfully synced ${queue.length} offline activities.`);
        return true;
      } else {
        console.log('Sync failed, will retry later.');
        return false;
      }
    } catch (e) {
      console.error('Error during sync attempt', e);
      return false;
    }
  }
}

export default OfflineSyncManager;
