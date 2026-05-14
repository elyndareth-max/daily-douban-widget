/**
 * Daily Douban 小组件
 * 
 * 豆瓣每日推荐电影小组件，支持小号和中号尺寸
 * 点击小组件可打开电影网页
 * 
 * @version 1.0.0
 * @author Scripting Agent
 */

import { VStack, HStack, Text, Image, Widget, Spacer, Link, fetch } from 'scripting'

// ==================== 农历转换函数 ====================
// 农历1949-2100年查询表
const lunarYearArr = [
  0x0b557, // 1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, // 2050-2059
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, // 2060-2069
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, // 2070-2079
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, // 2080-2089
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, // 2090-2099
  0x0d520 // 2100
]

const lunarMonth = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
const lunarDay = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '初', '廿']
const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 12生肖映射
const $12Animals: Record<string, string> = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
  '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
  '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
}

// 计算农历年是否有闰月
function hasLeapMonth(ly: number): number | boolean {
  return (ly & 0xf) ? (ly & 0xf) : false
}

// 如果有闰月，计算农历闰月天数
function leapMonthDays(ly: number): number {
  return hasLeapMonth(ly) ? ((ly & 0xf0000) ? 30 : 29) : 0
}

// 计算农历一年的总天数
function lunarYearDays(ly: number): number {
  let totalDays = 0
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    totalDays += (ly & i) ? 30 : 29
  }
  if (hasLeapMonth(ly)) {
    totalDays += leapMonthDays(ly)
  }
  return totalDays
}

// 获取农历每个月的天数
function lunarYearMonths(ly: number): number[] {
  const monthArr: number[] = []
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    monthArr.push((ly & i) ? 30 : 29)
  }
  if (hasLeapMonth(ly)) {
    monthArr.splice(hasLeapMonth(ly) as number, 0, leapMonthDays(ly))
  }
  return monthArr
}

// 将农历年转换为天干
function getTianGan(ly: number): string {
  let key = (ly - 3) % 10
  if (key === 0) key = 10
  return tianGan[key - 1]
}

// 将农历年转换为地支
function getDiZhi(ly: number): string {
  let key = (ly - 3) % 12
  if (key === 0) key = 12
  return diZhi[key - 1]
}

// 公历转农历函数
function sloarToLunar(sy: number, sm: number, sd: number) {
  sm -= 1
  let daySpan = (Date.UTC(sy, sm, sd) - Date.UTC(1949, 0, 29)) / (24 * 60 * 60 * 1000) + 1
  let ly: number, lm: number | string = 1, ld: number

  // 确定农历年份
  for (let j = 0; j < lunarYearArr.length; j++) {
    daySpan -= lunarYearDays(lunarYearArr[j])
    if (daySpan <= 0) {
      ly = 1949 + j
      daySpan += lunarYearDays(lunarYearArr[j])
      break
    }
  }

  // 确定农历月份
  for (let k = 0; k < lunarYearMonths(lunarYearArr[ly! - 1949]).length; k++) {
    daySpan -= lunarYearMonths(lunarYearArr[ly! - 1949])[k]
    if (daySpan <= 0) {
      if (hasLeapMonth(lunarYearArr[ly! - 1949]) && (hasLeapMonth(lunarYearArr[ly! - 1949]) as number) <= k) {
        if ((hasLeapMonth(lunarYearArr[ly! - 1949]) as number) < k) {
          lm = k
        } else if ((hasLeapMonth(lunarYearArr[ly! - 1949]) as number) === k) {
          lm = '闰' + k
        } else {
          lm = k + 1
        }
      } else {
        lm = k + 1
      }
      daySpan += lunarYearMonths(lunarYearArr[ly! - 1949])[k]
      break
    }
  }

  ld = daySpan

  // 转换月份为汉字
  if (hasLeapMonth(lunarYearArr[ly! - 1949]) && typeof lm === 'string' && lm.indexOf('闰') > -1) {
    lm = `闰${lunarMonth[/\d/.exec(lm as string)!.index - 1]}`
  } else {
    lm = lunarMonth[(lm as number) - 1]
  }

  // 转换年份为天干地支
  const lunarYear = getTianGan(ly!) + getDiZhi(ly!)

  // 转换日期为汉字
  let lunarDayStr: string
  if (ld < 11) {
    lunarDayStr = `${lunarDay[10]}${lunarDay[ld - 1]}`
  } else if (ld > 10 && ld < 20) {
    lunarDayStr = `${lunarDay[9]}${lunarDay[ld - 11]}`
  } else if (ld === 20) {
    lunarDayStr = `${lunarDay[1]}${lunarDay[9]}`
  } else if (ld > 20 && ld < 30) {
    lunarDayStr = `${lunarDay[11]}${lunarDay[ld - 21]}`
  } else if (ld === 30) {
    lunarDayStr = `${lunarDay[2]}${lunarDay[9]}`
  } else {
    lunarDayStr = `${ld}`
  }

  return { lunarYear, lunarMonth: lm as string, lunarDay: lunarDayStr }
}

// ==================== 数据获取 ====================
async function fetchDoubanDaily() {
  const url = 'https://www.imarkr.com/api/douban/daily'
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取豆瓣数据失败:', error)
    return {
      url: 'https://movie.douban.com',
      title: '加载失败',
      poster: '',
      rating: 0,
      subtitle: '',
      content: '无法获取数据，请检查网络连接'
    }
  }
}

// ==================== 小组件视图 ====================
function DoubanWidgetView({ data }: { data: any }) {
  const { width, height } = Widget.displaySize
  const family = Widget.family
  const isMedium = family === 'systemMedium'

  // 获取当前日期
  const now = new Date()
  const { lunarYear, lunarMonth, lunarDay } = sloarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate())

  // 格式化日期
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const dateStr = `${now.getDate()}`.padStart(2, '0')
  const monthWeekStr = `${monthNames[now.getMonth()]}｜${weekDays[now.getDay()]}`
  const animal = $12Animals[lunarYear[1]] || '龙'

  return (
    <Link url={data.url}>
      <VStack
        alignment="leading"
        spacing={8}
        widgetBackground={{
          gradient: [
            { color: '#192319', location: 0 },
            { color: '#192319', location: 0.5 },
            { color: '#192319', location: 1 }
          ],
          startPoint: { x: 0, y: 0 },
          endPoint: { x: 0, y: 1 }
        }}
        frame={{ width, height }}
      >
        {/* 背景图片 */}
        <Image
          imageUrl={data.poster}
          placeholder={
            <VStack widgetBackground="#333333" frame={{ width, height }} alignment="center">
              <Text foregroundStyle="white">加载中...</Text>
            </VStack>
          }
          resizable
          frame={{ width, height }}
        />

        {/* 渐变遮罩 */}
        <VStack
          widgetBackground="clear"
          overlay={{
            alignment: "bottom",
            content: (
              <VStack
                widgetBackground={{
                  gradient: [
                    { color: 'black', location: 0 },
                    { color: 'black', location: 0.5 },
                    { color: 'black', location: 1 }
                  ],
                  startPoint: { x: 0, y: 0 },
                  endPoint: { x: 0, y: 1 }
                }}
                frame={{ width, height }}
              />
            )
          }}
          frame={{ width, height }}
        />

        {/* 日期信息 */}
        <HStack alignment="center" spacing={8} padding={{ horizontal: 16, vertical: 12 }}>
          <Text font="largeTitle" foregroundStyle="white">{dateStr}</Text>
          <VStack alignment="leading" spacing={2}>
            <Text font="caption" foregroundStyle="white">{monthWeekStr}</Text>
            <Text font="caption" foregroundStyle="white">{animal}年{lunarMonth}月{lunarDay}</Text>
          </VStack>
          <Spacer />
        </HStack>

        {/* 电影信息 */}
        <Spacer />
        <VStack alignment="leading" spacing={8} padding={{ horizontal: 16, bottom: 16 }}>
          <Text font="headline" foregroundStyle="white" lineLimit={1} minScaleFactor={0.5}>
            《{data.title}》
          </Text>
          <HStack alignment="center" spacing={8}>
            <VStack
              padding={4}
              widgetBackground="systemGreen"
              clipShape={{ type: "rect", cornerRadius: 4, style: "continuous" }}
            >
              <Text font="caption2" foregroundStyle="white">
                豆瓣评分 {data.rating ? data.rating.toFixed(1) : '无'}
              </Text>
            </VStack>
            {isMedium && (
              <Text font="caption" foregroundStyle="white" lineLimit={1}>
                {data.subtitle.replace(/\n/g, ' / ')}
              </Text>
            )}
          </HStack>
          {isMedium && (
            <Text font="caption" foregroundStyle="white" lineLimit={2} minScaleFactor={0.5}>
              {data.content}
            </Text>
          )}
        </VStack>
      </VStack>
    </Link>
  )
}

// ==================== 主函数 ====================
async function main() {
  try {
    const data = await fetchDoubanDaily()
    Widget.present(<DoubanWidgetView data={data} />)
  } catch (error) {
    console.error('小组件渲染失败:', error)
    Widget.present(
      <VStack alignment="center" widgetBackground="systemRed" frame={{ width: 155, height: 155 }}>
        <Text foregroundStyle="white">加载失败</Text>
        <Text font="caption" foregroundStyle="white">请检查网络连接</Text>
      </VStack>
    )
  }
}

main()