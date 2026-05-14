/**
 * Daily Douban 小组件
 * 豆瓣每日推荐电影小组件
 */

import { 
  VStack, HStack, Text, Image, Widget, Spacer, Link, 
  ZStack, fetch 
} from 'scripting'

// ==================== 农历转换 ====================
const lunarYearArr = [
  0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520
]

const lunarMonthNames = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
const lunarDayArr = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

function hasLeapMonth(ly: number): number | boolean {
  return (ly & 0xf) ? (ly & 0xf) : false
}

function leapMonthDays(ly: number): number {
  return hasLeapMonth(ly) ? ((ly & 0xf0000) ? 30 : 29) : 0
}

function lunarYearDays(ly: number): number {
  let total = 0
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    total += (ly & i) ? 30 : 29
  }
  if (hasLeapMonth(ly)) total += leapMonthDays(ly)
  return total
}

function lunarYearMonths(ly: number): number[] {
  const months: number[] = []
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    months.push((ly & i) ? 30 : 29)
  }
  if (hasLeapMonth(ly)) {
    months.splice(hasLeapMonth(ly) as number, 0, leapMonthDays(ly))
  }
  return months
}

function sloarToLunar(sy: number, sm: number, sd: number) {
  sm -= 1
  let daySpan = (Date.UTC(sy, sm, sd) - Date.UTC(1949, 0, 29)) / (24 * 60 * 60 * 1000) + 1
  let ly = 1949, lm = 1, ld = 1

  for (let j = 0; j < lunarYearArr.length; j++) {
    daySpan -= lunarYearDays(lunarYearArr[j])
    if (daySpan <= 0) {
      ly = 1949 + j
      daySpan += lunarYearDays(lunarYearArr[j])
      break
    }
  }

  const months = lunarYearMonths(lunarYearArr[ly - 1949])
  for (let k = 0; k < months.length; k++) {
    daySpan -= months[k]
    if (daySpan <= 0) {
      lm = k + 1
      daySpan += months[k]
      break
    }
  }

  ld = Math.floor(daySpan)

  // 处理闰月
  const leapMonth = hasLeapMonth(lunarYearArr[ly - 1949])
  let monthStr: string
  if (leapMonth && typeof leapMonth === 'number' && lm > leapMonth) {
    monthStr = lunarMonthNames[lm - 2] || lunarMonthNames[0]
  } else if (leapMonth && typeof leapMonth === 'number' && lm === leapMonth + 1) {
    monthStr = '闰' + lunarMonthNames[leapMonth - 1]
  } else {
    monthStr = lunarMonthNames[lm - 1] || lunarMonthNames[0]
  }

  const tg = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const dz = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const animals: Record<string, string> = {
    '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
    '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
    '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
  }

  let tgKey = (ly - 3) % 10
  if (tgKey === 0) tgKey = 10
  let dzKey = (ly - 3) % 12
  if (dzKey === 0) dzKey = 12
  const yearStr = tg[tgKey - 1] + dz[dzKey - 1]
  const animal = animals[dz[dzKey - 1]] || '龙'
  const dayStr = lunarDayArr[ld - 1] || `初${ld}`

  return { year: yearStr, month: monthStr, day: dayStr, animal }
}

// ==================== 数据获取 ====================
async function fetchDoubanDaily() {
  try {
    const response = await fetch('https://www.imarkr.com/api/douban/daily')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('获取数据失败:', error)
    return null
  }
}

// ==================== 小组件 ====================
function WidgetView({ data }: { data: any }) {
  const { width, height } = Widget.displaySize
  const family = Widget.family
  const isMedium = family === 'systemMedium'

  const now = new Date()
  const lunar = sloarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate())
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const dateStr = `${now.getDate()}`.padStart(2, '0')
  const monthStr = `${now.getMonth() + 1}月`
  const weekStr = `周${weekDays[now.getDay()]}`

  if (!data) {
    return (
      <VStack alignment="center" widgetBackground="#1a1a1a" frame={{ width, height }}>
        <Text foregroundStyle="white" font="body">加载失败</Text>
        <Text foregroundStyle="gray" font="caption">请检查网络</Text>
      </VStack>
    )
  }

  return (
    <Link url={data.url}>
      <ZStack
        frame={{ width, height }}
        widgetBackground="#111111"
      >
        {/* 背景海报 */}
        <Image
          imageUrl={data.poster}
          resizable
          scaleToFill
          frame={{ width, height }}
        />

        {/* 暗色遮罩 */}
        <VStack
          widgetBackground={{
            gradient: [
              { color: 'rgba(0,0,0,0.3)', location: 0 },
              { color: 'rgba(0,0,0,0.7)', location: 0.5 },
              { color: 'rgba(0,0,0,0.9)', location: 1 }
            ],
            startPoint: { x: 0.5, y: 0 },
            endPoint: { x: 0.5, y: 1 }
          }}
          frame={{ width, height }}
        />

        {/* 内容 */}
        <VStack
          alignment="leading"
          frame={{ width, height }}
          padding={16}
        >
          {/* 顶部日期 */}
          <HStack alignment="center">
            <Text font="largeTitle" foregroundStyle="white">{dateStr}</Text>
            <VStack alignment="leading" spacing={0}>
              <Text font="caption" foregroundStyle="white">{monthStr} {weekStr}</Text>
              <Text font="caption2" foregroundStyle="white" opacity={0.7}>
                {lunar.animal}年 {lunar.month}月{lunar.day}
              </Text>
            </VStack>
          </HStack>

          <Spacer />

          {/* 底部电影信息 */}
          <VStack alignment="leading" spacing={6}>
            <Text font="headline" foregroundStyle="white" lineLimit={1} minScaleFactor={0.6}>
              《{data.title}》
            </Text>
            <HStack spacing={6}>
              <HStack
                spacing={4}
                padding={{ horizontal: 8, vertical: 3 }}
                widgetBackground="systemGreen"
                clipShape={{ type: "rect", cornerRadius: 4, style: "continuous" }}
              >
                <Text font="caption2" foregroundStyle="white">豆瓣</Text>
                <Text font="caption2" foregroundStyle="white" bold>{data.rating?.toFixed(1) || '-'}</Text>
              </HStack>
              {isMedium && data.subtitle && (
                <Text font="caption" foregroundStyle="white" opacity={0.8} lineLimit={1}>
                  {data.subtitle.split('\n')[0]}
                </Text>
              )}
            </HStack>
            {isMedium && data.content && (
              <Text font="caption" foregroundStyle="white" opacity={0.7} lineLimit={2} minScaleFactor={0.7}>
                {data.content}
              </Text>
            )}
          </VStack>
        </VStack>
      </ZStack>
    </Link>
  )
}

// ==================== 主入口 ====================
async function main() {
  const data = await fetchDoubanDaily()
  Widget.present(<WidgetView data={data} />)
}

main()
