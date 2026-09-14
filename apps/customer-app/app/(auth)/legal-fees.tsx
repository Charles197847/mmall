import { ScrollView, Text } from 'react-native'
import { feeSchedule } from '../../lib/legalCopy'

export default function LegalFeesScreen() {
  return (
    <ScrollView className="flex-1 bg-void p-6">
      <Text className="text-xs text-mute">Legal</Text>
      <Text className="text-ice mt-2 mb-2" style={{ fontSize: 32, fontWeight: '300' }}>
        Fee schedule
      </Text>
      <Text className="text-sm text-mute mb-6">Last updated 13 September 2026</Text>
      {feeSchedule.map((section) => (
        <Text key={section} className="text-sm text-mute leading-6 mb-4">
          {section}
        </Text>
      ))}
    </ScrollView>
  )
}
