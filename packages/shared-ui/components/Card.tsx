import { View, StyleSheet, type ViewProps } from 'react-native'

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
})
