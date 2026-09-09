import { Pressable, Text, StyleSheet, type PressableProps } from 'react-native'

type ButtonProps = PressableProps & {
  title: string
  variant?: 'primary' | 'secondary' | 'danger'
}

const variants = {
  primary: { backgroundColor: '#2F6BFF', color: '#ffffff' },
  secondary: { backgroundColor: '#122044', color: '#E8EEFC' },
  danger: { backgroundColor: '#FF2D4A', color: '#ffffff' },
}

export function Button({ title, variant = 'primary', disabled, ...props }: ButtonProps) {
  const colors = variants[variant]
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={[styles.base, { backgroundColor: colors.backgroundColor, opacity: disabled ? 0.5 : 1 }]}
      {...props}
    >
      <Text style={[styles.label, { color: colors.color }]}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
  },
})
