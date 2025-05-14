import { createContext, useContext, useState, ReactNode } from 'react';

interface Device {
  name: string;
  status: string;
  icon: string;
  canToggle: boolean;
}

interface Room {
  name: string;
  temperature: number;
  humidity: number;
  airQuality: number;
  devices: Device[];
}

interface DeviceContextType {
  rooms: Room[];
  updateDeviceStatus: (roomName: string, deviceName: string, status: string) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([
    {
      name: 'Phòng khách',
      temperature: 28,
      humidity: 85,
      airQuality: 65,
      devices: [
        { name: 'Đèn phòng khách', status: 'BẬT', icon: 'lightbulb', canToggle: true },
        { name: 'Quạt phòng khách', status: 'TẮT', icon: 'air', canToggle: true },
        { name: 'Cửa chính', status: 'ĐÓNG', icon: 'door-front', canToggle: false },
        { name: 'Cảm biến khí', status: 'TỐT', icon: 'warning', canToggle: false },
        { name: 'Ánh sáng', status: '500 LUX', icon: 'brightness-5', canToggle: false },
      ],
    },
  ]);

  const updateDeviceStatus = (roomName: string, deviceName: string, status: string) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.name === roomName) {
          return {
            ...room,
            devices: room.devices.map((device) =>
              device.name === deviceName ? { ...device, status } : device
            ),
          };
        }
        return room;
      })
    );
  };

  return (
    <DeviceContext.Provider value={{ rooms, updateDeviceStatus }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDeviceContext = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDeviceContext must be used within a DeviceProvider');
  }
  return context;
};