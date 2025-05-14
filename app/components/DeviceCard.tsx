import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface DeviceCardProps {
  name: string;
  status: string;
}

export default function DeviceCard({ name, status }: DeviceCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text style={[styles.status, { color: status === 'On' ? COLORS.primary : COLORS.red }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: COLORS.gray,
    marginVertical: 5,
    borderRadius: 10,
  },
  name: {
    color: COLORS.darkGray,
    fontSize: 16,
  },
  status: {
    fontSize: 16,
  },
});